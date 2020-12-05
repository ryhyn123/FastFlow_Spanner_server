const express = require('express')
const router = express.Router();
const authenticateToken = require('../middleware/middleware')
const profileController = require('../controllers/profileController')
const multer = require('multer')

//multer setting
const _storageprofile = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadProfile/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})
const uploadProfile = multer({storage: _storageprofile}) 

router.use('/uploadProfile', express.static('uploadProfile'));


//profile read
router.get('/read', authenticateToken.authenticateToken, profileController.read)

//profile password edit
router.put('/edit/password', authenticateToken.authenticateToken, profileController.editPassword);

//profile(account) delete
router.delete('/delete', authenticateToken.authenticateToken, profileController.delete)

//profile username edit
router.put('/edit/username', authenticateToken.authenticateToken, profileController.editUsername);

//profile photo upload
router.put('/upload',authenticateToken.authenticateToken, uploadProfile.single('image'), profileController.upload)

//profile photo delete
router.put('/upload/delete', authenticateToken.authenticateToken, profileController.uploadDelte)


module.exports = router;
