import mongoose from "mongoose";
import assert from "node:assert";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { User } from "../models/User.js";
import { ExplorerEvent } from "../models/ExplorerEvent.js";
import { processEvent, processDailyLogin, calculateProgression } from "../utils/explorer.js";

async function runTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Cleaning up old test data...");
  await User.deleteMany({ email: "test_explorer@wazwanway.com" });
  
  let user = new User({
    name: "Test Explorer",
    email: "test_explorer@wazwanway.com",
    password: "password123",
    phoneNumber: "1234567890"
  });
  await user.save();
  await ExplorerEvent.deleteMany({ userId: user._id });

  try {
    console.log("Test 1: Progression Calculation");
    const prog0 = calculateProgression(0);
    assert.strictEqual(prog0.level, 0);
    assert.strictEqual(prog0.progressPercentage, 0);

    const prog50 = calculateProgression(50);
    assert.strictEqual(prog50.level, 0);
    assert.strictEqual(prog50.progressPercentage, 50);

    const prog100 = calculateProgression(100);
    assert.strictEqual(prog100.level, 1);
    assert.strictEqual(prog100.progressPercentage, 0);

    const prog175 = calculateProgression(175);
    assert.strictEqual(prog175.level, 1);
    assert.strictEqual(prog175.progressPercentage, 50); // (175-100)/(250-100) = 75/150 = 50%

    console.log("Test 2: Basic Action XP");
    const payload1 = await processEvent(user, "SAVE_RESTAURANT", "restaurant", new mongoose.Types.ObjectId());
    assert.strictEqual(payload1.xpAwarded, 5);
    assert.strictEqual(user.totalXP, 5);

    console.log("Test 3: Anti-Spam (Duplicate Prevention)");
    const duplicateId = new mongoose.Types.ObjectId();
    const payload2 = await processEvent(user, "SAVE_RESTAURANT", "restaurant", duplicateId);
    assert.strictEqual(payload2.xpAwarded, 5);
    
    // Call again with same ID
    const payload3 = await processEvent(user, "SAVE_RESTAURANT", "restaurant", duplicateId);
    assert.strictEqual(payload3.xpAwarded, 0);
    assert.strictEqual(payload3.reason, "duplicate");

    console.log("Test 4: Daily Login Streak");
    const login1 = await processDailyLogin(user);
    assert.strictEqual(login1.streak, 1);
    assert.strictEqual(login1.xpAwarded, 2);

    // Fake last login to yesterday
    user.lastDailyLogin = new Date(Date.now() - 86400000);
    await user.save();
    
    const login2 = await processDailyLogin(user);
    assert.strictEqual(login2.streak, 2);
    assert.strictEqual(login2.xpAwarded, 3);
    
    console.log("Test 5: Challenges Evaluation");
    user.totalXP = 0; // Reset
    await ExplorerEvent.deleteMany({ userId: user._id });
    
    // We need 1 SAVE_DISH to hit FIRST_BITE
    const payloadChallenge = await processEvent(user, "SAVE_DISH", "dish", new mongoose.Types.ObjectId());
    assert.strictEqual(payloadChallenge.achievementUnlocked, "FIRST_BITE");
    // Should give 5 (base) + 20 (challenge) = 25 XP
    assert.strictEqual(payloadChallenge.xpAwarded, 25);
    assert.strictEqual(user.totalXP, 25);

    console.log("All tests passed successfully! 🎉");
  } catch (error) {
    console.error("Test failed!", error);
  } finally {
    console.log("Cleaning up...");
    await User.deleteMany({ email: "test_explorer@wazwanway.com" });
    await ExplorerEvent.deleteMany({ userId: user._id });
    await mongoose.disconnect();
  }
}

runTests();
