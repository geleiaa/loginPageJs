const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/sendEmail');

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const gerarToken = id => { // gera o jwt com payload = id do user
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });    
}

const createSendToken = (user, statusCode, res) =>{
    const token = gerarToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 3600000), // 1 dia
        httpOnly: true
    }; 
    //secure: true

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
}

const signUp = catchAsync(async (req, res, next) =>{
    const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    roles: req.body.roles // default user comum
    });

    createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) =>{
    const { email, password } = req.body;

    // check se email e pass existe
    if(!email || !password){
        return next(new AppError('Forneça email e senha!!', 400));
    }

    // check email e pass esta correto
    const user = await User.findOne({ email }).select('+password');
                                           //  pass DB  -  pass req 
    if(!user || await user.comparePassword(user.password, password)) { // sem user, nao compara o pass
        return next(new AppError('Email ou Senha incorreto!!', 401));
    }

    // send token
    createSendToken(user, 200, res);
});

const logout = (req, res) =>{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}

const protectRoutes = catchAsync(async (req, res, next) =>{
    // usuario logado...
    
    // Pega o token 
    let token;
    // analiza o token mandado por header
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // armazena o token na var "token"
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    //console.log(req.headers);
    if(!token){ 
        return next(new AppError('Você nao está logado!! Porfavor logue!!', 401));
    }

    // verifica o token 
    const decodeTk = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // promisify pq verify() sem callback é sync
    
    // verifica se o user existe com base no id token (payload)
    const nowUser = await User.findById(decodeTk.id);
    if(!nowUser) {
        return next(new AppError('o Usuario nao existe...'));
    }

    // verifica se o user mudou a senha dps do token ser emitido (instace method no models)
    if(nowUser.changedPassAfterTk(decodeTk.iat)){
        return next(new AppError('Usuario mudou a senha, relogue!!', 401));
    }

    // substitui o valor da var "user" vindo dos os middlewares
    //garante o acesso
    req.user = nowUser;
    res.locals.user = nowUser;
    //console.log('consolelog do user' + req.user);

    next();
});

// render só para users loggued
const renderForOnlyLoggued = async (req, res, next) =>{
    // usuario logado...
    if (req.cookies.jwt) {
    try{

    // verifica o cookie 
    const decodeTk = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    // promisify pq verify() sem callback é sync
    
    // verifica se o user existe com base no id token (payload)
    const nowUser = await User.findById(decodeTk.id);
    if(!nowUser) {
        return next();
    }

    // verifica se o user mudou a senha dps do token ser emitido (instace method no models)
    if(nowUser.changedPassAfterTk(decodeTk.iat)){
        return next();
    }

    // substitui o valor da var "user" vindo dos os middlewares
    res.locals.user = nowUser; // associa a var "user" nos pug templates 
    return next();
} catch(err) {
    return next()
}
}
    next();
};

// pega o req.user do mid anterior
const rolesForUsers = (...roles) =>{ // dessa forma possibilita passar parâmetros para a mid func (closure)
    return (req, res, next) => {
        if(!roles.includes(req.user.roles)) { // se nao for um user da roles = nao tem acesso
            return next(new AppError('Você não tem permissão !!', 403));
        }
    next();
    };
};
// rolesForUsers('user' || 'moderators' || 'admin') 

const forgotPass = catchAsync( async(req, res, next) => {
    // pega email na POST req
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new AppError('Email invalido!!', 404));
    }

    // gera token de confirm o reset
    const resetToken = user.resetPassResetToken();
    //console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    // manda email de resp
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPass/${resetToken}`;

    const message = `Esquceu a senha? Mandei um PATCH request para ${resetUrl}.\n
    Se nao esquceu sua senha, desconcidere este email!`
  
try{
    await sendEmail({
        email: user.email,
        subject: 'Seu token para resetar a senha vale só por 10 minutos',
        message
    });
    console.log('Passou!!');

    res.status(200).json({
        status: 'success',
        message: 'Token mandado para o email'
    });
}catch(err){
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    //console.log(err);
    return next(new AppError('Houve algum problema para mandar o email, tente depois', 500));
}
    // manda email de resp

});

const resetPass = catchAsync( async (req, res, next ) =>{
    // identifica o user baseado no token do DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now()}});

    //console.log(user);

    // verifica se o token ñ expirou e salva o novo pass
    if(!user){
        return next(new AppError('Token invalido ou expirado!', 400));
    }

    // reset pass 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // update passwordChanged (model)

    // loga o user e manda o jwt novo 
    createSendToken(user, 201, res);

});

const updatePass = catchAsync( async(req, res, next) => {
    // pega user do DB
    const user = await User.findById(req.user.id).select('+password');
    
    // check se o pass atual é o correto
    if(!(await user.comparePassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('A senha está errada!!', 401));
    }
    
    // update pass
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // loga o user e manda o jwt
    createSendToken(user, 200, res)
});

module.exports = { 
    signUp,
    login,
    logout,
    protectRoutes,
    rolesForUsers,
    forgotPass,
    resetPass,
    updatePass,
    renderForOnlyLoggued
}; 