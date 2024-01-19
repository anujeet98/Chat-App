const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const emailPhone = document.getElementById("email_phone");
// const password = document.getElementById("password");
const passwordSignIn = document.getElementById("password-signin");
const passwordSignUp = document.getElementById("password-signup");
const forgetEmail = document.getElementById("fg-email")
const signupBtn =  document.getElementById("signup");
const signinBtn = document.getElementById("signin");
const resetPsswdBtn = document.getElementById('resetpsswd');
const formWindow = document.getElementById('form');
const BACKEND_ADDRESS = 'http://35.153.237.118:80';

if(signupBtn)
    signupBtn.addEventListener("click", signup);
if(signinBtn)
    signinBtn.addEventListener("click", signin);
if(resetPsswdBtn)
    resetPsswdBtn.addEventListener('click', forgetPassword);


function ValidateEmail(input) {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (input.value.match(validRegex)) {
        return true;
    } else {
        return false;
    }
}
function validatePhone(input){
    var validRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (input.value.match(validRegex)) {
        return true;
    } else {
        return false;
    }
}


function toggleForm(event) {
    for(const child of formWindow.children){
        if(!child.classList.contains('inactive')){
            child.classList.toggle('inactive');
            break;
        }
    }
    document.getElementById(event.target.getAttribute('formid')).classList.toggle('inactive');
}


async function signup(event){
    try{
        event.preventDefault();
        if(username.value==='' || email.value==='' || phone.value==='' ||passwordSignUp.value==='')
            return alert('Please enter all the fields');
        if(!ValidateEmail(email))
            return alert('Please enter a valid email');
        if(!validatePhone(phone))
            return alert('Please enter a valid phone number');

        const reqObj = {
            username: username.value,
            email: email.value,
            password: passwordSignUp.value,
            phone: phone.value
        }

        const response = await axios.post(`${BACKEND_ADDRESS}/users/signup`, reqObj);
        if(response.status === 201){
            alert(response.data.message);
            // window.location.href = "sign-in.html";
            toggleForm();
        }
    }
    catch(err){
        if(err.response)
            return alert(err.response.data.message);
        return alert(err);
    }

}



async function signin(event){
    try{
        event.preventDefault();
        if(emailPhone.value==='' || passwordSignIn.value===''){
            return alert('Please enter all the fields');
        }

        const reqObj = {
            email_phone: emailPhone.value,
            password: passwordSignIn.value,
        }

        const response = await axios.post(`${BACKEND_ADDRESS}/users/signin`, reqObj);
        if(response.status === 201){
            localStorage.removeItem('savedmessages');
            localStorage.setItem('token', response.data.token);
            alert(response.data.message);
            window.location.href = "chat-window.html";
        }
    }
    catch(err){
        if(err.response)
            return alert(err.response.data.message);
        return alert(err);
    }

}

async function forgetPassword(e){
    try{
        e.preventDefault();
        if(forgetEmail.value.length===0 || forgetEmail.value===''){
            return alert('kindly fill your email');
        }
    
        const response = await axios.get(`${BACKEND_ADDRESS}/password/forget/${forgetEmail.value}`);
        if(response.status === 200){
            alert(response.data.message);
        }
    }
    catch(err){
        if(err.response) 
            alert(err.response.data.error);
    }
}