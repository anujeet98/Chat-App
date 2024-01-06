
const userListCreate = document.getElementById("usersList-container-create");
const userListEdit = document.getElementById("usersList-container-edit");
const chatDefaultView = document.getElementById("container2-default");
const chatView = document.getElementById("container2-chat");
const groupContainerBody = document.getElementById('groupContainer-body');
const cancelBtn = document.getElementsByClassName("cancelGrpBtn");

let selectedGroup = -1;
let selectedGroupBtn = null;

//------------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', ()=>{
    reloadPage();
});

async function reloadPage(){
    try{
        groupContainerBody.innerHTML = '';
        const userGroups = await getUserGroupsAPI();
        document.getElementById('profileNameDiv').innerText = userGroups.data.username;
        userGroups.data.groups.forEach(group => {
            renderGroup(group.name, group.id);
        });
    }
    catch(err){
        console.error(err);
    }
}





//--------------------------------------------------------------------------------------------------------------------------------


function populateSearchList(users, DOMElement){
    DOMElement.innerHTML='';
    users.forEach(user => {
        const div = 
        `
            <div class="userlist-div"> 
                <label>
                ${user.username}<input type="checkbox" class="userlist-checkbox userlist-create-checkbox" value=${user.id}>
                </label>
            </div
        `
        DOMElement.innerHTML += div;
    });
}

function renderGroup(groupName, groupId){
    groupContainerBody.innerHTML += `
        <button class="groupBtn" onclick="loadGroup(event,'${groupName}',${groupId})">
            <div class="group">
                <img src="../public/image/user.JPG" alt="display.JPG" class="display-img"/>
                <div class="group-name">${groupName}</div>
            </div>
        </button>`;
}


function loadGroup(e,groupName,groupId){
    //update chat-view if its default
    if(!chatDefaultView.classList.contains("hidden")){
        chatDefaultView.classList.add("hidden");
        chatView.classList.remove("hidden");
    }

    //Update Chat Header with Group Name
    document.getElementById('editGroupBtn').innerText = groupName;


    //highlight selected group 
    if(selectedGroupBtn!=null)
        selectedGroupBtn.classList.toggle("selected");
    e.target.classList.toggle("selected");
    selectedGroupBtn = e.target;

    //load-group messages
    selectedGroup = groupId;
    chatBody.innerHTML = '';
    loadOldMessages(selectedGroup);
    loadNewMessages(selectedGroup);
}

function container1Cancel() {
    const container1Views = document.querySelectorAll('.container1-content');
    container1Views.forEach(element => {
        element.classList.add('hidden');
    });

    document.getElementById("groupContainer").classList.remove("hidden");
};

async function generateGroupForm() {
    try{
        const container1Views = document.querySelectorAll('.container1-content');
        container1Views.forEach(element => {
            element.classList.add('hidden');
        });
    
        document.getElementById("groupFormContainer").classList.remove("hidden");

        let users = await fetchAllUsersAPI();
        populateSearchList(users.data, userListCreate);
    }
    catch(err){
        console.log(err)
    }
};

async function generateEditGroup() {
    try{
        const container1Views = document.querySelectorAll('.container1-content');
        container1Views.forEach(element => {
            element.classList.add('hidden');
        });
    
        document.getElementById("editGroupContainer").classList.remove("hidden");

        const groupInfo = await getGroupInfoAPI();
        renderEditGroupPage(groupInfo.data);
    }
    catch(err){
        console.error(err);
    }
};

function generateAddMemberForm(){
    const container1Views = document.querySelectorAll('.container1-content');
    container1Views.forEach(element => {
        element.classList.add('hidden');
    });

    document.getElementById("addMemberContainer").classList.remove("hidden");
}



