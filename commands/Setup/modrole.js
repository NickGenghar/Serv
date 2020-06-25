const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

O = new Object;

O.name = 'modrole';
O.alias = ['modrole', 'mdr'];
O.desc = 'Configure the moderation role of the server.';
O.usage = [
    '//Modrole',
    'Get the current status of the moderation role.',
    '',
    '//Modrole <Role>',
    'Role: The role you want to add to or remove from the configuration.',
    'The command will automatically add and remove the roles based on the existence of the role in the configuration.'
];
O.run = async (msg, args, queue) => {
    let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
    if(svr.modRole.length <= 0 && !msg.guild.member(msg.author).hasPermission(['ADMINISTRATOR'])) return msg.channel.set('To set up a moderator role, you need to have the Administrator permission.');
    else if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id)) && !msg.guild.member(msg.author).hasPermission(['ADMINISTRATOR'])) return msg.channel.send('You do not have the moderation role or the required permission to use this command.');
    
    let modRole = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[0]); args.shift();

    if(!modRole) {
        let modRoleEmbed = new Discord.MessageEmbed()
        .setTitle('Moderator Role Config');

        let gModRole = msg.guild.roles.cache.array();
        let modRoles = [];
        for (let i of gModRole)
        for (let j of svr.modRole) {
            if(i.id == j) modRoles.push(i);
        }

        modRoleEmbed.setDescription(modRoles.join('\n'));
        return msg.channel.send({embed: modRoleEmbed});
    }

    if(svr.modRole.includes(modRole.id)) {
        svr.modRole.splice(svr.modRole.findIndex(v => v == modRole.id), 1);
        fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
        msg.channel.send(`Removed role ${modRole} from the moderator role configuration.`);
    } else {
        svr.modRole.push(modRole.id);
        fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
        msg.channel.send(`Added role ${modRole} to the moderator role configuration.`);
    }
};
O.dev = false;

module.exports = O;