// security/_cleanup.js
exports.removeEmptyObjects = function removeEmptyObjects(obj) {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      // Recurse
      exports.removeEmptyObjects(v);
      // If became empty {}, delete it
      if (Object.keys(v).length === 0) delete obj[k];
    }
  });
};
