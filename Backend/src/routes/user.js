const router       = require('express').Router();
const { body }     = require('express-validator');
const auth         = require('../middleware/authenticate');
const { validateRequest } = require('../middleware/errorHandler');
const { getMe, updateMe, changePassword, deleteMe } = require('../controllers/userController');

router.use(auth);

router.get('/',          getMe);
router.patch('/',
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty.'),
  validateRequest,
  updateMe
);
router.patch('/password',
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  validateRequest,
  changePassword
);
router.delete('/', deleteMe);

module.exports = router;
