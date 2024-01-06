const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");
const emailPhone = document.getElementById("email_phone");
const signupBtn =  document.getElementById("signup");
const signinBtn = document.getElementById("signin");

if(signupBtn)
    signupBtn.addEventListener("click", signup);
if(signinBtn)
    signinBtn.addEventListener("click", signin);



async function signup(event){
    try{
        event.preventDefault();
        if(username.value==='' || email.value==='' || phone.value==='' ||password.value===''){
            return alert('Please enter all the fields');
        }

        const reqObj = {
            username: username.value,
            email: email.value,
            password: password.value,
            phone: phone.value
        }

        const response = await axios.post("http://35.153.210.34:4000/user/signup", reqObj);
        if(response.status === 201){
            alert(response.data.message);
            window.location.href = "../sign-in.html";
        }
    }
    catch(err){
        alert(err.response.data.message);
    }

}



async function signin(event){
    try{
        event.preventDefault();
        if(emailPhone.value==='' || password.value===''){
            return alert('Please enter all the fields');
        }

        const reqObj = {
            email_phone: emailPhone.value,
            password: password.value,
        }

        const response = await axios.post("http://35.153.210.34:4000/user/signin", reqObj);
        if(response.status === 201){
            localStorage.removeItem('savedmessages');
            localStorage.setItem('token', response.data.token);
            alert(response.data.message);
            window.location.href = "../chat-window.html";
        }
    }
    catch(err){
        alert(err.response.data.message);
    }

}

