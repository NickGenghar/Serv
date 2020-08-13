/**
 * @param {Array} arr Base array for key reference.
 * @param {Object} obj Target object for key comparison.
*/
module.exports = (arr, obj) => {
    for(let i of arr) {// for( let i = 0; i < arr.length; i++) {
        if(typeof obj[i] === 'object' && !Array.isArray(obj[i])) module.exports(arr, obj);
        if(typeof obj[i] === 'undefined') return false;
    }
    return true;
}