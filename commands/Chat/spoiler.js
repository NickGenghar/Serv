const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'spoiler',
    alias: ['spoiler', 'hide', 'redacted'],
    desc: 'Generates a spoiler based on input.',
    usage: [
        '//spoiler <text> [mode]',
        'text: Text to make a spoiler.',
        'mode: Simple or Full,',
        'Simple = full text being set to spoiler,',
        'Full = every letter has a spoiler.',
        '',
        'This command is effective if the input does not have any spoiler tags.'
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

        if (args.length > 1) {
            let Mode = args.pop();
            let simple = ['s', 'simple'];
            let full = ['f', 'full'];
            let word;

            if (simple.includes(Mode.toLowerCase())) {
                word = args.join('|| ||');
            } else if (full.includes(Mode.toLowerCase())) {
                word = [...args.join(' ')].join('||||');
            } else {
                word = `${args.join('|| ||')}|| ||${Mode}`;
            }

            msg.delete().catch(e => console.log(e));
            return msg.channel.send(`||${word}||`);
        } else if (args.length == 1) {
            word = args;
            msg.delete().catch(e => console.log(e));
            return msg.channel.send(`||${word}||`);
        } else {
            return msg.channel.send(`Please provide a word to create a spoiler with.`);
        }
    }
}