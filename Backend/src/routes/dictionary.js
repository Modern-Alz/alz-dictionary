const router = require('express').Router();
const { body } = require('express-validator');
const auth   = require('../middleware/authenticate');
const { validateRequest } = require('../middleware/errorHandler');
const {
  getQuota, search, getHistory,
  getSaved, saveWord, unsaveWord, wordOfDay,
} = require('../controllers/dictionaryController');

router.use(auth);

router.get('/quota',        getQuota);
router.get('/history',      getHistory);
router.get('/wotd',         wordOfDay);

router.post('/search',
  body('term').trim().notEmpty().withMessage('Search term is required.')
              .isLength({ max: 200 }).withMessage('Search term is too long.'),
  validateRequest,
  search
);

router.get('/saved',        getSaved);
router.post('/saved',
  body('term').trim().notEmpty().withMessage('term is required.'),
  validateRequest,
  saveWord
);
router.delete('/saved/:term', unsaveWord);

module.exports = router;
