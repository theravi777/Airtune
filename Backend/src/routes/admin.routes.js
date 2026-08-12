const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/artist-requests', authAdmin, adminController.listArtistRequests);
router.patch('/artist-requests/:userId', authAdmin, adminController.decideArtistRequest);

module.exports = router;
