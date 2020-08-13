const Discord = require('discord.js');
const fs = require('fs');

const defaults = require.main.require('./configurations/defaults.json');

module.exports = {
    name: 'prefix',
    alias: ['prefix', 'px'],
    desc: 'Change the server prefix.',
    usage: [
        '//prefix',
        'Get the current prefix of the bot. Take note that this can also be done by mentioning the bot if you don\'t know the prefix prior.',
        '',
        '//prefix <Prefix>',
        'Prefix: The new prefix.',
        '',
        '//prefix Reset',
        `Reset: Resets the prefix to the default prefix \`${defaults.prefix}\`.`
    ],
    dev: false,
    mod: true,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, queue) => {
        let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
    
        if(args.length <= 0) {
            msg.channel.send(`Current prefix: \`${svr.prefix}\``);
        } else if(args[0].toLowerCase() == 'reset') {
            svr.prefix = defaults.prefix;
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            msg.channel.send(`Prefix have been reset to default.\nCurrent prefix: \`${svr.prefix}\``);
        } else if(args[0].length > 5) {
            msg.channel.send('Prefix is too long. Preferably, the new prefix length should be at most 5 characters.');
        } else {
            svr.prefix = args[0];
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            msg.channel.send(`Prefix have been changed.\nCurrent prefix: \`${svr.prefix}\``);
        }
    }
};