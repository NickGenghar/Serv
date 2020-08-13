const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'invert',
    alias: ['invert', 'mirror', 'in'],
    desc: 'Invert your text',
    usage: [
        '//Invert <Text>',
        'Text: Text to invert.'
    ],
    dev: false,
    mod: false,
    activate: true,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(!svr.modules.includes(module.exports.name)) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');

        msg.delete().catch(e => console.log(e));
        msg.channel.send([...args.join(' ')].reverse().join(''));
    }
}