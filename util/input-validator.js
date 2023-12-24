
module.exports.text = (input) => {
    if(input === undefined || input.length===0)
        return true;
    return false;
}

module.exports.number = (input) => {
    if(input === NaN)
        return true;
    return false;
}