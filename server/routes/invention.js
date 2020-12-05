const express = require('express')
const router = express.Router();
const inventionController = require('../controllers/inventionController')


//invention read
router.get('/:id', inventionController.read)

 
module.exports = router;
