const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'help',
    alias: ['help', 'h'],
    desc: 'List down all the commands as well as the details of a command',
    usage: [
        '//help [Command]',
        'Command:',
        'The command name to get the detailed explanation of.'
    ],
    run: async (msg, args) => {
        var helpEmbed = new Discord.MessageEmbed();
        if(args[0]) {
            let finalCommand = msg.client.commands.get(args[0]);
            if(!finalCommand) return msg.channel.send(`No command named **${args[0]}**.`);
            helpEmbed.setTitle(`Command Info of ${finalCommand.name}`)
            .setThumbnail(msg.client.user.displayAvatarURL)
            .addField('Name', finalCommand.name, true)
            .addField('Alias', finalCommand.alias, true)
            .addField('Type', finalCommand.type)
            .addField('Description', finalCommand.desc, true)
            .addField('Usage', finalCommand.usage, true)
        } else {
            let commandTypes = msg.client.commands.map(n => n.type).filter((v, i, a) => {return a.indexOf(v) === i});
            helpEmbed.setTitle(`Available Commands`)
            .setThumbnail(msg.client.user.displayAvatarURL);

            for(let i = 0; i < commandTypes.length; i++) {
                let commandNames = msg.client.commands.filter(t => t.type == commandTypes[i]).map(n => n.name);
                helpEmbed.addField(commandTypes[i], commandNames, true);
            }
        }

        msg.channel.send({embed: helpEmbed});
    }
}