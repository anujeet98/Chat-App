"use strict";
const newChatBtn = document.querySelector('.content-sidebar-newchatbtn');
const contentSideBar = document.querySelector('.content-sidebar');
const editGroupBtn = document.getElementById('editgroupbtn');
const editGroupBackBtn =document.getElementById('editgroupview-backbtn');
const updateGroupBtn = document.getElementById('updateGroupBtn');
const addMemberBtn = document.getElementById('addMemberBtn');
const emojiBtn = document.getElementById("emojibtn");
const chatFooter = document.querySelector('.content-conversation-footer');
const groupList = document.querySelector('.content-groups-list');
const addMembersFormBtn = document.getElementById('addMembersFormBtn');
const chatContainer = document.querySelector(".content-conversation-body-wrapper");
const msgBox = document.getElementById("mssgbox");
const sendBtn = document.getElementById("sendBtn");
const choosefile = document.querySelector('.choosefile');
const attachBtn = document.getElementById('attachBtn');
let EMOJI_PICK_VIEW = false; 
let SELECTED_GROUP=-1;
let USER={};

let socket = io('http://35.153.237.118:80');
function returnFileSize(number) {
    if (number < 1024) {
      return `${number} bytes`;
    } else if (number >= 1024 && number < 1048576) {
      return `${(number / 1024).toFixed(1)} KB`;
    } else if (number >= 1048576) {
      return `${(number / 1048576).toFixed(1)} MB`;
    }
  }
  

socket.on('new-message', msgObj => {
    storeChatsToLS([msgObj]);
    if(msgObj && SELECTED_GROUP===msgObj.groupId){
        if(msgObj.userId === USER.userId)
            renderMessage(msgObj.username, msgObj.message, 'myMsg', msgObj.isFile?msgObj.isFile:false);
        else    
            renderMessage(msgObj.username, msgObj.message, 'otherMsg', msgObj.isFile?msgObj.isFile:false);
    }
})


document.addEventListener('DOMContentLoaded', async()=>{
    //get-user-info
    //get-user-groups
    //get-user-group-chats
    try{
        await Promise.all([
            getUserInfoAPI((userInfo)=>{
                //update userprofile name
                document.querySelector('.content-sidebar-title').innerText = userInfo.data.username;
                USER.userId = userInfo.data.userid;
                USER.username = userInfo.data.username;
            }),
            getUserGroupsAPI((userGroups)=>{
                //render the groups the content-sidebar
                const groupIds = userGroups.data.groups.map(group => group.id)

                socket.emit('join-group', groupIds);
                renderGroup(userGroups.data.groups);    
            }),
            getUserGroupChatsAPI((userChats)=>{
                //store chats to LS
                localStorage.removeItem('savedchats');
                storeChatsToLS(userChats.data.groupChats);
            })
        ]);
    }
    catch(err){
        console.log(err);
    }
});

document.querySelectorAll('.content-group-btn').forEach(elem => {
    elem.addEventListener('click', changeToContentConversationView);
});

//(for mobile view change) content-conversation -> content-sidebar 
document.getElementById('content-conversation-back-id').addEventListener('click', ()=>{
    document.getElementById('content-conversation-id').classList.remove('active');
});

//backbtn for sidebar-view to update
document.querySelectorAll('.backbtn').forEach(elem => {
    elem.addEventListener('click', toggleSideBarView);
});

//backbtn for sidebar-view to update
document.querySelectorAll('.adminBtns').forEach(elem => {
    elem.addEventListener('click', toggleSideBarView);
});

