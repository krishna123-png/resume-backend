const express = require('express');
const { register } = require('../controllers/authController');
const { login } = require('../controllers/authController');
const { getUser } = require('../controllers/authController');
const { updateUser } = require('../controllers/authController');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

router.post('/register', register);
router.post('/login', login);
router.get('/details', verifyToken, getUser);
router.put('/update', verifyToken, updateUser);

module.exports = router;
