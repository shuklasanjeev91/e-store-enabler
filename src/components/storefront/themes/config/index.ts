// Master Theme Configuration Index
// Exports all 80 category-optimized themes

import { THEME_CONFIGS as CORE_CONFIGS, CategoryThemeConfig } from "./themeConfig";
import { BOOKS_CONFIGS, KIDS_CONFIGS } from "./booksKidsThemes";
import { AYURVEDIC_CONFIGS, JEWELRY_CONFIGS } from "./ayurvedicJewelryThemes";
import { HOME_CONFIGS, BEAUTY_CONFIGS } from "./homeBeautyThemes";
import { SPORTS_CONFIGS, PETS_CONFIGS } from "./sportsPetsThemes";
import { AUTOMOTIVE_CONFIGS, HEALTH_CONFIGS } from "./autoHealthThemes";
import { ART_CONFIGS, GARDEN_CONFIGS, TRAVEL_CONFIGS } from "./artGardenTravelThemes";

// Combine all theme configs (80 total)
export const ALL_THEME_CONFIGS: Record<string, CategoryThemeConfig> = {
  ...CORE_CONFIGS,        // Fashion (5) + Grocery (5) + Electronics (5) = 15
  ...BOOKS_CONFIGS,       // 5
  ...KIDS_CONFIGS,        // 5
  ...AYURVEDIC_CONFIGS,   // 5
  ...JEWELRY_CONFIGS,     // 5
  ...HOME_CONFIGS,        // 5
  ...BEAUTY_CONFIGS,      // 5
  ...SPORTS_CONFIGS,      // 5
  ...PETS_CONFIGS,        // 5
  ...AUTOMOTIVE_CONFIGS,  // 5
  ...HEALTH_CONFIGS,      // 5
  ...ART_CONFIGS,         // 5
  ...GARDEN_CONFIGS,      // 5
  ...TRAVEL_CONFIGS,      // 5
  // Total: 80 themes
};

export function getThemeConfig(themeId: string): CategoryThemeConfig | undefined {
  return ALL_THEME_CONFIGS[themeId];
}

export function getThemesByCategory(categoryId: string): CategoryThemeConfig[] {
  return Object.values(ALL_THEME_CONFIGS).filter(t => t.category === categoryId);
}

export function getAllThemes(): CategoryThemeConfig[] {
  return Object.values(ALL_THEME_CONFIGS);
}

export type { CategoryThemeConfig } from "./themeConfig";
