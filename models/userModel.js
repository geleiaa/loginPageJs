const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        require: [true, 'Forneça um nome'],
        maxlength: [15, 'O nome não pode ser maior que 15 caracteres'],
        minlength: [5, 'O nome deve ser maior']
    },
    email: {
        type: String,
        require: [true, 'Forneça um email'],
        unique: true,
        validate: [validator.isEmail, 'Forneça um email válido!!']
    },
    password: {
        type: String,
        require: [true, 'Forneça uma senha'],
        minlength: [8, 'A senha precisa ter mais de 8 caracteres'],
        select: false // no leak pass to client
    },
    passwordConfirm: {
        type: String,
        require: [true, 'Confirme a senha'],
        validate: {
            // Só funciona com create() ou save() method
            validator: function(el) {
                return el === this.password
            },
            message: 'A senha nao corresponde'
        }
    },   
    passwordChanged: Date,
    photo: String, 
    roles: {
        type: String,
        enum: ['user', 'moderators', 'admin'],
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
},  
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);


// userSchema.virtual('passwordConfirm').get( function() {
//     if (this.passwordConfirm != this.password){
//         return "message: 'A senha nao corresponde'"
//     }
// });

// hook para encriptar a senha antes de ser armaz no DB
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10); // encrpy password

    this.passwordConfirm = undefined; // delete passwordConfirm

    next();
});

// instance method para comparar os passwords
userSchema.methods.comparePassword = async function(passNoHash, passHashed) {
    return await bcrypt.compare(passNoHash, passHashed);
}; // compara o pass vindo da req de login ... authControll.js
  // passNoHash = pass da req 
  // passHashed = pass no DB

// instance method para verificar se o pass foi alterado depois de mandar o jwt 
userSchema.methods.changedPassAfterTk = function(TokenTimeStamp) { //TokenTimeStamp = data que o token foi emitido
    if(this.passwordChanged) {  
        const changeTimeStamp = parseInt(   //conversao para segundos
            this.passwordChanged.getTime() / 1000, 10
        );

        return TokenTimeStamp < changeTimeStamp; // se TokenTimeStamp for menor que changeTimeStamp a senha foi alterada
    }

    // false se a senha nao foi alterada
    return false;
};

userSchema.methods.resetPassResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex'); //Token aleatorio p/ confirmar o reset

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // hash o token p/ armazenar no DB
    //console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min

    return resetToken;
};

// hook para a func resetPass 
userSchema.pre('save', function(next) {
  if(!this.isModified('password') || this.isNew) return next(); // se passwordChanged nao foi modificado, só segue

  this.passwordChanged = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function(next){
    this.find({ active: { $ne: false } });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;