addMembersFormBtn.addEventListener('click', toggleSideBarView);
editGroupBackBtn.addEventListener('click', changeToContentConversationView);
updateGroupBtn.addEventListener('click',changeToContentConversationView);
addMemberBtn.addEventListener('click',changeToContentConversationView);
newChatBtn.addEventListener('click', async(e) => {
    const users = await fetchAllUsersAPI();
    const userList = document.getElementById('userList-container-create');
    renderUserList(users.data, userList);
    toggleSideBarView(e);
});
editGroupBtn.addEventListener('click', (e) => {
    renderEditGroupPage(+editGroupBtn.getAttribute('groupid'));
    toggleSideBarView(e);
    changeToMobileSidebarView();
});
attachBtn.addEventListener('click', ()=>{
    attachBtn.classList.toggle('selected');
    msgBox.classList.toggle('hidden');
    choosefile.classList.toggle('hidden');
    if(attachBtn.classList.contains('selected'))
        msgBox.value='';
    else
        choosefile.value='';
});


function toggleSideBarView(e){
    //toggle sidebar-child-view (current-view to required-view)
    for (const child of contentSideBar.children) {
        if(child.classList.contains('togglesidebarview-flex')){
            child.classList.toggle('togglesidebarview-flex');
            child.classList.toggle('togglesidebarview-none');
        }
        if(e.target.getAttribute('viewid') === child.id){
            child.classList.toggle('togglesidebarview-none');
            child.classList.toggle('togglesidebarview-flex');
        }
    }
}

//(for mobile view change) content-sidebar -> content-conversation 
function changeToContentConversationView(){
    //change conversation-view from default to chat view
    document.getElementById('content-conversation-default').style.display='none';
    document.getElementById('content-conversation-id').style.display='flex';
    //conversation-view active for small screen display
    document.getElementById('content-conversation-id').classList.add('active');
}

function changeToMobileSidebarView(){
    //conversation-view disable for small screen display
    document.getElementById('content-conversation-id').classList.remove('active');
}

async function renderEditGroupPage(groupId){
    try{
        const groupInfo = await getGroupInfoAPI(groupId);
        const {isAdmin:userIsAdmin, group, nonMembers} = groupInfo.data;

        const groupName = document.getElementById('groupName-edit');
        const groupDescription = document.getElementById('groupDescription-edit');
        //fill in groupName and groupDescription
        groupName.value = group.name;
        groupDescription.value = group.description;

        //fill in memberList Div
        const memberListContainer = document.getElementById('memberList-container');
        memberListContainer.innerHTML = '';
        renderMemberList(groupInfo,memberListContainer);
    
        //fill in userList Div
        const userListEditContainer = document.getElementById('userList-container-add');
        userListEditContainer.innerHTML = '';
        renderUserList(nonMembers, userListEditContainer);
    
        if(userIsAdmin){
            //make all adminBtns visible
            var buttons = document.querySelectorAll('.adminBtns');
            buttons.forEach(button => button.classList.remove('hidden'));
            groupName.disabled = false;
            groupDescription.disabled = false;
        }
        else{
            //make all adminBtns display none
            var buttons = document.querySelectorAll('.adminBtns');
            buttons.forEach(button => button.classList.add('hidden'));
            groupName.disabled = true;
            groupDescription.disabled = true;
        }
    }
    catch(err){
        console.log(err);
    }
}

async function createGroup(){
    try{
        const groupName = document.getElementById('groupName-create');
        const groupDescription = document.getElementById('groupDescription-create');
        const userList = document.getElementById('userList-container-create');
        const selectedUsers = userList.querySelectorAll('input[type="checkbox"]:checked');

        const selectedUserList = [];
        selectedUsers.forEach(e=>selectedUserList.push(e.value));

        if(groupName.value===undefined || groupName.value===null || groupName.value==='' || groupDescription.value===undefined || groupDescription.value===null || groupDescription.value==='' || selectedUserList.length===0)
            return alert('Kindly fill all the fields and select the users');
        const response = await createGroupAPI(groupName, groupDescription, selectedUserList);
        socket.emit('join-group',[response.data.groupCreated.id]);
        groupName.value="";
        groupDescription.value="";
        renderGroup([response.data.groupCreated]);
        document.getElementById('creategroupview-backbtn').click();
        alert(response.data.message);
        
    }
    catch(err){
        console.log(err);
    }
}

