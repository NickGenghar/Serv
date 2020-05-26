const Discord = require('discord.js');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'now',
    alias: ['now', 'n'],
    desc: 'Get\'s the currently playing audio track',
    usage: ['//now'],
    run: async (msg, args, queue) => {
        let SQ = queue.get(`${msg.guild.id}.music`);
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