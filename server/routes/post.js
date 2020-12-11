const express = require('express')
const router = express.Router();
const authenticateToken = require('../middleware/jwt')
const postController = require('../controllers/postController')
const multer = require('multer')

//multer setting
const _storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadPost/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})
const upload = multer({storage: _storage})


//post read
router.get('/read/:id', postController.read)

//post write
router.post('/write', authenticateToken.authenticateToken, postController.write)

//post edit
router.put('/edit', authenticateToken.authenticateToken, postController.edit);

//post delete
router.delete('/delete', authenticateToken.authenticateToken, postController.delete);

// //post photo upload and edit
router.put('/upload', authenticateToken.authenticateToken, upload.single('image'), postController.upload);

// //post photo delete
 router.put('/upload/delete', authenticateToken.authenticateToken, postController.uploadDelete)


module.exports = router;
