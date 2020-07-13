/**
 * @param {String} numerical An string containing the numeric value with or without switches.
 */
module.exports = (numerical) => {
    let duration;
    if(typeof numerical === 'string') {
        if(parseInt(numerical) < 0 || parseInt(numerical) == NaN) duration = -1;
        else {
        let value = [...numerical];
        let select = value.pop();
        value = value.length > 0 ? parseInt(value.join('')) : 0;
        if(select == 's') {duration = value;}
        else if(select == 'm') {duration = value * 60;}
        else if(select == 'h') {duration = value * 3600;}
        else if(select == 'd') {duration = value * 86400;}
        else if(select == 'w') {duration = value * 604800;}
        else if(!isNaN(parseFloat(select))) {duration = value*10 + parseInt(select);}
        else {duration = -1;}
        duration = parseInt(duration);}
    } else {
        duration = -1;
    }

    return duration;
}