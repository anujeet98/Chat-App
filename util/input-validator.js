
module.exports.text = (input) => {
    if(input === undefined || input === null || input.length===0)
        return true;
    return false;
}

module.exports.number = (input) => {
    if(input === undefined || input === null || input === NaN)
        return true;
    return false;
}

module.exports.file = (input) => {
    // if(input === undefined || !input.mimetype.startsWith('image/') || +input.size>5242880)
    if(input === undefined || +input.size>5242880)
        return true;
    return false;
}

module.exports.email = (input) => {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (input.match(validRegex))
        return false;
    else
        return true;
}

module.exports.phone = (input) => {
    var validRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (input.match(validRegex))
        return false;
    else
        return true;
}