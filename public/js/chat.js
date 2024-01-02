const chatBody = document.getElementById("chat-body");
const msgBox = document.getElementById("messageBox");
const emojiBtn = document.getElementById("emojiBtn");
const userList = document.getElementById("usersList-container");

let selectedGroup = -1;

//------------------------------------------------------------------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', ()=>{
    // renderMessages('XYZ joined the chat', 'joinMsg');
    getUserGroups();
});
document.getElementById("sendBtn")
        .addEventListener('click', ()=>{
            sendNewMessage(selectedGroup);
        });

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
});


document.getElementById("newChatBtn").addEventListener("click", async function() {
    try{
        const allusers = await fetchAllUsers();
        document.getElementById("groupContainer").classList.toggle("hidden");
        document.getElementById("createGroupContainer").classList.toggle("hidden");
        populateSearchList(allusers);
    }
    catch(err){
        console.log(err)
    }
});

document.getElementById("cancelGrpBtn").addEventListener("click", function() {
    document.getElementById("groupContainer").classList.toggle("hidden");
    document.getElementById("createGroupContainer").classList.toggle("hidden");
});

document.getElementById("createGrpBtn").addEventListener('click', createGroup);

//--------------------------------------------------------------------------------------------------------------------------------

function renderMessages(msg, mssgType){
    const div = document.createElement('div');
    div.className = mssgType;
    div.appendChild(document.createTextNode(msg));
    chatBody.appendChild(div);
}

function pushMessages(res){
    const thisUser = res.thisUser;
    const messageInfo = res.messageInfo;
    const groupid = res.groupId;
    const userid = res.userId;

    
    messageInfo.forEach(chat => {
        if(chat.groupId === +groupid){
            if(chat.user.id === userid)
                renderMessages(`${chat.user.username}: ${chat.message}`, 'myMsg');
            else
                renderMessages(`${chat.user.username}: ${chat.message}`, 'otherMsg')
        }
    });
}


function loadMessages(groupId){
    if(groupId===-1)
        return;

    chatBody.innerHTML = '';
    let lastIndex = 0;
    let savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    let messageList;
    if(savedMessages)
        messageList = savedMessages.messageInfo.filter(msg => msg.groupId === groupId);
    if(savedMessages===undefined || savedMessages===null || messageList.length ===0)
        return getNewMessages(lastIndex, groupId);
    
    pushMessages({thisUser:savedMessages.thisUser, userId: savedMessages.userId ,groupId: groupId, messageInfo:savedMessages.messageInfo});
    lastIndex = savedMessages.messageInfo
                             .filter(msg => msg.groupId===groupId)
                             .slice(-1)[0].id;
    
    return getNewMessages(lastIndex, groupId); 
}

function saveMessagesToLS(newMessages){
    let savedMessages = JSON.parse(localStorage.getItem('savedmessages'));
    if(savedMessages === undefined || savedMessages === null){
        return localStorage.setItem('savedmessages', JSON.stringify(newMessages));
    }

    savedMessages.messageInfo = [...savedMessages.messageInfo, ...newMessages.messageInfo];
    localStorage.setItem('savedmessages',JSON.stringify(savedMessages));
}



function populateSearchList(users){
    userList.innerHTML='';
    users.forEach(user => {
        const div = document.createElement('div');
        div.id = 'userlist-div';
        
        const checkboxLabel = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.id = 'userlist-checkbox';
        checkbox.type = 'checkbox';
        checkbox.value = user.id;

        checkboxLabel.appendChild(document.createTextNode(`${user.username}`));
        checkboxLabel.appendChild(checkbox);

        div.appendChild(checkboxLabel);
        userList.appendChild(div);
    });
}

function renderNewGroup(groupName, groupId){
    const grpbtn = document.createElement('button');
    grpbtn.className = 'groupBtn';
    grpbtn.onclick = ()=>{
        selectedGroup = groupId;
        loadMessages(selectedGroup);
    }
    grpbtn.innerHTML = `
        <div class="group">
            <img src="../public/image/user.JPG" alt="display.JPG" class="display-img"/>
            <div class="group-name">${groupName}</div>
        </div>
    `;
    document.getElementById('groupContainer-body').appendChild(grpbtn);
}


async function createGroup(){
    try{
        const groupName = document.getElementById('groupName');
        const groupDescription = document.getElementById('groupDescription');
        const selectedUsers = document.querySelectorAll('#userlist-checkbox:checked');
        const selectedUserList = [];
        selectedUsers.forEach(e=>selectedUserList.push(e.value));

        if(groupName===undefined || groupName===null || groupName==='' || selectedUserList.length===0)
            return alert('Kindly provide the Group Name and select the memebers');
    
        const grpObj = {
            groupName: groupName.value,
            groupDescription: groupDescription.value,
            members: selectedUserList
        };
        
        const response = await axios.post('http://localhost:3000/chat/create-group/', grpObj, {headers: {'Authorization': localStorage.getItem('token')}});
        console.log(response);
        renderNewGroup(groupName.value, response.data.groupCreated.id);
        document.getElementById("cancelGrpBtn").click();
    }
    catch(err){
        console.error(err);
    }
}

async function getUserGroups(){
    try{    
        const response = await axios.get('http://localhost:3000/user/groups', {headers: {'Authorization': localStorage.getItem('token')}});
        response.data.groups.forEach(group => {
            renderNewGroup(group.groupName, group.id);
        })
    }
    catch(err){
        console.error(err);
    }
}


//------------------------------------------------------------------------------------------------------------------------------------------


async function getNewMessages(id, groupId){
    try{
        const response = await axios.get(`http://localhost:3000/chat/fetch?lastMessageId=${id}&groupId=${groupId}`, {headers: {"Authorization": localStorage.getItem("token")}});
        saveMessagesToLS(response.data);
        pushMessages(response.data);
    }
    catch(err){
        console.log(err);
    }
}

async function sendNewMessage(groupID){
    try{
        const message = msgBox.value;
        if(groupID===undefined || groupID===null || groupID===-1){
            alert('BAD INPUT PARAMETERS');
        }
        if(message!==null && message!==undefined && message!==""){
            const response = await axios.post('http://localhost:3000/chat/send', {message: message, groupId: groupID}, {headers: {"Authorization": localStorage.getItem("token")}});
            msgBox.value = '';
            if(emojiPickerView)
                emojiBtn.click();
        }
    }
    catch(err){
        console.log(err);
    }
}

async function fetchAllUsers(){
    try{
        const response = await axios.get('http://localhost:3000/user/get-users', {headers: {"Authorization": localStorage.getItem("token")}});
        return response.data;
    }
    catch{
        console.log(err);
    }

}



//--------------------------------------------------------------------------------------------------------------------------------------------------


// setInterval(()=>{
//     loadMessages(selectedGroup);
// },1000);