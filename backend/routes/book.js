const express = require('express');
const auth = require('../middleware/auth');  
const router = express.Router();
const upload = require('../middleware/multer-config'); 
const sharp = require('../middleware/sharp-config'); 
const bookCtrl = require('../controllers/book');

// Définition des routes

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);
router.post('/', auth, upload, sharp.resizeImage, bookCtrl.createBook);
router.put('/:id', auth, upload, sharp.resizeImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;