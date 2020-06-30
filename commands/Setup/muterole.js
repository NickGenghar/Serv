const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

module.exports = {
    name: 'muterole',
    alias: [module.exports.name, 'mr'],
    desc: 'Assign or unassign a muted role.',
    usage: [
        '//muterole',
        'Get the current configuration status',
        '',
        '//muterole <Role> \'Apply\'',
        'Role: The role to be set as the muted role.',
        'Apply: Apply a permission override to all channels to deny send messages and connect permission of the muted role.',
        '',
        '//muterole Clear',
        'Clear the current muted role configuration.'
    ],
    dev: false,
    mod: true,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
    
        if(!args[0]) {
            let muteroleEmbed = new Discord.MessageEmbed()
            .setTitle('Muted Role Config')
            .addField('Role', svr.muteRole.length > 0 ? msg.guild.roles.cache.get(svr.muteRole) : 'No role set.', true);
    
            return msg.channel.send({embed: muteroleEmbed});
        } else if(args[0].toLowerCase() == 'clear') {
            svr.muteRole = '';
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            return msg.channel.send('Muted role cleared.');
        } else {
            let mutedRole = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[0]);
            if(!mutedRole) return msg.channel.send('Provided role does not return any results.');
            svr.muteRole = mutedRole.id;
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            return msg.channel.send(`Role ${mutedRole} has been set as Muted Role.`);
        }
    }
}