const Discord = require('discord.js');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'userinfo',
    alias: ['userinfo', 'user', 'u', 'ui', 'who', 'spy'],
    desc: 'Get\'s the information of the given user or yourself.',
    usage: [
        '//userinfo [Username]',
        'Username: Target user.'
    ],
    run: async (msg, args) => {
        let User = msg.mentions.members.first() || msg.guild.members.get(args[0]);

        if (!User) User = msg.author;
        if (User.username == void (0)) User = User.user;

        let userinfoEmbed = new Discord.MessageEmbed()
            .setTitle('User Information')
            .setColor(color.purple)
            .setThumbnail(User.displayAvatarURL({size:2048}))
            .addField('Client Username', User.username, true)
            .addField('Client Discriminator', User.discriminator, true)
            .addField('Client Nickname', User.nickname, true)
            .addField('Client ID', User.id, true)
            .addField('Client Status', User.presence.status, true)
            .addField('Joined Server since', msg.member.joinedAt, true)
            .addField('Joined Discord since', User.createdAt, true);

        msg.channel.send({embed: userinfoEmbed});
    }
}