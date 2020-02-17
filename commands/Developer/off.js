const Discord = require('discord.js');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

module.exports = {
    name: 'off',
    alias: ['off', 'oof', 'snap'],
    desc: 'Shut down the bot.',
    usage: [
        '//off'
    ],
    run: async (msg, args) => {
        if(!dev.includes(msg.author.id)) return;
        await msg.delete().catch(e => console.log(e));
        console.log(`\x1b[34m%s\x1b[0m`, 'Shutting down bot...');
        process.exit(0);
    }
}