const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

O = new Object;

O.name = 'roleinfo';
O.alias = ['roleinfo','ri'];
O.desc = 'Get\'s the server role information.';
O.usage = [
    '//roleinfo',
    'Gets the list of all the available roles sorted by how the roles are positioned in the server.',
    '',
    '//roleinfo <Role>',
    'Role: Get detailed information of that specific role.'
];
O.run = async (msg, args, queue) => {
    let roles = msg.guild.roles.cache.array().sort((a,b) => b.position - a.position);

    if(!args[0]) {
        let roleEmbed = new Discord.MessageEmbed()
        .setTitle('Server Roles')
        .setDescription(roles)
        .setThumbnail(msg.guild.iconURL);

        return msg.channel.send({embed: roleEmbed});
    } else {
        let role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[0]);
        if(!role) return msg.channel.send('Provided role does not return anything.');

        let roleMembers = role.members.array();
        let roleMemberCount = roleMembers.length;

        let roleEmbed = new Discord.MessageEmbed()
        .setTitle('Role Info')
        .setThumbnail(msg.guild.iconURL)
        .addField('Name', role.name, true)
        .addField('Position', role.position, true)
        .addField('Integrated Role?', role.managed ? 'Yes' : 'No', true)
        .addField('Separated from online members?', role.hoist ? 'Yes': 'No', true)
        .addField('Member Counts', roleMemberCount, true);

        return msg.channel.send({embed: roleEmbed});
    }
}

module.exports = O;