/**
 * Filter an object so that it only contains allowed fields
 * @param {Object} obj - Original object (e.g., req.body)
 * @param  {...string} allowedFields - List of allowed field names
 * @returns {Object} New object containing only allowed fields
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

module.exports = filterObj;
