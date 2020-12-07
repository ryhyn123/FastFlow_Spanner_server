const express = require('express')
const router = express.Router();
const authenticateToken = require('../middleware/middleware')
const userController = require('../controllers/userController')


//signup 
router.post('/signup', userController.signup)

// //signin 
router.post("/signin", userController.signin);

// //signout 
router.delete("/signout", authenticateToken.authenticateToken, userController.signout);

//userinfo
router.get('/', authenticateToken.authenticateToken, userController.userinfo)
 

module.exports = router;
