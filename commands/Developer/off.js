const Discord = require('discord.js');

const master = require.main.require('./configurations/master.json').developer;
const clear = require('../../initial/clear.js');

module.exports = {
    name: 'off',
    alias: ['off', 'oof', 'snap'],
    desc: 'Shut down the bot.',
    usage: [
        '//off'
    ],
    dev: true,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg
     * @param {Array<String>} [args]
     */
    run: async (msg, args) => {
        if(!master.includes(msg.author.id)) return;
        msg.delete()
        .then(() => {
            console.log(`\x1b[34m%s\x1b[0m`, 'Shutting down bot...');
            clear();
            process.exit(0);
        })
        .catch(e => {if(e) throw e;});
    }
}