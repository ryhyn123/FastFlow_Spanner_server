const express = require('express')
const router = express.Router();
const socialAuthController = require('../controllers/socialAuthController');

//socialAuth/kakao
router.post('/kakao', socialAuthController.kakao)

//socialAuth/github
router.post('/github', socialAuthController.github)


module.exports = router;
