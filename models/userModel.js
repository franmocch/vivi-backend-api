const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const hashToken = require('../security/hashToken ');

const onlyLetters = (v) => /^[\p{L}\s'-]+$/u.test(v || ''); // letters  unicode + space/'-

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An User must have a name'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Maximum 50 characters'],
      validate: [onlyLetters, 'Name must contain only letters'],
    },
    lastName: {
      type: String,
      required: [true, 'An User must have a lastname'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Maximum 50 characters'],
      validate: [onlyLetters, 'Last name must contain only letters'],
    },
    email: {
      type: String,
      required: [true, 'An User must have an email'],
      unique: true,
      trim: true,
      maxlength: [50, 'Maximum 50 characters'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'An User must have a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords do not match',
      },
      select: false,
    },

    role: {
      type: String,

      enum: {
        values: ['user', 'moderator', 'admin', 'superadmin'],
        message: 'Role must be user, moderator, admin or superadmin',
      },
      default: 'user',
    },
    idType: {
      type: String,
      required: [true, 'A user must have an ID type'],
      enum: {
        values: ['National ID', 'PASSPORT'],
        message: 'ID  type must be either National ID or PASSPORT',
      },
    },
    idNumber: {
      type: String,
      required: [true, 'An User must have ID '],
      trim: true,
      maxlength: [20, 'Maximum 20 characters'],
      uppercase: true,
      validate: {
        validator: function (v) {
          if (this.idType === 'National ID')
            return validator.isNumeric(v, { no_symbols: true });
          if (this.idType === 'PASSPORT')
            return validator.isAlphanumeric(v, 'en-US');
          return false;
        },
        message: 'Invalid ID number for the selected idType',
      },
    },
    birthDate: {
      type: Date,
      required: [true, 'An User must have a birth date'],
      validate: {
        validator: function (value) {
          const cutoff = new Date();
          cutoff.setFullYear(cutoff.getFullYear() - 18);
          return value <= cutoff;
        },
        message: 'User must be at least 18 years old',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

userSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;

  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) {
    age -= 1;
  }

  return age;
});
userSchema.pre(/^find/, function (next) {
  // This middleware automatically filters out all users whose "active" field is set to false.
  this.find({ active: true });
  next();
});

userSchema.pre('save', async function (next) {
  // Only runs if password was  already modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // Delete confirmed password
  this.passwordConfirm = undefined;

  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // Set a small offset so the token iat is always before this time
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('idType') && !this.isModified('idNumber')) return next();

  // normalizer
  if (typeof this.idNumber === 'string') {
    this.idNumber = this.idNumber.trim().toUpperCase();
  }

  // Check db
  const exists = await this.constructor.exists({
    idType: this.idType,
    idNumber: this.idNumber,
    _id: { $ne: this._id },
  });

  if (exists) {
    return next(
      new AppError(
        `This ID (${this.idType} ${this.idNumber}) is already registered`,
        400
      )
    );
  }

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );

    // If password was changed after the token was issued, return true
    return changedTimestamp > JWTTimestamp;
  }
  // Not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store a hashed version in DB (never store raw token)
  this.passwordResetToken = hashToken(resetToken);

  // Token valid for 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken; // return raw token to send via email
};
const User = mongoose.model('User', userSchema);
module.exports = User;
