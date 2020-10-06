const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

module.exports = {
    name: 'ping',
    alias: [module.exports.name],
    desc: '',
    usage: [],
    dev: true,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        if(!master.developer.includes(msg.author.id)) return;
    
        msg.channel.send('Latency:').then(sent => {
            sent.edit(`Latency: \`${sent.createdTimestamp - msg.createdTimestamp}ms\``);
        });
        return;
    }
}