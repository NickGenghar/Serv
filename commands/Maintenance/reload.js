const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');
const reload = require('../../initial/reload.js');

module.exports = {
    name: 'reload',
    alias: [module.exports.name, 'rl'],
    desc: 'Reloads the command modules. WARNING! Will delete any timers attached to the bot.',
    usage: [
        '//Reload'
    ],
    dev: true,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, queue) => {
        if(!master.developer.includes(msg.author.id)) return;
        await msg.delete()
        .then(() => {
            msg.channel.send('Reloading commands...');
        })
        .catch(e => console.log(e));
    
        reload(msg.client);
    }
}