import { showAlert } from "./alert.js";

export const updateUserData = async(name, email) => {
    try{
        const res = await axios({
        method: 'PATCH',
        url: 'http://localhost:1234/api/v1/user/updateV2',
        data: {
            name,
            email
        }
    });

    if(res.data.status === 'success'){
        showAlert('success',   'Dados atualizado!');
    }

    }catch(err){
    showAlert('error', err);
    console.log(err);
}
}

export const updateUserPass = async(passwordCurrent, password, passwordConfirm) =>{
    try{
        const res = await axios({
        method: 'PATCH',
        url: 'http://localhost:1234/api/v1/user/updatePass',
        data: {
            passwordCurrent, password, passwordConfirm
        }
    });

    if(res.data.status === 'success'){
        showAlert('success',   'Password atualizado!');
    }

    }catch(err){
    showAlert('error', err);
    console.log(err);
}
}
