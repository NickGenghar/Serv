const Discord = require('discord.js');

module.exports = {
    name: 'skip',
    alias: [module.exports.name, 's'],
    desc: 'skips the currently playing music',
    usage: ['//skip'],
    dev: false,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        let SQ = col.get(`${msg.guild.id}.music`);
        if(!SQ) return;
        msg.channel.send(`Skipped the song: **${SQ.list[0].title}**`);
        SQ.conn.dispatcher.end();
    }
}