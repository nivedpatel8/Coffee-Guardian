const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT Configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || "fallback-secret-key-change-in-production",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
};

// Security Configuration
const securityConfig = {
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 6,
  requirePasswordComplexity: false,
};

// Token Types
const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
  RESET_PASSWORD: "reset_password",
  EMAIL_VERIFICATION: "email_verification",
};

/**
 * Generate JWT Token
 * @param {Object} payload - Token payload
 * @param {String} type - Token type (access, refresh, etc.)
 * @param {String} expiresIn - Token expiration
 * @returns {String} JWT token
 */
const generateToken = (
  payload,
  type = TOKEN_TYPES.ACCESS,
  expiresIn = null
) => {
  const tokenPayload = {
    ...payload,
    type,
    iat: Math.floor(Date.now() / 1000),
  };

  const options = {
    expiresIn:
      expiresIn ||
      (type === TOKEN_TYPES.REFRESH
        ? jwtConfig.refreshExpiresIn
        : jwtConfig.expiresIn),
  };

  return jwt.sign(tokenPayload, jwtConfig.secret, options);
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @param {String} expectedType - Expected token type
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, expectedType = TOKEN_TYPES.ACCESS) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (expectedType && decoded.type !== expectedType) {
      throw new Error("Invalid token type");
    }

    return {
      valid: true,
      decoded,
      expired: false,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        valid: false,
        decoded: null,
        expired: true,
        error: "Token has expired",
      };
    } else if (error.name === "JsonWebTokenError") {
      return {
        valid: false,
        decoded: null,
        expired: false,
        error: "Invalid token",
      };
    } else {
      return {
        valid: false,
        decoded: null,
        expired: false,
        error: error.message,
      };
    }
  }
};

/**
 * Extract token from request headers
 * @param {Object} req - Express request object
 * @returns {String|null} Extracted token
 */
const extractTokenFromRequest = (req) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check query parameter
  if (req.query.token) {
    return req.query.token;
  }

  // Check cookies (if using cookie-based auth)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

/**
 * Hash password using bcrypt
 * @param {String} password - Plain text password
 * @returns {String} Hashed password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, securityConfig.bcryptRounds);
};

/**
 * Compare password with hash
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password
 * @returns {Boolean} Comparison result
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate secure random token for password reset, email verification, etc.
 * @param {Number} length - Token length
 * @returns {String} Random token
 */
const generateSecureToken = (length = 32) => {
  const crypto = require("crypto");
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return { valid: false, errors };
  }

  if (password.length < securityConfig.passwordMinLength) {
    errors.push(
      `Password must be at least ${securityConfig.passwordMinLength} characters long`
    );
  }

  if (securityConfig.requirePasswordComplexity) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase)
      errors.push("Password must contain at least one uppercase letter");
    if (!hasLowerCase)
      errors.push("Password must contain at least one lowercase letter");
    if (!hasNumbers) errors.push("Password must contain at least one number");
    if (!hasSpecialChar)
      errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate refresh token pair (access + refresh)
 * @param {Object} user - User object
 * @returns {Object} Token pair
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user._id || user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(payload, TOKEN_TYPES.ACCESS);
  const refreshToken = generateToken(payload, TOKEN_TYPES.REFRESH);

  return {
    accessToken,
    refreshToken,
    expiresIn: jwtConfig.expiresIn,
  };
};

/**
 * Decode token without verification (useful for expired tokens)
 * @param {String} token - JWT token
 * @returns {Object|null} Decoded payload
 */
const decodeTokenUnsafe = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {String} token - JWT token
 * @returns {Boolean} True if expired
 */
const isTokenExpired = (token) => {
  const decoded = decodeTokenUnsafe(token);
  if (!decoded || !decoded.exp) return true;

  return Date.now() >= decoded.exp * 1000;
};

/**
 * Generate password reset token
 * @param {Object} user - User object
 * @returns {String} Reset token
 */
const generatePasswordResetToken = (user) => {
  const payload = {
    userId: user._id || user.id,
    email: user.email,
    purpose: "password_reset",
  };

  return generateToken(payload, TOKEN_TYPES.RESET_PASSWORD, "1h");
};

/**
 * Generate email verification token
 * @param {Object} user - User object
 * @returns {String} Verification token
 */
const generateEmailVerificationToken = (user) => {
  const payload = {
    userId: user._id || user.id,
    email: user.email,
    purpose: "email_verification",
  };

  return generateToken(payload, TOKEN_TYPES.EMAIL_VERIFICATION, "24h");
};

// Cookie configuration for JWT tokens
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

module.exports = {
  // Configuration
  jwtConfig,
  securityConfig,
  TOKEN_TYPES,
  cookieConfig,

  // Token management
  generateToken,
  verifyToken,
  extractTokenFromRequest,
  generateTokenPair,
  decodeTokenUnsafe,
  isTokenExpired,

  // Password management
  hashPassword,
  comparePassword,
  validatePassword,

  // Utility functions
  generateSecureToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
};
