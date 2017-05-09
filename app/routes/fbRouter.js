const express = require('express');
const apiController = require('../app/controllers/api');

const router = express.Router();
router.get('/', apiController.tokenVerification);
router.post('/', apiController.handleMessage);

module.export = router;