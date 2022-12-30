import { login, logout } from './login.js';
import { updateUserData, updateUserPass } from './settings.js';
//import "regenerator-runtime/runtime.js";
//import '/@babel/polyfill';

// LOGIN PAGE
document.querySelector('.form').addEventListener('submit', event =>{
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});

// USER PAGE 
const userFormDt = document.querySelector('.form-user-data');
if(userFormDt) userFormDt.addEventListener('submit', event =>{
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateUserData(name, email);
});

// USER PAGE - UPDATE PASS
const userFormPass = document.querySelector('.form-user-password');
if(userFormPass) userFormPass.addEventListener('submit', async event =>{
    event.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserPass(passwordCurrent, password, passwordConfirm);


    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
});

//LOGOUT IN HEADER
const logoutBt = document.querySelector('.nav__el--logout');
if(logoutBt) logoutBt.addEventListener('click', logout);