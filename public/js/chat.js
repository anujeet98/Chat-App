
const chatBody = document.getElementById("chat-body");
const msgBox = document.getElementById("messageBox");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");


let emojiPickerView = false; 
emojiBtn.addEventListener('click', ()=>{
    if(emojiPickerView){
        emojiPickerView=false;
        return document.body.removeChild(document.querySelector('emoji-picker'));
    }
    document.body.appendChild(document.createElement('emoji-picker'));
    emojiPickerView = true;
    const emojiPicker = document.querySelector('emoji-picker');
    emojiPicker.addEventListener('emoji-click', event => msgBox.value+= event.detail.unicode);
})

    

document.addEventListener('DOMContentLoaded', ()=>{
    pushJoinMessage("XYZ joined the chat");
    const savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    if(savedMessages){
        pushMessages({thisUser:savedMessages.thisUser,messageInfo:savedMessages.messageInfo});
    }
    getLSMessages();
});
sendBtn.addEventListener('click', sendMessage);


function pushMessages(res){
    const thisUser = res.thisUser;
    const messageInfo = res.messageInfo;

    messageInfo.forEach(chat => {
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
            msgBox.value = '';
            if(emojiPickerView)
                emojiBtn.click();
            // pushMyMessage(`${response.data.username}: ${message}`);
        }
    }
    catch(err){
        console.log(err);
    }
}


async function getMessages(id){
    try{
        const response = await axios.get(`http://localhost:3000/chat/fetch/lastMessageId=${id}`, {headers: {"Authorization": localStorage.getItem("token")}});
        saveLSMessages(response.data);
        pushMessages(response.data);
    }
    catch(err){
        console.log(err);
    }
}


function getLSMessages(){
    let savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    if(savedMessages===undefined || savedMessages===null)
        return getMessages(0);
    
    savedMessages = savedMessages.messageInfo;
    const lastIndex = savedMessages[savedMessages.length-1].id;
    return getMessages(lastIndex);
    
}

function saveLSMessages(newMessages){
    let savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    if(saveLSMessages === undefined || savedMessages === null){
        return localStorage.setItem('savedmessages', JSON.stringify(newMessages));
    }

    savedMessages.messageInfo = [...savedMessages.messageInfo, ...newMessages.messageInfo];
    localStorage.setItem('savedmessages',JSON.stringify(savedMessages));
}





setInterval(()=>{
    getLSMessages();
},1000);