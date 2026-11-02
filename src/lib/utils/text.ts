/** Lower-cases text and strips accents so searches are forgiving ("Hôtel" matches "hotel"). */
export function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}
