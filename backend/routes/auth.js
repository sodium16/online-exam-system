const express = require('express');
const router  = express.Router();
const { adminLogin, register, login, getMe, getDepartments } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/admin/login', adminLogin);
router.post('/register',    register);
router.post('/login',       login);
router.get('/me',           protect, getMe);
router.get('/departments',  getDepartments);

module.exports = router;
