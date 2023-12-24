const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const password = document.getElementById("password");
const submit =  document.getElementById("submit");

submit.addEventListener("click", signup);



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

        const response = await axios.post("http://localhost:3000/user/signup", reqObj);
        if(response.status === 201){
            return alert(response.data.message);
        }
    }
    catch(err){
        alert(err.response.data.message);
    }

}

