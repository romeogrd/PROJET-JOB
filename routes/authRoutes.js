const { Router } = require('express');
const authController = require('../controllers/authControllers');
const {checkUser} = require('../middleware/authMiddleware')





const router = Router();

router.get('/signup', checkUser, authController.signup_get);
router.post('/signup', checkUser, authController.signup_post);
router.get('/login', checkUser, authController.login_get);
router.post('/login', checkUser, authController.login_post);
router.get('/', checkUser, authController.index_get);
router.get('/logout', checkUser, authController.logout_get);
router.get('/newjob', checkUser, authController.newjob_get);
router.post('/newjob', checkUser, authController.newjob_post);
router.get('/jobdetail/:jobId', checkUser, authController.jobdetail_get);
router.delete('/jobdetail/:jobId', checkUser, authController.jobdetail_delete);
router.get('/jobupdate/:jobId', checkUser, authController.jobupdate_get);
router.post('/jobupdate/:jobId', checkUser, authController.jobupdate_post);



module.exports = router;
