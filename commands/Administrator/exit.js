const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'exit',
    alias: [module.exports.name],
    desc: 'Cause the bot to leave the server without the need to kick the bot.',
    usage: [
        '//exit'
    ],
    dev: false,
    mod: true,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        msg.channel.send('Thank you for using Serv.')
        .then(() => {
            return msg.guild.leave();
        });
    }
}