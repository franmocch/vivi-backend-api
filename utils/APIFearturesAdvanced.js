const AppError = require('./appError');

const OP_MAP = { gt: '$gt', gte: '$gte', lt: '$lt', lte: '$lte' };

// --- Helpers for coercion ---
function coerceNumber(v, fieldName) {
  const n = Number(v);
  if (Number.isNaN(n))
    throw new AppError(`${fieldName} must be a number.`, 400);
  return n;
}

function coerceBoolean(v, fieldName) {
  const s = String(v).toLowerCase();
  if (s === 'true') return true;
  if (s === 'false') return false;
  throw new AppError(`${fieldName} must be boolean (true|false).`, 400);
}

function coerceDate(v, fieldName) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime()))
    throw new AppError(`${fieldName} must be a valid date.`, 400);
  return d;
}

function parseRange(obj, fieldName, coerceFn) {
  // Supports ?field[gte]=...&field[lte]=...
  const out = {};
  for (const k of Object.keys(obj || {})) {
    if (!OP_MAP[k]) continue;
    out[OP_MAP[k]] = coerceFn(obj[k], fieldName);
  }
  if (Object.keys(out).length === 0) {
    throw new AppError(`${fieldName} range must include gte/gt/lte/lt.`, 400);
  }
  return out;
}

class APIFeatures {
  /**
   * @param {Object} query - Mongoose query
   * @param {Object} queryString - Express req.query
   * @param {Object} options - filterConfig + defaultFields
   */
  constructor(query, queryString, options = {}) {
    this.query = query;
    this.queryString = queryString;
    this.filterConfig = options.filterConfig || {};
    this.defaultFields = options.defaultFields || '';
  }

  // Filtering
  filter() {
    const queryObj = {};

    Object.entries(this.filterConfig).forEach(([field, config]) => {
      if (this.queryString[field] === undefined) return;
      const raw = this.queryString[field];

      if (config.type === 'exact') {
        const value = String(raw).trim();
        if (config.minLength && value.length < config.minLength) {
          throw new AppError(
            `${field} must be at least ${config.minLength} characters.`,
            400
          );
        }
        queryObj[field] = value;
        return;
      }

      if (config.type === 'prefix') {
        const value = String(raw).trim();
        if (config.minLength && value.length < config.minLength) {
          throw new AppError(
            `${field} must be at least ${config.minLength} characters.`,
            400
          );
        }
        queryObj[field] = {
          $regex: `^${this.escapeRegExp(value)}`,
          $options: 'i',
        };
        return;
      }

      if (config.type === 'regex') {
        const value = String(raw).trim();
        if (config.minLength && value.length < config.minLength) {
          throw new AppError(
            `${field} must be at least ${config.minLength} characters.`,
            400
          );
        }
        queryObj[field] = { $regex: this.escapeRegExp(value), $options: 'i' };
        return;
      }

      if (config.type === 'number') {
        queryObj[field] = coerceNumber(raw, field);
        return;
      }

      if (config.type === 'boolean') {
        queryObj[field] = coerceBoolean(raw, field);
        return;
      }

      if (config.type === 'range') {
        if (typeof raw !== 'object' || raw === null) {
          throw new AppError(
            `${field} range must be provided as ${field}[gte|gt|lte|lt]=value`,
            400
          );
        }
        queryObj[field] = parseRange(raw, field, coerceNumber);
        return;
      }

      if (config.type === 'dateRange') {
        if (typeof raw !== 'object' || raw === null) {
          throw new AppError(
            `${field} dateRange must be ${field}[gte|gt|lte|lt]=ISODate`,
            400
          );
        }
        queryObj[field] = parseRange(raw, field, coerceDate);
        return;
      }

      if (config.type === 'in') {
        const value = typeof raw === 'string' ? raw : String(raw);
        const items = value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (!items.length)
          throw new AppError(`${field}[in] cannot be empty.`, 400);
        queryObj[field] = { $in: items };
        return;
      }

      // fallback
      queryObj[field] = raw;
    });

    this.query = this.query.find(queryObj);
    return this;
  }

  // Sorting (?sort=field or ?sort=-field)
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  // Field limiting (?fields=field1,field2)
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else if (this.defaultFields) {
      this.query = this.query.select(this.defaultFields);
    }
    return this;
  }

  // Pagination (?page=2&limit=10)
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // Escape regex
  escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = APIFeatures;
