const Discord = require('discord.js');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'serverinfo',
    alias: ['si', 'serverinfo', 'guild', 'pool', 'coolkids'],
    desc: 'Gets the information of the server/guild.',
    usage: '//serverinfo',
    access: 'Members',
    run: async (msg) => {
        let user = msg.guild.members.cache.map(e => e.presence).map(e => e.status);
        let serverinfoEmbed = new Discord.MessageEmbed()
            .setTitle('Server Information')
            .setColor(color.purple)
            .setThumbnail(msg.guild.iconURL)
            .addField('Server Name', msg.guild.name, true)
            .addField('Server Owner', msg.guild.owner, true)
            .addField('Server Region', msg.guild.region, true)
            .addField('Created since', msg.guild.createdAt, true)
            .addField('Available Roles', msg.guild.roles.cache.array().sort(), true)
            .addField('Requested by', msg.author, true)
            .addField('You joined since', msg.member.joinedAt, true)
            .addField('Members', msg.guild.memberCount)
            .addField('Online', user.filter(a => a == 'online').length)
            .addField('Idle', user.filter(a => a == 'idle').length)
            .addField('Do Not Disturb', user.filter(a => a == 'dnd').length)
            .addField('Offline', user.filter(a => a == 'offline').length);

        msg.channel.send({embed: serverinfoEmbed});
    }
}