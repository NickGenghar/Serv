const Discord = require('discord.js');
const fs = require('fs');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'now',
    alias: ['now', 'n'],
    desc: 'Get\'s the currently playing audio track',
    usage: ['//now'],
    run: async (msg, args, queue) => {
        let SQ = queue.get(msg.guild.id);
        if(!SQ) return;

        let playEmbed = new Discord.MessageEmbed()
        .setColor(color.red)
        .setThumbnail(SQ.songs[0].thumbnail)
        .addField('Now Playing', SQ.songs[0].title)
        .addField('Description', SQ.songs[0].description);
    
        msg.channel.send({embed: playEmbed});
    }
}