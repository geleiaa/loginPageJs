
export const hideAlert = () =>{
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}

// type = response da api ('success' ou 'error')

export const showAlert = (type, message) =>{
    hideAlert();
    const element = `<div class="alert alert--${type}">${message}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', element);
    window.setTimeout(hideAlert, 5000);
};