const fs = require('fs');

const baseline = JSON.parse(fs.readFileSync('frontend/lighthouse-login-baseline.json', 'utf8'));
const post = JSON.parse(fs.readFileSync('frontend/lighthouse-login-post.json', 'utf8'));

const getScores = (data) => {
  return {
    performance: Math.round(data.categories.performance.score * 100),
    accessibility: Math.round(data.categories.accessibility.score * 100),
    bestPractices: Math.round(data.categories['best-practices'].score * 100),
    seo: Math.round(data.categories.seo.score * 100)
  };
};

const scoresBaseline = getScores(baseline);
const scoresPost = getScores(post);

console.log("Baseline Scores:");
console.table(scoresBaseline);

console.log("Post-Implementation Scores:");
console.table(scoresPost);

let hasRegression = false;
for (const key in scoresBaseline) {
  if (scoresPost[key] < scoresBaseline[key] - 2) { // 2 point threshold for minor fluctuations
    console.log(`Regression found in ${key}: ${scoresBaseline[key]} -> ${scoresPost[key]}`);
    hasRegression = true;
  }
}

if (!hasRegression) {
  console.log("SUCCESS: No regressions found.");
}
