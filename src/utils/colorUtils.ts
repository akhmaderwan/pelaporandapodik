/**
 * Checks if a hex color is light or dark based on YIQ luminance.
 * Returns true if the color is light (requiring dark text for readability), 
 * and false if it is dark (requiring light text).
 */
export function isLightColor(hexColor?: string): boolean {
  if (!hexColor) return false; // Default teal-700 is dark
  
  // Clean hex
  const hex = hexColor.replace('#', '').trim();
  if (hex.length !== 3 && hex.length !== 6) return false;
  
  let r = 0, g = 0, b = 0;
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  // standard YIQ formula (weights for human eye perception of RGB)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // A threshold of 145 is standard for good contrast and readability
  return yiq >= 145;
}

/**
 * Returns the appropriate text color class for high contrast against the given background.
 */
export function getContrastTextColor(hexColor?: string): string {
  return isLightColor(hexColor) ? 'text-slate-900' : 'text-white';
}

/**
 * Returns a muted/subtle text color class that remains readable against the background.
 */
export function getContrastMutedTextColor(hexColor?: string): string {
  return isLightColor(hexColor) ? 'text-slate-600' : 'text-teal-100/90';
}

/**
 * Returns a background utility class for small cards/badges that adapts to light/dark background themes.
 */
export function getContrastBadgeBg(hexColor?: string): string {
  return isLightColor(hexColor) ? 'bg-slate-900/10 text-slate-800' : 'bg-white/15 text-white';
}

/**
 * Returns a border styling class that is legible and clean against the chosen theme.
 */
export function getContrastBorderColor(hexColor?: string): string {
  return isLightColor(hexColor) ? 'border-slate-900/10' : 'border-white/15';
}

/**
 * Hex color helper to calculate a slightly darker hex color for hover states or gradient stops.
 */
export function adjustHexColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '').trim();
  if (hex.length !== 6) return hexColor;
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  r = Math.min(255, Math.max(0, Math.round(r * (1 + percent / 100))));
  g = Math.min(255, Math.max(0, Math.round(g * (1 + percent / 100))));
  b = Math.min(255, Math.max(0, Math.round(b * (1 + percent / 100))));
  
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}
