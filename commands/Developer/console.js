const child_process = require('child_process');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

module.exports = {
    name: 'console',
    alias: ['console', 'cmd'],
    desc: 'Activate command line option',
    usage: [
        '//cmd'
    ],
    run: async (msg, args) => {
        if(!dev.includes(msg.author.id)) return;
        child_process.exec('node console.js', (e, output, error) => {
            if(e) throw e;
            console.log(output);
            console.log(error);
        });
    }
}