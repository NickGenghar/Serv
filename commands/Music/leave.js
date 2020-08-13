const Discord = require('discord.js');

module.exports = {
    name: 'leave',
    alias: [module.exports.name, 't', 'stop'],
    desc: 'Leaves the voice channel',
    usage: ['leave'],
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
        if(SQ) {
            col.delete(`${msg.guild.id}.music`);
            msg.channel.send('Queue data has been cleared.');
        }

        if(!msg.guild.me.voice.channel || msg.guild.me.voice.channelID != msg.member.voice.channelID) return;
        msg.guild.me.voice.channel.leave();
        msg.channel.send('Disconnected successfully.');
    }
}