export function hasRealContent(text: string): boolean {
  const s = text.replace(/\s+/g, '');
  if (!s) return true;
  const letters = (s.match(/[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9]/g) ?? []).length;
  return letters / s.length >= 0.5;
}

export function isRepetitive(text: string): boolean {
  return /(.)\1{4,}/.test(text);
}

export function isGibberish(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  let bad = 0, counted = 0;
  for (const word of words) {
    if (/([a-záéíóú]\d|\d[a-záéíóú]){2,}/i.test(word)) { bad++; counted++; continue; }
    const clean = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
    if (/\d/.test(word) && clean.length >= 1 && clean.length <= 3 && word.length <= 4) { bad++; counted++; continue; }
    if (clean.length < 3) continue;
    counted++;
    if (!/[aeiouáéíóú]/.test(clean)) { bad++; continue; }
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(clean)) { bad++; continue; }
    if ((clean.match(/[qwx]/g) ?? []).length / clean.length > 0.35) { bad++; continue; }
    if (/^(.{2,4})\1+$/.test(clean)) { bad++; continue; }
    if (clean.length <= 4 && /[bcdfghjklmnpqrstvwxyz]{3,}/.test(clean)) { bad++; continue; }
  }
  return counted > 0 && bad / counted > 0.5;
}
