const characterClass = require('../configurations/defaults.json').zalgos;

/**
 * @param {String} word The word to test the profanity/
 * @param {Array<String>} text An array containing the words to be tested.
 */
module.exports = (word, text) => {
    if(typeof word !== 'string') return false;
    word = [...word];

    for(let i of Object.keys(characterClass)) {
        i = [...i].pop();
        for(let j = 0; j < word.length; j++) {
            let char = characterClass[`_${i}`];
            word[j] = char.includes(word[j]) ? i : word[j];
        }
    }


    word = word.join('');
    for(let i of text)
    if(word.toLowerCase().match(i))
    return true;
    return false;
}