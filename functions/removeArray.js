/**
 * @param {Array<any>} r1 The array to do the removal of elements.
 * @param {Array<any>} r2 The array containing elements to remove in the first array.
 * @returns {Array<any>} Returns the modified array without mutating the inputted arrays.
 */
module.exports = (r1, r2) => {
    r1 = r1.filter((v,i,a) => {return a.indexOf(v) === i;});
    for(const v of r2) r1.splice(r1.indexOf(v),1);
    return r1;
}