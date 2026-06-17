const router = require('express').Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/errorHandler');
const { signup, login, refresh, logout } = require('../controllers/authController');

router.post('/signup',
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  validateRequest,
  signup
);

router.post('/login',
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  validateRequest,
  login
);

router.post('/refresh', refresh);
router.post('/logout',  logout);

module.exports = router;
