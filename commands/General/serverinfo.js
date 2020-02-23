const Discord = require('discord.js');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'serverinfo',
    alias: ['si', 'serverinfo', 'guild', 'pool', 'coolkids'],
    desc: 'Gets the information of the server/guild.',
    usage: '//serverinfo',
    access: 'Members',
    run: async (msg) => {
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
            .addField('Members', msg.guild.memberCount);

        msg.channel.send({embed: serverinfoEmbed});
    }
}