const express = require('express');
const User = require('./../models/userModel');
const authController = require('./../controllers/authControll');
//const AppError = require('./../utils/appError');
// const catchAsync = require('./../utils/catchAsync');

const router = express.Router();


router.get('/login', async(req, res) =>{
    res.status(200).render('login', {
        title: 'Login in your account'
    });
});

// router.get('/me', authController.protectRoutes, (req, res) =>{
//     res.status(200).render('usraccount', {
//         title: 'Minha Conta'
//     });
// });

module.exports = router;