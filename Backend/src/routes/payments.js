const router = require('express').Router();
const auth   = require('../middleware/authenticate');
const { initializePayment, verifyPayment, webhook, getHistory } = require('../controllers/paymentController');

// Webhook — NO auth (Paystack calls this)
router.post('/webhook', webhook);

// Authenticated routes
router.use(auth);
router.post('/initialize',         initializePayment);
router.get('/verify/:reference',   verifyPayment);
router.get('/history',             getHistory);

module.exports = router;
