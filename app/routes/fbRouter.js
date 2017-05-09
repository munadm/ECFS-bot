const express = require('express');
const apiController = require('../controllers/api');

const fbRouter = express.Router();
fbRouter.get('/', apiController.tokenVerification);
fbRouter.post('/', apiController.handleMessage);

module.exports = fbRouter;