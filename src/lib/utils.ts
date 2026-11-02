import { createCn } from "cn/config";

/**
 * Merge conditional class names and resolve conflicting Tailwind utilities.
 * Our custom type scale (globals.css `--text-*`) is registered as font sizes so that
 * e.g. `cn("text-base", "text-h4")` keeps only `text-h4` instead of treating it as a colour.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "h4", "lead", "eyebrow"] }],
    },
  },
});

/** Format an amount in the platform currency (INR by default). */
export function formatPrice(amount: number, currency = "INR", locale = "en-IN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
