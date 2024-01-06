const chatBody = document.getElementById("chat-body");
const msgBox = document.getElementById("messageBox");
const sendBtn = document.getElementById("sendBtn");


sendBtn.addEventListener('click', ()=>{
    sendNewMessage(selectedGroup);
    msgBox.value = '';
    if(emojiPickerView)
        emojiBtn.click();
});

async function loadOldMessages(groupId){
    if(groupId===-1)
        return;

    let messageList = [];
    let savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    
    if(savedMessages)
        messageList = savedMessages.messageInfo.filter(msg => msg.groupId === groupId);

    if(messageList.length > 0)
        pushMessages({thisUser:savedMessages.thisUser, userId: savedMessages.userId ,groupId: groupId, messageInfo:savedMessages.messageInfo});
}


async function loadNewMessages(groupId){
    if(groupId===-1)
        return;

    let messageList = [];
    let savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    
    if(savedMessages)
        messageList = savedMessages.messageInfo.filter(msg => msg.groupId === groupId);

    let lastMessageIndex = 0;
    if(messageList.length > 0)
        lastMessageIndex = messageList.slice(-1)[0].id;
    const newMessages = await getNewMessages(lastMessageIndex, groupId); 
    saveMessagesToLS(newMessages.data);
    pushMessages(newMessages.data);
}


function saveMessagesToLS(newMessages){
    let savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    if(savedMessages === undefined || savedMessages === null){
        return localStorage.setItem('savedmessages', JSON.stringify(newMessages));
    }

    savedMessages.messageInfo = [...savedMessages.messageInfo, ...newMessages.messageInfo];
    localStorage.setItem('savedmessages',JSON.stringify(savedMessages));
}


function renderMessage(msg, mssgType){
    const div = document.createElement('div');
    div.className = mssgType;
    div.appendChild(document.createTextNode(msg));
    return div;
}

function pushMessages(res){
    // const thisUser = res.thisUser;
    const messageInfo = res.messageInfo;
    const groupid = res.groupId;
    const userid = res.userId;

    
    messageInfo.forEach(chat => {
        if(chat.groupId === +groupid){
            let messageDiv;
            if(chat.user.id === userid)
                messageDiv = renderMessage(`${chat.user.username}: ${chat.message}`, 'myMsg');
            else
                messageDiv = renderMessage(`${chat.user.username}: ${chat.message}`, 'otherMsg');
            chatBody.appendChild(messageDiv);
        }
    });
}





async function getNewMessages(id, groupId){
    try{
        return await axios.get(`http://35.153.210.34:4000/chat/fetch?lastMessageId=${id}&groupId=${groupId}`, {headers: {"Authorization": localStorage.getItem("token")}});
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
            if(err.response.status===403){
                selectedGroup = -1;
                location.reload();
            }
        }
    }
}

async function sendNewMessage(groupID){
    try{
        const message = msgBox.value;
        if(groupID===undefined || groupID===null || groupID===-1){
            alert('BAD INPUT PARAMETERS');
        }
        if(message!==null && message!==undefined && message!==""){
            const response = await axios.post('http://35.153.210.34:4000/chat/send', {message: message, groupId: groupID}, {headers: {"Authorization": localStorage.getItem("token")}});
        }
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}