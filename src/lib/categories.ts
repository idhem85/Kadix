import { COMMON_PRODUCTS } from '../types';

/** Guess the category of a product by its name */
export function guessCategory(name: string): string {
  const normalized = name.toLowerCase().trim();

  for (const [category, products] of Object.entries(COMMON_PRODUCTS)) {
    if (
      products.some(
        (p) =>
          p.toLowerCase().includes(normalized) ||
          normalized.includes(p.toLowerCase())
      )
    ) {
      return category;
    }
  }

  // Secondary check: try matching individual words
  const words = normalized.split(/\s+/);
  for (const [category, products] of Object.entries(COMMON_PRODUCTS)) {
    for (const product of products) {
      const productWords = product.toLowerCase().split(/\s+/);
      const matchCount = words.filter((w) =>
        productWords.some(
          (pw) =>
            pw.includes(w) ||
            w.includes(pw) ||
            (w.length > 3 && pw.includes(w.substring(0, 3)))
        )
      ).length;
      if (matchCount >= Math.min(1, words.length)) {
        return category;
      }
    }
  }

  return 'Autre';
}
