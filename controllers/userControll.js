const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const Factory = require('./../controllers/handlerFactory');

// users handlers
//                obj = req.body, allowedFields = update fields
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

const userAtual = (req, res, next) =>{
    req.params.id = req.user.id
    next();
}

const updateUserNew = catchAsync( async(req, res, next) =>{
    // erro caso tente atualizar o password
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('Você não pode atualizar a senha aqui!', 400));
    }

    // filtro  de fields que podem ser updateds
    const filterBody = filterObj(req.body, 'name', 'email')

    // update user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    });

    res.status(201).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
});

// Functions para api apenas Admins
const getAllUsers =  Factory.getAll(User);
const getOneUser = Factory.getOne(User);
const updateUser = Factory.updateOne(User);
const deleteUser = Factory.deleteOne(User);


module.exports = {
    getAllUsers,
    getOneUser,
    updateUserNew,
    deleteUser,
    updateUser,
    userAtual
}