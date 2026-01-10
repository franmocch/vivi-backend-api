const AppError = require('./appError');

class APIFeatures {
  /**
   * Create a new APIFeatures instance
   * @param {Object} query - Mongoose query (e.g. User.find())
   * @param {Object} queryString - Express req.query (parsed query params)
   * @param {Object} options - Configuration for this resource
   *   options.filterConfig: { field: { type: 'regex'|'prefix'|'exact', minLength?: number } }
   *     - Defines which query params are allowed and how to filter them
   *   options.defaultFields: string
   *     - Space separated list of fields to return by default
   */
  constructor(query, queryString, options = {}) {
    this.query = query; // Base Mongoose query
    this.queryString = queryString; // Raw query params from client
    this.filterConfig = options.filterConfig || {}; // Allowed filters with rules
    this.defaultFields = options.defaultFields || ''; // Fields to return by default
  }

  /**
   * Apply filtering rules based on filterConfig
   * - type: 'prefix' → regex match at the start (e.g. /^mo/i)
   * - type: 'regex'  → regex match anywhere (e.g. /fra/i matches "franco")
   * - type: 'exact'  → exact equality match
   * - minLength      → optional minimum number of characters required
   */
  filter() {
    const queryObj = {};

    Object.entries(this.filterConfig).forEach(([field, config]) => {
      // Only process if the field is present in query params
      if (this.queryString[field] !== undefined) {
        const value = String(this.queryString[field]).trim();

        // Validate minimum length if defined
        if (config.minLength && value.length < config.minLength) {
          throw new AppError(
            `${field} must be at least ${config.minLength} characters.`,
            400
          );
        }

        // Build MongoDB query depending on filter type
        if (config.type === 'prefix') {
          queryObj[field] = {
            $regex: `^${this.escapeRegExp(value)}`,
            $options: 'i', // case-insensitive
          };
        } else if (config.type === 'regex') {
          queryObj[field] = {
            $regex: this.escapeRegExp(value),
            $options: 'i',
          };
        } else {
          // Default: exact match
          queryObj[field] = value;
        }
      }
    });

    // Apply filters to the Mongoose query
    this.query = this.query.find(queryObj);
    return this;
  }

  /**
   * Sorting results
   * Example: ?sort=lastName,-email
   * - Multiple fields can be separated by comma
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  /**
   * Limit the fields returned in the response
   * Example: ?fields=name,email
   * - If no "fields" param, return defaultFields
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else if (this.defaultFields) {
      this.query = this.query.select(this.defaultFields);
    }
    return this;
  }

  /**
   * Pagination
   * Example: ?page=2&limit=10
   * - page=2, limit=10 → skips first 10 results, returns results 11-20
   */
  paginate() {
    const page = this.queryString.page * 1 || 1; // current page
    const limit = this.queryString.limit * 1 || 100; // results per page
    const skip = (page - 1) * limit; // how many results to skip

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /**
   * Escape regex special characters to prevent regex injection
   * Example: user input "mo." → becomes "mo\."
   */
  escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = APIFeatures;
