/**
 * Helper to log rate limiting events consistently in a structured JSON format.
 */
export const logRateLimitEvent = ({
  event = 'RATE_LIMIT_EXCEEDED',
  ip,
  userId,
  email,
  endpoint,
  limiterType,
  attemptCount,
  appliedDelayMs
}) => {
  const logData = {
    event,
    timestamp: new Date().toISOString(),
    ip,
    ...(userId && { userId }),
    ...(email && email !== 'noemail' && { email }),
    endpoint,
    limiterType,
    ...(attemptCount !== undefined && { attemptCount }),
    ...(appliedDelayMs !== undefined && { appliedDelayMs })
  };

  // Output as structured JSON to warn so log aggregators can parse it
  console.warn(JSON.stringify(logData));
};
