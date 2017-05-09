const express = require('express');

const router = express.Router();
router.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot');
});

module.exports = router;