
const chatBody = document.getElementById("chat-body");
const msgBox = document.getElementById("messageBox");
const sendBtn = document.getElementById("sendBtn");

document.addEventListener('DOMContentLoaded', ()=>{
    pushJoinMessage("XYZ joined the chat");
    getMessages();
});
sendBtn.addEventListener('click', sendMessage);


function pushMessages(res){
    const thisUser = res.thisUser;
    const response = res.response;

    response.forEach(chat => {
        if(chat.user.username === thisUser)
            pushMyMessage(`${chat.user.username}: ${chat.message}`);
        else
            pushOtherMessage(`${chat.user.username}: ${chat.message}`)
    });
}

function pushJoinMessage(msg){
    const div = document.createElement('div');
    div.className = 'joinMsg';
    div.appendChild(document.createTextNode(msg));
    chatBody.appendChild(div);
}

function pushMyMessage(msg){
    const div = document.createElement('div');
    div.className = 'myMsg';
    div.appendChild(document.createTextNode(msg));
    chatBody.appendChild(div);
}

function pushOtherMessage(msg){
    const div = document.createElement('div');
    div.className = 'otherMsg';
    div.appendChild(document.createTextNode(msg));
    chatBody.appendChild(div);
}



async function sendMessage(){
    try{
        const message = msgBox.value;
        if(message!==null && message!==undefined && message!==""){
            const response = await axios.post('http://localhost:3000/chat/send', {message: message}, {headers: {"Authorization": localStorage.getItem("token")}});
            console.log(response)
            pushMyMessage(`${response.data.username}: ${message}`);
        }
    }
    catch(err){
        console.log(err);
    }
}


async function getMessages(){
    try{
        const response = await axios.get('http://localhost:3000/chat/fetch', {headers: {"Authorization": localStorage.getItem("token")}});
        pushMessages(response.data);
    }
    catch(err){
        console.log(err);
    }
}



