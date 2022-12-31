//import { axios } from './axios.js';
import { showAlert } from './alert.js';

export const login = async(email, password) =>{
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:1234/api/v1/user/login',
            data: {
            email,
            password
            }
        });

        if(res.data.status === 'success'){
            showAlert('success', 'Logado com sucesso');
            window.setTimeout(() => {
                location.assign('logado');
            }, 1500);
        }

    } catch(err){
        showAlert('error', err) //err.response.data.message
        //console.log(err);
    }
};

export const logout = async() =>{
    try{
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:1234/api/v1/user/logout',
        });
        if(res.data.status === 'success') location.reload(true);
    } catch(err) {
        showAlert('error', 'Erro ao deslog, try again.');
    }
};
