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
});