const Discord = require('discord.js');

O = new Object;

O.name = 'memberinfo';
O.alias = ['memberinfo','mi'];
O.desc = 'Get\'s the information of the server member. Not to be confused with `userinfo` where it fetches the data of a user.';
O.usage = [
    '//memberinfo',
    'Returns the amount of users based on their status.'
];
O.run = async (msg, args, queue) => {
    let user = msg.guild.members.cache.map(e => e.presence).map(e => e.status);
    let memberEmbed = new Discord.MessageEmbed()
    .setTitle('Member Info')
    .setThumbnail(msg.guild.iconURL)
    .setDescription(`Current member counts:\n${msg.guild.memberCount}`)
    .addField('Online', user.filter(a => a == 'online').length, true)
    .addField('Idle', user.filter(a => a == 'idle').length, true)
    .addField('Do Not Disturb', user.filter(a => a == 'dnd').length, true)
    .addField('Offline', user.filter(a => a == 'offline').length, true);

    return msg.channel.send({embed: memberEmbed});
}

module.exports = O;