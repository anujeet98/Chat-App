

document.querySelectorAll('.content-group-btn').forEach(elem => {
    elem.addEventListener('click', ()=>{
        document.getElementById('content-conversation-default').style.display='none';
        document.getElementById('content-conversation-id').style.display='flex';
        document.getElementById('content-conversation-id').classList.add('active');
    });
});

document.getElementById('content-conversation-back-id').addEventListener('click', ()=>{
    document.getElementById('content-conversation-id').classList.remove('active');
});

