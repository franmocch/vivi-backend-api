const sanitizeHtml = require('sanitize-html');
const { removeEmptyObjects } = require('./_cleanup');

const clean = (v) =>
  typeof v === 'string'
    ? sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} })
    : v;

const deepClean = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (Array.isArray(v))
      obj[k] = v.map((x) => (typeof x === 'object' ? deepClean(x) : clean(x)));
    else if (v && typeof v === 'object') obj[k] = deepClean(v);
    else obj[k] = clean(v);
  });
  return obj;
};

module.exports = (req, _res, next) => {
  if (req.body) {
    deepClean(req.body);
    removeEmptyObjects(req.body);
  }

  if (req.params) {
    deepClean(req.params);
    removeEmptyObjects(req.params);
  }

  // ⚠️ Express 5: do not reassign req.query → use safeQuery copy
  req.safeQuery = deepClean({ ...(req.query || {}) });
  removeEmptyObjects(req.safeQuery);

  next();
};
