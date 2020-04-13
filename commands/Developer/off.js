const fs = require('fs');

const master = require.main.require('./configurations/master.json').developer;

let clear = () => {
    fs.readdir('./temp', (e, f) => {
        let files = f.filter(e => {if(e.indexOf('.') > -1) return e});
        files.forEach(g => {
            fs.unlink(`./temp/${g}`, e => {
                if(e) return console.log(e);
            })
        })
    })
}

module.exports = {
    name: 'off',
    alias: ['off', 'oof', 'snap'],
    desc: 'Shut down the bot.',
    usage: [
        '//off'
    ],
    run: async (msg, args) => {
        if(!master.includes(msg.author.id)) return;
        clear();
        await msg.delete().catch(e => console.log(e));
        console.log(`\x1b[34m%s\x1b[0m`, 'Shutting down bot...');
        process.exit(0);
    }
}