function renderEditGroupPage(groupInfo){
    const userIsAdmin = groupInfo.isAdmin;
    const groupName = document.getElementById('groupName-edit');
    const groupDescription = document.getElementById('groupDescription-edit')
    
    //fill in groupName and groupDescription
    groupName.value = groupInfo.group.name;
    groupDescription.value = groupInfo.group.description;

    //fill in memberList Div
    const memberListContainer = document.getElementById('memberList-container');
    memberListContainer.innerHTML = '';
    groupInfo.members.forEach(member=>{
        const div = createMemberListDiv(groupInfo, member);
        memberListContainer.innerHTML += div;
    });

    //fill in userList Div
    const userListEditContainer = document.getElementById('usersList-container-edit');
    userListEditContainer.innerHTML = '';
    groupInfo.nonMembers.forEach(nonMember=>{
        const div = createUserListDiv(nonMember);
        userListEditContainer.innerHTML += div;
    });

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

function createMemberListDiv(groupInfo,member){   
    const adminBtnsDOM = `
        <div id="userList-adminBtn">
            ${member.isAdmin?
                `<button class="adminBtns" onclick="removeGroupAdmin(${groupInfo.group.id}, ${member.user.id})">Dismiss</button>`:
                `<button class="adminBtns" onclick="addGroupAdmin(${groupInfo.group.id}, ${member.user.id})">Admin</button>`
            }
            <button class="adminBtns" onclick="removeUser(${groupInfo.group.id}, ${member.user.id})">Remove</button>
        </div>
    `;

    const memberListDivDOM = `
        <div class="userlist-div">
            <div id="userList-username">${member.user.username}</div>
            <div id="userList-admintag">${member.isAdmin?'Admin':''}</div>
                ${(groupInfo.isAdmin && member.user.id !== groupInfo.reqUserId) ? 
                    `${adminBtnsDOM}`:``
                }
        </div>
    `;
    return memberListDivDOM;
}

function createUserListDiv(user){
    return `
        <div class="userlist-div"> 
            <label>
            ${user.username}<input type="checkbox" class="userlist-checkbox userList-edit-checkbox" value=${user.id}>
            </label>
        </div
    `
}


// -------------------------------------------------------------------------------------------------------------------------

async function createGroupAPI(groupName, groupDescription, selectedUserList){
    try{
        const grpObj = {
            groupName: groupName,
            groupDescription: groupDescription,
            members: selectedUserList
        };
        
        return await axios.post('http://35.153.237.118:80:4000/group/create-group/', grpObj, {headers: {'Authorization': localStorage.getItem('token')}});
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

async function getGroupInfoAPI(){
    try{
        return await axios.get(`http://35.153.237.118:80:4000/group/get-info?groupId=${selectedGroup}`, {headers: {"Authorization": localStorage.getItem("token")}});
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

async function fetchAllUsersAPI(){
    try{
        return axios.get('http://35.153.237.118:80:4000/user/get-users', {headers: {"Authorization": localStorage.getItem("token")}});
    }
    catch{
        if(err){
            alert(err.response.data.message);
        }
    }

}

async function getUserGroupsAPI(){
    try{    
        return await axios.get('http://35.153.237.118:80:4000/user/groups', {headers: {'Authorization': localStorage.getItem('token')}});
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

async function addGroupAdmin(groupId, memberId){
    try{
        const reqObj ={
            groupId: groupId,
            memberId: memberId
        };
        const response = await axios.put(`http://35.153.237.118:80:4000/group/add-admin`, reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
        generateEditGroup();
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

async function removeGroupAdmin(groupId, memberId){
    try{
        const reqObj ={
            groupId: groupId,
            memberId: memberId
        };
        const response = await axios.put(`http://35.153.237.118:80:4000/group/remove-admin`, reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
        generateEditGroup();
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

async function removeUser(groupId, memberId){
    try{
        const response = await axios.delete(`http://35.153.237.118:80:4000/group/remove-user?memberId=${memberId}&groupId=${groupId}`, {headers: {'Authorization': localStorage.getItem('token')}});
        generateEditGroup();
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

async function updateGroupAPI(groupName, groupDescription){
    try{
        const reqObj = {
            groupName: groupName,
            groupDescription: groupDescription,
            groupId: selectedGroup
        };

        return await axios.put('http://35.153.237.118:80:4000/group/update', reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

async function addUsersAPI(selectedUsers){
    try{      
        const reqObj = {
            groupId: selectedGroup,
            members: selectedUsers
        };
        return await axios.post('http://35.153.237.118:80:4000/group/add-users/', reqObj, {headers: {'Authorization': localStorage.getItem('token')}});
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}


//-------------------------------------------------------------------------------------------------------------------------

async function addUsers(){
    try{
        const selectedUsers = document.querySelectorAll('.userlist-checkbox:checked');
        const selectedUserList = [];
        selectedUsers.forEach(e=>selectedUserList.push(e.value));
        console.log(selectedUsers)
    
        if(selectedUserList.length===0)
            return alert('Kindly select the users to add');
    
        console.log(selectedUsers, selectedUserList)
        const response = await addUsersAPI(selectedUserList);
        alert(response.data.message);
        generateEditGroup();
    }
    catch(err){
        console.error(err);
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
        document.getElementById('editGroupBtn').innerText = groupName;
        alert(response.data.message);
        reloadPage();
        generateEditGroup();
    }
    catch(err){
        console.error(err);
    }
}

async function createGroup(){
    try{
        const groupName = document.getElementById('groupName-create').value;
        const groupDescription = document.getElementById('groupDescription-create').value;
        const selectedUsers = document.querySelectorAll('.userlist-create-checkbox:checked');
        const selectedUserList = [];
        selectedUsers.forEach(e=>selectedUserList.push(e.value));

        if(groupName===undefined || groupName===null || groupName==='' || groupDescription===undefined || groupDescription===null || groupDescription==='' || selectedUserList.length===0)
            return alert('Kindly fill all the fields and select the users');
    
        const response = await createGroupAPI(groupName, groupDescription, selectedUserList);
        renderGroup(groupName, response.data.groupCreated.id);
        cancelBtn[0].click();
    }
    catch(err){
        if(err){
            alert(err.response.data.message);
        }
    }
}

//--------------------------------------------------------------------------------------------------------------------------------------------------


setInterval(()=>{
    loadNewMessages(selectedGroup);
},2000);