const Discord = require('discord.js');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'queue',
    alias: ['queue', 'q'],
    desc: 'Get\'s the currently playing audio track',
    usage: ['queue'],
    run: async (msg, args, queue) => {
        let SQ = queue.get(`${msg.guild.id}.music`);
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