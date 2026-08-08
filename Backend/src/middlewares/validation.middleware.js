const { body, validationResult } = require('express-validator');

const usernameRule = body('username')
  .trim()
  .isLength({ min: 3, max: 30 })
  .withMessage('Username must be between 3 and 30 characters.')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can contain only letters, numbers, and underscores.');

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email address.')
  .normalizeEmail();

const passwordRule = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters.')
  .matches(/[a-z]/)
  .withMessage('Password must contain a lowercase letter.')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter.')
  .matches(/[0-9]/)
  .withMessage('Password must contain a number.');

function validationErrorHandler(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: 'Please correct the highlighted fields.',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
}

const registerValidation = [
  usernameRule,
  emailRule,
  passwordRule,
  body('role').optional().isIn(['user', 'artist']).withMessage('Role must be user or artist.'),
  validationErrorHandler,
];

const loginValidation = [
  body('username').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters.'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
  body().custom((_, { req }) => {
    if (req.body.username || req.body.email) return true;
    throw new Error('Enter your username or email.');
  }),
  body('password').notEmpty().withMessage('Password is required.'),
  validationErrorHandler,
];

module.exports = { registerValidation, loginValidation };
