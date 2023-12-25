
const chatBody = document.getElementById("chat-body");

document.addEventListener('DOMContentLoaded', pushJoinMessage);



function pushJoinMessage(){
    const div = document.createElement('div');
    div.className = 'joinMsg';
    div.appendChild(document.createTextNode("XYZ joined the chat"));
    chatBody.appendChild(div);
}