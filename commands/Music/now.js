const Discord = require('discord.js');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'now',
    alias: [module.exports.name, 'n', 'np'],
    desc: 'Get\'s the currently playing audio track',
    usage: ['//now'],
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
        .setColor(color.red)
        .setThumbnail(SQ.list[0].thumbnail)
        .setTitle('Now Playing', SQ.list[0].title)
        .setDescription(SQ.list[0].description)
        .setURL(SQ.list[0].url);

        msg.channel.send({embed: playEmbed});
    }
}