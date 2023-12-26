
const chatBody = document.getElementById("chat-body");
const msgBox = document.getElementById("messageBox");
const sendBtn = document.getElementById("sendBtn");

document.addEventListener('DOMContentLoaded', ()=>{
    pushJoinMessage("XYZ joined the chat")
});
sendBtn.addEventListener('click', sendMessage);



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



