const Discord = require('discord.js');
const replyPool = require('../../configurations/defaults.json').replyPool;

module.exports = {
    name: 'reply',
    alias: ['reply'],
    desc: 'Gives a response to the user.',
    usage: [
        '//reply <Text>',
        '',
        'Text: A random text for Serv to reply to.'
    ],
    dev: false,
    mod: false,
    activate: true,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(!svr.modules.includes(module.exports.name)) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');

        if(!args[0]) return msg.channel.send('No question given...');
        else return msg.channel.send(replyPool[Math.floor(Math.random() * replyPool.length)]);
    }
}