async function updateGroup(){
    try{
        const groupName = document.getElementById('groupName-edit').value;
        const groupDescription = document.getElementById('groupDescription-edit').value;

        if(groupName===undefined || groupName===null || groupName==='' || groupDescription===undefined || groupDescription===null || groupDescription==='')
            return alert('Kindly provide the updated groupName and groupDescription');
        const response = await updateGroupAPI(groupName, groupDescription);
        //Update Chat Header with Group Name
        document.getElementById('conversation-groupname').innerText = groupName;
        alert(response.data.message);
    }
    catch(err){
        console.error(err);
    }
}

async function addUsers(){
    try{
        const userList = document.getElementById('userList-container-add');
        const selectedUsers = userList.querySelectorAll('input[type="checkbox"]:checked');
        const selectedUserList = [];
        selectedUsers.forEach(e=>selectedUserList.push(e.value));
    
        if(selectedUserList.length===0)
            return alert('Kindly select the users to add');
    
        await addUsersAPI(selectedUserList);

    }
    catch(err){
        console.error(err);
    }
}

// ==================================EMOJI-BTN-SCRIPT-START======================================
emojiBtn.addEventListener('click', ()=>{
    emojiBtn.classList.toggle('selected');
    if(EMOJI_PICK_VIEW){
        EMOJI_PICK_VIEW=false;
        return chatFooter.removeChild(document.querySelector('emoji-picker'));
    }

    EMOJI_PICK_VIEW = true;
    const emojiPannel = document.createElement('emoji-picker');
    emojiPannel.classList.toggle('emoji-panel');
    chatFooter.appendChild(emojiPannel);
    const emojiPicker = document.querySelector('emoji-picker');
    emojiPicker.addEventListener('emoji-click', event => msgBox.value+= event.detail.unicode);
});

function closeEmojiPanel(){
    if(EMOJI_PICK_VIEW)
        emojiBtn.click;
}
// ===================================EMOJI-BTN-SCRIPT-END=======================================
// ===================================MESSAGE-SCRIPTS-START======================================

sendBtn.addEventListener('click', ()=>{
    sendNewMessage(SELECTED_GROUP);
    msgBox.value = '';
    if(EMOJI_PICK_VIEW)
        emojiBtn.click();
});

async function loadOldChats(groupId){
    if(groupId===-1)
        return;

    let savedChats = new Map(JSON.parse(localStorage.getItem('savedchats')));
    
    if(savedChats){
        savedChats = savedChats.get(groupId);
        if(savedChats || savedChats!==undefined){
            savedChats.forEach(chat =>{
                if(+chat.userId === +USER.userId)
                    renderMessage(chat.username, chat.message, 'myMsg', chat.isFile?chat.isFile:false);
                else    
                    renderMessage(chat.username, chat.message, 'otherMsg', chat.isFile?chat.isFile:false);
            });
        }
    }
}

function storeChatsToLS(userChats){
    let savedChats = localStorage.getItem('savedchats');
    //if no chats present store the chats received
    let chatMap = savedChats ? new Map(JSON.parse(savedChats)) : new Map(); 

    userChats.forEach((chat)=>{
        const groupId = chat.groupId;
        if(chatMap.has(groupId))
            chatMap.get(groupId).push(chat);
        else
            chatMap.set(groupId, [chat]);
    });
    return localStorage.setItem('savedchats', JSON.stringify(Array.from(chatMap.entries())));  //can use object instead of maps to avoid this overhead
}

// ===================================MESSAGE-SCRIPTS-END========================================

function loadGroup(event, groupName, groupId){
    SELECTED_GROUP = +groupId;
    editGroupBtn.setAttribute('groupid', groupId);

    chatContainer.innerHTML = '';
    loadOldChats(groupId);
    changeToContentConversationView();
    document.getElementById('conversation-groupname').innerText = groupName;
}

