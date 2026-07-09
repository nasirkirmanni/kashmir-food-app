import { ExplorerEvent } from "../models/ExplorerEvent.js";
import { User } from "../models/User.js";
import { EXPLORER_CONFIG, XP_RULES, LEVEL_THRESHOLDS, CHALLENGES } from "../config/explorerConfig.js";

// Helper to calculate level from total XP
export function calculateProgression(totalXP) {
  let currentLevelObj = LEVEL_THRESHOLDS[0];
  let nextLevelObj = LEVEL_THRESHOLDS[1];
  
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xp) {
      currentLevelObj = LEVEL_THRESHOLDS[i];
      nextLevelObj = LEVEL_THRESHOLDS[i + 1] || null;
    } else {
      break;
    }
  }

  let progressPercentage = 100;
  let xpUntilNext = 0;
  
  if (nextLevelObj) {
    const xpInLevel = totalXP - currentLevelObj.xp;
    const xpRequiredForLevel = nextLevelObj.xp - currentLevelObj.xp;
    progressPercentage = (xpInLevel / xpRequiredForLevel) * 100;
    xpUntilNext = nextLevelObj.xp - totalXP;
  }

  return {
    level: currentLevelObj.level,
    title: currentLevelObj.title,
    progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
    xpUntilNext: Math.max(0, xpUntilNext),
    nextLevel: nextLevelObj ? nextLevelObj.level : null,
    nextTitle: nextLevelObj ? nextLevelObj.title : null
  };
}

/**
 * Core engine to process an action and award XP
 */
export async function processEvent(user, action, entityType = null, entityId = null) {
  // 1. Determine base XP
  const baseXP = XP_RULES[action];
  if (baseXP === undefined) return null; // Invalid action

  // 2. Prevent Duplicates (Anti-spam)
  // For actions that should only happen once per entity (e.g. SAVE_DISH, VIEW_RESTAURANT)
  if (entityId) {
    const existing = await ExplorerEvent.findOne({ userId: user._id, action, entityId });
    if (existing) {
      return { xpAwarded: 0, reason: "duplicate" }; // Already awarded
    }
  }

  // 3. Apply Multipliers
  const multiplier = EXPLORER_CONFIG.CURRENT_MULTIPLIER;
  const xpAwarded = baseXP * multiplier;

  // 4. Record Event
  const event = new ExplorerEvent({
    userId: user._id,
    action,
    entityType,
    entityId,
    baseXP,
    multiplier,
    xpAwarded,
    source: EXPLORER_CONFIG.CURRENT_SOURCE
  });
  await event.save();

  // 5. Update User XP
  const oldProgression = calculateProgression(user.totalXP);
  user.totalXP += xpAwarded;
  
  // 6. Evaluate Challenges (Phase 2 logic stubbed - counts total events of this type)
  let challengeCompleted = null;
  const applicableChallenges = CHALLENGES.filter(c => c.action === action);
  
  for (const challenge of applicableChallenges) {
    // Check if already completed
    if (user.achievements && user.achievements.some(a => a.id === challenge.id)) {
      continue;
    }
    
    // Count how many times they've done this action
    const count = await ExplorerEvent.countDocuments({ userId: user._id, action });
    
    // Check if challenge met
    if (count >= challenge.target) {
      // Award challenge completion
      if (!user.achievements) user.achievements = [];
      user.achievements.push({ id: challenge.id, unlockedAt: new Date() });
      challengeCompleted = challenge.id;
      
      // Award Challenge Bonus XP
      user.totalXP += (challenge.rewardXP * multiplier);
      
      const challengeEvent = new ExplorerEvent({
        userId: user._id,
        action: "CHALLENGE_COMPLETED",
        entityType: "challenge",
        entityId: null, // Could store string in entityType or make entityId generic
        baseXP: challenge.rewardXP,
        multiplier,
        xpAwarded: challenge.rewardXP * multiplier,
        source: EXPLORER_CONFIG.CURRENT_SOURCE
      });
      await challengeEvent.save();
    }
  }

  await user.save();
  const newProgression = calculateProgression(user.totalXP);

  // 7. Generate Reward Payload
  const payload = {
    xpAwarded: user.totalXP - (oldProgression.level === newProgression.level ? oldProgression.xpUntilNext * -1 : 0), // Calculate raw delta
    levelUp: newProgression.level > oldProgression.level,
    newLevel: newProgression.level,
    achievementUnlocked: challengeCompleted // Simplified for now
  };
  
  // Precise xp delta
  payload.xpAwarded = xpAwarded + (challengeCompleted ? CHALLENGES.find(c=>c.id===challengeCompleted).rewardXP * multiplier : 0);

  return payload;
}

/**
 * Evaluate Daily Login Streak
 */
export async function processDailyLogin(user) {
  const now = new Date();
  
  // Normalize dates to midnight for easy comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let lastLogin = user.lastDailyLogin ? new Date(user.lastDailyLogin) : null;
  let lastLoginDay = lastLogin ? new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate()) : null;

  if (lastLoginDay && lastLoginDay.getTime() === today.getTime()) {
    return null; // Already logged in today
  }

  // Calculate streak
  let streak = user.dailyStreak || 0;
  
  if (lastLoginDay && today.getTime() - lastLoginDay.getTime() === 86400000) {
    // Consecutive day
    streak += 1;
  } else {
    // Missed a day (or first time)
    streak = 1;
  }

  user.dailyStreak = streak;
  user.lastDailyLogin = now;

  // Calculate XP based on array [2,3,4,5,5...]
  const ruleArr = XP_RULES.DAILY_LOGIN_STREAK;
  const baseXP = streak <= ruleArr.length ? ruleArr[streak - 1] : ruleArr[ruleArr.length - 1];
  
  const multiplier = EXPLORER_CONFIG.CURRENT_MULTIPLIER;
  const xpAwarded = baseXP * multiplier;

  const event = new ExplorerEvent({
    userId: user._id,
    action: "DAILY_LOGIN",
    baseXP,
    multiplier,
    xpAwarded,
    source: EXPLORER_CONFIG.CURRENT_SOURCE
  });
  await event.save();

  const oldProgression = calculateProgression(user.totalXP);
  user.totalXP += xpAwarded;
  await user.save();
  const newProgression = calculateProgression(user.totalXP);

  return {
    xpAwarded,
    levelUp: newProgression.level > oldProgression.level,
    newLevel: newProgression.level,
    streak: user.dailyStreak
  };
}
