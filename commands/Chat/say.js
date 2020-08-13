const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'say',
    alias: ['say', 'tell', 'talk'],
    desc: 'Using Serv to talk. Fancy eh?',
    usage: [
        '//say <Text> [Channel]',
        '',
        'Text: The text you want the bot to say.',
        'Channel: The channel you want the bot to send the message to.'
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

        await msg.delete().catch(e => console.log(e));

        let chat = `> ${args.join(' ')}\n - ${msg.author}`;
        let chan = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[args.length - 1])
        if(chan) {
            let access = chan.permissionsFor(msg.guild.member(msg.author));
            if( !access.has('VIEW_CHANNEL') || !access.has('SEND_MESSAGES') || !access.has('READ_MESSAGE_HISTORY')) return msg.channel.send('You do not have permission to send messages into that channel.');
            chan.send(chat);
        } else msg.channel.send(chat);
    }
}