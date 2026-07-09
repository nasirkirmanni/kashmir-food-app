export const EXPLORER_CONFIG = {
  MAX_LEVEL: 10,
  MAX_RECENT_ACTIVITY: 20,
  CURRENT_MULTIPLIER: 1,
  CURRENT_SOURCE: "STANDARD" // Change to "DOUBLE_XP_WEEKEND", etc. during events
};

export const XP_RULES = {
  CREATE_ACCOUNT: 10,
  SAVE_DISH: 5,
  SAVE_RESTAURANT: 5,
  SAVE_DESTINATION: 5,
  SAVE_ITINERARY: 8,
  VIEW_PAGE: 2,
  READ_ARTICLE: 5,
  FIRST_AI_CHAT: 5,
  LONG_AI_CHAT: 2,
  REVIEW: 15,
  COMPLETE_ITINERARY: 20,
  DAILY_LOGIN_STREAK: [2, 3, 4, 5, 5] // Index corresponds to streak-1 (0 is day 1). Caps at 5.
};

// Cumulative thresholds
export const LEVEL_THRESHOLDS = [
  { level: 0, title: "New Explorer", xp: 0 },
  { level: 1, title: "Curious Traveler", xp: 100 },
  { level: 2, title: "Food Explorer", xp: 250 },
  { level: 3, title: "Cultural Explorer", xp: 500 },
  { level: 4, title: "Valley Explorer", xp: 900 },
  { level: 5, title: "Wazwan Enthusiast", xp: 1400 },
  { level: 6, title: "Heritage Explorer", xp: 2100 },
  { level: 7, title: "Kashmir Expert", xp: 3000 },
  { level: 8, title: "Cultural Ambassador", xp: 4200 },
  { level: 9, title: "Wazwan Master", xp: 5700 },
  { level: 10, title: "Legend of Kashmir", xp: 7500 },
];

export const CHALLENGES = [
  {
    id: "FIRST_BITE",
    action: "SAVE_DISH",
    target: 1,
    rewardXP: 20
  },
  {
    id: "FOOD_EXPLORER",
    action: "SAVE_DISH",
    target: 25,
    rewardXP: 50
  },
  {
    id: "SRINAGAR_EXPLORER",
    action: "VIEW_DESTINATION",
    target: 10,
    rewardXP: 75
  },
  {
    id: "TASTE_OF_TRADITION",
    action: "SAVE_DISH", // Will be extended in Phase 2 for specific dishes
    target: 5,
    rewardXP: 50
  },
  {
    id: "HISTORY_BUFF",
    action: "READ_ARTICLE",
    target: 5,
    rewardXP: 50
  },
  {
    id: "AI_APPRENTICE",
    action: "LONG_AI_CHAT",
    target: 7,
    rewardXP: 50
  }
];