function renderGroup(groups){
    groups.forEach(group => {
        groupList.innerHTML += `
            <li>
                <a href="#" class="content-group-btn" onclick="loadGroup(event,'${group.name}',${group.id})">
                    <img class="content-groups-image" src="../public/image/user.JPG" alt="">
                    <span class="content-groups-info">
                        <span class="content-groups-info-name">${group.name}</span>
                    </span>
                </a>
            </li>
        `;
    });
}

function renderUserList(users, DOMElement){
    DOMElement.innerHTML='';
    users.forEach(user => {
        DOMElement.innerHTML += `
            <li class="userlist-li"> 
                <div>${user.username}</div>
                <input type="checkbox" class="userlist-checkbox userlist-create-checkbox" value=${user.id}>
            </li>
        `;
    });
}

function renderMemberList(groupInfo,memberListContainer){   
    const {members, group, reqUserId, isAdmin:reqUserIsAdmin} = groupInfo.data;  //ISSUE-ID:#18 user removed from group. null received. update logic in backend to check if user part of group before servicing the request
    members.forEach(member => {
        const adminBtnsDOM = `
                ${member.isAdmin?
                    `<button class="adminBtns admin-toggle-buttons" onclick="removeGroupAdmin(${group.id}, ${member.user.id})"><img class="admin-button-image" src="../public/image/remove-admin.png" alt="remove-admin"></button>`:
                    `<button class="adminBtns admin-toggle-buttons" onclick="addGroupAdmin(${group.id}, ${member.user.id})"><img class="admin-button-image" src="../public/image/add-admin.png" alt="add-admin"></button>`
                }
                <button class="adminBtns" onclick="removeUser(${group.id}, ${member.user.id})">Remove</button>
        `;

        const memberListLiDOM = `
            <li class="userlist-li">
                <div id="userList-username">${member.user.username}</div>
                <div id="userList-admintag">${member.isAdmin?'Admin':''}</div>
                    ${(reqUserIsAdmin && member.user.id !== reqUserId) ? 
                        `${adminBtnsDOM}`:``
                    }
            </li>
        `;
        memberListContainer.innerHTML += memberListLiDOM;
    });
}

