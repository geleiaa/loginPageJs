const express = require('express');
const userController = require('./../controllers/userControll');
const authController = require('./../controllers/authControll');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.use(authController.protectRoutes); // daqui p/ baixo as routes sao protectRoutes

router.patch('/update-pass', authController.updatePass);
router.patch('/update-user', userController.updateUserNew);

router.use(authController.rolesForUsers('admin')); // daqui p/ baixo as routes sao só p/ admins

router.route('/').get(userController.getAllUsers)
    //.post(userController.createUser);

router
    .route('/:id')
    .get(userController.getOneUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports =  router;