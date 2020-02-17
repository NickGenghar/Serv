const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.on('line', input => {
    if(input == '//kill\\\\') return rl.close();
    console.log(input);
})