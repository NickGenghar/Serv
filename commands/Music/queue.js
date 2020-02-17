const Discord = require('discord.js');
const fs = require('fs');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'queue',
    alias: ['queue', 'q'],
    desc: 'Get\'s the currently playing audio track',
    usage: ['queue'],
    run: async (msg, args, queue) => {
        let SQ = queue.get(msg.guild.id);
        if(!SQ) return;
        let playEmbed = new Discord.MessageEmbed()
        .setThumbnail(SQ.songs[0].thumbnail)
        .setColor(color.red)
        .addField('Now Playing', SQ.songs[0].title)
        .addField('First 10 Music In Queue', SQ.songs.map(s => `**${s.title}**`).slice(0, 10).join('\n'));
    
        msg.channel.send({embed: playEmbed});
    }
}