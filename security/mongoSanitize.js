const { removeEmptyObjects } = require('./_cleanup');

function stripDangerousKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach((k) => {
    if (k.startsWith('$') || k.includes('.')) {
      delete obj[k];
      return;
    }
    const v = obj[k];
    if (v && typeof v === 'object') stripDangerousKeys(v);
  });
  return obj;
}

module.exports = (req, _res, next) => {
  if (req.body) {
    stripDangerousKeys(req.body);
    removeEmptyObjects(req.body);
  }

  if (req.params) {
    stripDangerousKeys(req.params);
    removeEmptyObjects(req.params);
  }

  // ⚠️ Express 5: req.query is getter-only → make a safe copy
  req.safeQuery = stripDangerousKeys({ ...(req.query || {}) });
  removeEmptyObjects(req.safeQuery);

  next();
};
