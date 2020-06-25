const Discord = require('discord.js');
const fs = require('fs');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'userinfo',
    alias: ['userinfo', 'user', 'u', 'ui', 'who', 'spy'],
    desc: 'Get\'s the information of a given user or yourself.\nNot to be confused with `memberinfo` where it fetches the amount of members in the server.',
    usage: [
        '//userinfo [Username]',
        'Username: Target user. If unspecified, the command gets your user data instead.'
    ],
    run: async (msg, args) => {
        let User = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

        if(!User) User = msg.guild.members.cache.get(msg.author.id);

        let userinfoEmbed = new Discord.MessageEmbed()
            .setTitle('User Information')
            .setColor(color.purple)
            .setThumbnail(User.user.displayAvatarURL({size:2048}))
            .addField('Client Username', User.user.username, true)
            .addField('Client Discriminator', User.user.discriminator, true)
            .addField('Client Nickname', User.displayName, true)
            .addField('Client Status', User.presence.status, true)
            .addField('Joined Server since', msg.member.joinedAt, true)
            .addField('Joined Discord since', User.user.createdAt, true)
            .addField('Boosted Since', User.premiumSince ? User.premiumSince : 'Never', true);

        msg.channel.send({embed: userinfoEmbed});
    }
}