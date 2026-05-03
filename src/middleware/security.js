const mutationWindowMs = 3000;
const mutationStore = new Map();

const loginAttemptsStore = new Map();
const loginWindowMs = 60 * 1000;
const loginMaxAttempts = 5;
const loginBlockMs = 5 * 60 * 1000;

function cleanupMapByTime(map, now) {
  for (const [key, value] of map.entries()) {
    if (value.expiresAt && value.expiresAt < now) {
      map.delete(key);
    }
  }
}

function mutationCooldown(req, res, next) {
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
    return next();
  }

  const now = Date.now();
  const userPart = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
  const key = `${userPart}:${req.method}:${req.path}`;
  const lastAt = mutationStore.get(key);

  if (lastAt && now - lastAt < mutationWindowMs) {
    const waitSeconds = Math.ceil((mutationWindowMs - (now - lastAt)) / 1000);
    return res.status(429).json({
      error: `Слишком частые действия. Повторите через ${waitSeconds} сек.`
    });
  }

  mutationStore.set(key, now);
  return next();
}

function loginAttemptLimiter(req, res, next) {
  const now = Date.now();
  cleanupMapByTime(loginAttemptsStore, now);

  const key = `login:${req.ip}`;
  const state = loginAttemptsStore.get(key);

  if (state?.blockedUntil && state.blockedUntil > now) {
    const waitSeconds = Math.ceil((state.blockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Слишком много попыток входа. Повторите через ${waitSeconds} сек.`
    });
  }

  req.loginLimiterKey = key;
  return next();
}

function registerLoginFailure(key) {
  const now = Date.now();
  const state = loginAttemptsStore.get(key);

  if (!state || now > state.windowStart + loginWindowMs) {
    loginAttemptsStore.set(key, {
      attempts: 1,
      windowStart: now
    });
    return;
  }

  const nextAttempts = state.attempts + 1;
  const nextState = {
    ...state,
    attempts: nextAttempts
  };

  if (nextAttempts >= loginMaxAttempts) {
    nextState.blockedUntil = now + loginBlockMs;
    nextState.expiresAt = nextState.blockedUntil;
  }

  loginAttemptsStore.set(key, nextState);
}

function clearLoginFailures(key) {
  loginAttemptsStore.delete(key);
}

function resetRateLimitStoresForTests() {
  mutationStore.clear();
  loginAttemptsStore.clear();
}

module.exports = {
  mutationCooldown,
  loginAttemptLimiter,
  registerLoginFailure,
  clearLoginFailures,
  resetRateLimitStoresForTests
};
