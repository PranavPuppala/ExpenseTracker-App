// frontend/src/lib/constants.js

/* ------------------------------------------------------------------
   Authentication
   ------------------------------------------------------------------ */
export const ACCESS_TOKEN  = "access_token";   // localStorage key
export const REFRESH_TOKEN = "refresh_token";  // localStorage key

/* ------------------------------------------------------------------
   Expense categories
   ------------------------------------------------------------------ */
export const CATEGORY_OPTIONS = [
  "GROCERIES",
  "UTILITIES",
  "ENTERTAINMENT",
  "TRANSPORTATION",
  "DINING_OUT",
  "HEALTHCARE",
  "HOUSING",
  "EDUCATION",
  "OTHER",
];

/* Exact palette copied from backend/expenses/colors.py */
export const CATEGORY_COLORS = {
  GROCERIES:      "#0f7b46", // deep forest-green
  UTILITIES:      "#d4a200", // rich metallic-gold
  ENTERTAINMENT:  "#d42a2a", // bold crimson-red
  TRANSPORTATION: "#083d7c", // dark navy-blue
  DINING_OUT:     "#6b3ac9", // vibrant royal-purple
  HEALTHCARE:     "#00b6c7", // bright teal/cyan
  HOUSING:        "#8a5a2d", // warm coffee-brown
  EDUCATION:      "#1e88e5", // clean medium-blue
  OTHER:          "#ffffff", // neutral white
};

/* ------------------------------------------------------------------
   UI presets
   ------------------------------------------------------------------ */
export const DATE_RANGE_PRESETS = [
  { label: "Last 7 days",  minDays: 6 },
  { label: "Last 30 days", minDays: 29 },
  { label: "Last Year",    minDays: 365 },
];

export const PAGE_SIZE = 20;                // default page size for listings