function renderMessage(username, msg, mssgType, isFile){
    const messageItem = `<li class="${mssgType==='myMsg'?'conversation-item self':'conversation-item'}">
        <div class="conversation-item-box">
            <div class="conversation-item-text">
                <div class="conversation-item-name">${username}</div>
                ${isFile===true?
                    `<a href="${msg}" class="conversation-item-file" title="${msg}"><img src="${msg}" alt="download file" onerror="fileDefaultImage(event)"/></a>`:
                    `<p>${msg}</p>`
                }
                <div class="conversation-item-time">12:30</div>
            </div>
        </div>
    </li>`;
    chatContainer.innerHTML += messageItem;
}
//++++++++++++++++++    API    ++++++++++++++++++++++++++
async function getUserInfoAPI(cb){
    try{
        const response = await axios.get('http://35.153.237.118:80/user/get-info', {headers: {'Authorization': localStorage.getItem('token')}});
        cb(response);
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function getUserGroupsAPI(cb){
    try{    
        const response = await axios.get('http://35.153.237.118:80/user/groups', {headers: {'Authorization': localStorage.getItem('token')}});
        cb(response)
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function getUserGroupChatsAPI(cb){
    try{    
        const response = await axios.get('http://35.153.237.118:80/user/group-chats', {headers: {'Authorization': localStorage.getItem('token')}});
        cb(response)
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function fetchAllUsersAPI(){
    try{
        const response = await axios.get('http://35.153.237.118:80/user/get-users', {headers: {"Authorization": localStorage.getItem("token")}});
        return response;
    }
    catch{
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function createGroupAPI(groupName, groupDescription, selectedUserList){
    try{
        const grpObj = {
            groupName: groupName,
            groupDescription: groupDescription,
            members: selectedUserList
        };
        
        const response = await axios.post('http://35.153.237.118:80/group/create-group/', grpObj, {headers: {'Authorization': localStorage.getItem('token')}});
        return response;
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function getGroupInfoAPI(groupId){
    try{
        const response = await axios.get(`http://35.153.237.118:80/group/get-info?groupId=${groupId}`, {headers: {"Authorization": localStorage.getItem("token")}});
        return response;
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function updateGroupAPI(groupName, groupDescription){
    try{
        const reqObj = {
            groupName: groupName,
            groupDescription: groupDescription,
            groupId: SELECTED_GROUP
        };
        const response = await axios.put('http://35.153.237.118:80/group/update-group', reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
        return response;
    }
    catch(err){
        if(err.response){
            alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function addGroupAdmin(groupId, memberId){
    try{
        const reqObj ={
            groupId: groupId,
            memberId: memberId
        };
        const response = await axios.put(`http://35.153.237.118:80/group/add-admin`, reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
        alert(response.data.message);
        renderEditGroupPage(groupId);
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function removeGroupAdmin(groupId, memberId){
    try{
        const reqObj ={
            groupId: groupId,
            memberId: memberId
        };
        const response = await axios.put(`http://35.153.237.118:80/group/remove-admin`, reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
        renderEditGroupPage(groupId);
        alert(response.data.message);
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function removeUser(groupId, memberId){
    try{
        const response = await axios.delete(`http://35.153.237.118:80/group/remove-user?memberId=${memberId}&groupId=${groupId}`, {headers: {'Authorization': localStorage.getItem('token')}});
        renderEditGroupPage(groupId);
        alert(response.data.message);
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function addUsersAPI(selectedUsers){
    try{      
        const reqObj = {
            groupId: SELECTED_GROUP,
            members: selectedUsers
        };
        const response = await axios.post('http://35.153.237.118:80/group/add-users/', reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
        return alert(response.data.message);
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
        return Promise.reject(err);
    }
}

async function sendNewMessage(groupID){
    try{
        const message = msgBox.value;
        const file = choosefile.files[0];
        if(groupID===undefined || groupID===null || groupID===-1){
            return alert('BAD INPUT PARAMETERS');
        }
        const currentDate = new Date();
        if(message!==null && message!==undefined && message!==""){
            const response = await axios.post('http://35.153.237.118:80/chat/send-message', {message: message, groupId: groupID}, {headers: {"Authorization": localStorage.getItem("token")}});
            
            const msgObj = {
                message: message,
                createdAt: `${currentDate.getHours()}:${currentDate.getMinutes()}`,
                userId: USER.userId,
                groupId: groupID,
                username: USER.username,
                isFile: false
            }
            socket.emit('new-message', groupID, msgObj);
        }
        else if (file){
            if(file.size>5242880)
                return alert('File upload max limit is 5MB');
            // if(file.type.startsWith('image/')){
            const formData = new FormData();
            formData.append('file', file);
            formData.append('groupId',groupID);
            alert('message will be sent once the file upload completes');
            const response = await axios.post('http://35.153.237.118:80/chat/send-file',formData, {headers: {"Authorization": localStorage.getItem("token")}});
            const fileObj = {
                message: response.data.imageurl,
                createdAt: `${currentDate.getHours()}:${currentDate.getMinutes()}`,
                userId: USER.userId,
                groupId: groupID,
                username: USER.username,
                isFile: true
            }
            socket.emit('new-message', groupID, fileObj);
            // }
            // else
            //     alert('Please upload a valid image file.');
        }
    }
    catch(err){
        if(err.response){
            return alert(err.response.data.message);
        }
        console.log(err);
    }
}



// -------------------------

//download file alternate image load
function fileDefaultImage(event) {
  event.target.src = "http://35.153.237.118:80/public/image/download.png"
  event.onerror = null
}