const Discord = require('discord.js');
const state = require('../../initial/state.js');

const master = require.main.require('./configurations/master.json');

module.exports = {
    name: 'state',
    alias: [module.exports.name, 'fix'],
    desc: 'Checks the state of all guild data and perform necessary fix on them.',
    usage: [
        '//state',
        '',
        'Note: All outputs are logged in the terminal. Open the terminal to check the output results.'
    ],
    dev: true,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        await msg.delete().catch(e => console.log(e));
        if(!master.developer.includes(msg.author.id)) return;
        msg.channel.send('Performing checks on data stores. Open the terminal to check the output.')
        .then(() => state());
    }
}