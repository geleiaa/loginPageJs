const express = require('express');
const userController = require('./../controllers/userControll');
const authController = require('./../controllers/authControll');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPass', authController.forgotPass);
router.patch('/resetPass/:token', authController.resetPass);

router.use(authController.protectRoutes); // daqui p/ baixo as routes sao protectRoutes

router.patch('/updatePass', authController.updatePass);
router.patch('/updateV2', userController.updateUserNew);
router.delete('/deleteV2', userController.deleteUserNew);

router
    .get('/me', 
    userController.userAtual, 
    userController.getOneUser);

router.use(authController.rolesForUsers('admin')); // daqui p/ baixo as routes sao só p/ admins

router
    .route('/')
    .get(
        userController.getAllUsers)
    //.post(userController.createUser);

router
    .route('/:id')
    .get(userController.getOneUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports =  router;