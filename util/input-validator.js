
module.exports.text = (input) => {
    if(input === undefined || input.length===0)
        return true;
    return false;
}

module.exports.number = (input) => {
    if(input === undefined || input === NaN)
        return true;
    return false;
}

module.exports.file = (input) => {
    // if(input === undefined || !input.mimetype.startsWith('image/') || +input.size>5242880)
    if(input === undefined || +input.size>5242880)
        return true;
    return false;
}