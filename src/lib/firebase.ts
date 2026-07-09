import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, SchoolProfile, AdminUser } from '../types';
import { DEFAULT_SCHOOL_PROFILE, DEFAULT_STUDENTS } from '../data';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from config as the third argument
export const db = initializeFirestore(
  app, 
  {}, 
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export const auth = getAuth(app);

// Error handling based on Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firestore Collection References
const STUDENTS_COLL = 'students';
const PROFILE_COLL = 'school_profile';
const PROFILE_DOC_ID = 'info';
const NOTES_COLL = 'resolution_notes';
const ADMINS_COLL = 'admins';

/**
 * Fetch school profile from Firestore.
 * If not exists, seeds it with DEFAULT_SCHOOL_PROFILE.
 */
export async function getSchoolProfile(): Promise<SchoolProfile> {
  const profileRef = doc(db, PROFILE_COLL, PROFILE_DOC_ID);
  try {
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data() as SchoolProfile;
    } else {
      // Seed default profile
      try {
        await setDoc(profileRef, DEFAULT_SCHOOL_PROFILE);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${PROFILE_COLL}/${PROFILE_DOC_ID}`);
      }
      return DEFAULT_SCHOOL_PROFILE;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('{"error"')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, `${PROFILE_COLL}/${PROFILE_DOC_ID}`);
  }
}

/**
 * Save school profile to Firestore.
 */
export async function updateSchoolProfile(profile: SchoolProfile): Promise<void> {
  const profileRef = doc(db, PROFILE_COLL, PROFILE_DOC_ID);
  try {
    await setDoc(profileRef, profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PROFILE_COLL}/${PROFILE_DOC_ID}`);
  }
}

/**
 * Fetch all students from Firestore.
 * If collection is empty, seeds it with DEFAULT_STUDENTS.
 */
export async function getStudents(): Promise<Student[]> {
  const studentsCollRef = collection(db, STUDENTS_COLL);
  try {
    const snap = await getDocs(studentsCollRef);
    
    if (!snap.empty) {
      const studentsList: Student[] = [];
      snap.forEach((docSnap) => {
        studentsList.push(docSnap.data() as Student);
      });
      return studentsList;
    } else {
      // Seed default students
      try {
        const batch = writeBatch(db);
        DEFAULT_STUDENTS.forEach((student) => {
          const docRef = doc(db, STUDENTS_COLL, student.id);
          batch.set(docRef, student);
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, STUDENTS_COLL);
      }
      return DEFAULT_STUDENTS;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('{"error"')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, STUDENTS_COLL);
  }
}

/**
 * Save or update a student in Firestore.
 */
export async function saveStudent(student: Student): Promise<void> {
  const docRef = doc(db, STUDENTS_COLL, student.id);
  try {
    await setDoc(docRef, student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENTS_COLL}/${student.id}`);
  }
}

/**
 * Save multiple students in Firestore (batch).
 */
export async function saveStudentsBatch(students: Student[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    students.forEach((student) => {
      const docRef = doc(db, STUDENTS_COLL, student.id);
      batch.set(docRef, student);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STUDENTS_COLL);
  }
}

/**
 * Delete a student from Firestore.
 */
export async function removeStudent(studentId: string): Promise<void> {
  const docRef = doc(db, STUDENTS_COLL, studentId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENTS_COLL}/${studentId}`);
  }
}

/**
 * Fetch all resolution notes from Firestore.
 */
export async function getResolutionNotes(): Promise<Record<string, string>> {
  const notesCollRef = collection(db, NOTES_COLL);
  try {
    const snap = await getDocs(notesCollRef);
    const notesMap: Record<string, string> = {};
    snap.forEach((docSnap) => {
      notesMap[docSnap.id] = docSnap.data().notes || '';
    });
    return notesMap;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, NOTES_COLL);
  }
}

/**
 * Save a resolution note to Firestore.
 */
export async function saveResolutionNote(errorId: string, notes: string): Promise<void> {
  const docRef = doc(db, NOTES_COLL, errorId);
  try {
    await setDoc(docRef, { notes });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${NOTES_COLL}/${errorId}`);
  }
}

/**
 * Fetch all admin users from Firestore.
 * If empty, seeds with the default administrator.
 */
export async function getFirestoreAdmins(): Promise<AdminUser[]> {
  const adminsCollRef = collection(db, ADMINS_COLL);
  try {
    const snap = await getDocs(adminsCollRef);
    if (!snap.empty) {
      const adminsList: AdminUser[] = [];
      snap.forEach((docSnap) => {
        adminsList.push(docSnap.data() as AdminUser);
      });
      return adminsList;
    } else {
      // Seed default admin
      const defaultAdmins: AdminUser[] = [
        {
          id: 'admin-1783065544727',
          username: 'bekecotanyut',
          password: 'erwan123',
          nama: 'AKHMAD ERWAN',
          createdAt: new Date().toISOString()
        }
      ];
      try {
        const batch = writeBatch(db);
        defaultAdmins.forEach((admin) => {
          const docRef = doc(db, ADMINS_COLL, admin.id);
          batch.set(docRef, admin);
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, ADMINS_COLL);
      }
      return defaultAdmins;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('{"error"')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, ADMINS_COLL);
  }
}

/**
 * Save or update an admin in Firestore.
 */
export async function saveFirestoreAdmin(admin: AdminUser): Promise<void> {
  const docRef = doc(db, ADMINS_COLL, admin.id);
  try {
    await setDoc(docRef, admin);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMINS_COLL}/${admin.id}`);
  }
}

/**
 * Delete an admin from Firestore.
 */
export async function removeFirestoreAdmin(adminId: string): Promise<void> {
  const docRef = doc(db, ADMINS_COLL, adminId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMINS_COLL}/${adminId}`);
  }
}
