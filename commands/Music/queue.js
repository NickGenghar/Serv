const Discord = require('discord.js');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'queue',
    alias: [module.exports.name, 'q'],
    desc: 'Get\'s the currently playing audio track',
    usage: ['queue'],
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
        let playEmbed = new Discord.MessageEmbed()
        .setThumbnail(SQ.list[0].thumbnail)
        .setColor(color.red)
        .setTitle('Now Playing')
        .setDescription(SQ.list[0].title)
        .addField('First 10 Music In Queue', SQ.list.map(s => `**${s.title}**`).slice(0, 10).join('\n'));

        msg.channel.send({embed: playEmbed});
    }
}