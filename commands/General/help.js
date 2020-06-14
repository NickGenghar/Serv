const Discord = require('discord.js');

module.exports = {
    name: 'help',
    alias: ['help', 'h'],
    desc: 'List down all the commands as well as the details of a command',
    usage: [
        '//help [Command]',
        'Command:',
        'The command name to get the detailed explanation of.'
    ],
    run: async (msg, args, queue) => {
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
            .addField('Usage', finalCommand.usage, true);

            return msg.channel.send({embed: helpEmbed});
        } else {
            let commandTypes = msg.client.commands.map(n => n.type).filter((v, i, a) => {return a.indexOf(v) === i});
            let index = 0;
            helpEmbed.setTitle(`Available Commands`)
            .setThumbnail(msg.client.user.displayAvatarURL);

            let commandNames = msg.client.commands.filter(t => t.type == commandTypes[index]).map(n => n.name);
            helpEmbed.addField(commandTypes[index], commandNames);
            msg.channel.send({embed: helpEmbed})
            .then(m => {
                if(!queue.get(`${msg.guild.id}.${msg.author.id}`))
                    queue.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);
                let static = queue.get(`${msg.guild.id}.${msg.author.id}`);
                let filterReact = (reaction, user) => {
                    return (reaction.emoji.name == '◀' || reaction.emoji.name == '▶' || reaction.emoji.name == '🔴') && user.id == static;
                }

                m.react('◀')
                .then(() => {m.react('▶')})
                .then(() => {m.react('🔴')});

                let data = m.createReactionCollector(filterReact);
                data.on('collect', (react, user) => {
                    let newHelpEmbed = new Discord.MessageEmbed(helpEmbed);

                    switch(react.emoji.name) {
                        case('◀'): {
                            index--;
                            if(index < 0) index = 0;
                            let newCmdName = msg.client.commands.filter(t => t.type == commandTypes[index]).map(n => n.name);
                            newHelpEmbed
                            .spliceFields(0,1)
                            .addField(commandTypes[index], newCmdName);
                        } break;
                        case('▶'): {
                            index++;
                            if(index >= commandTypes.length) index = commandTypes.length - 1;
                            let newCmdName = msg.client.commands.filter(t => t.type == commandTypes[index]).map(n => n.name);
                            newHelpEmbed
                            .spliceFields(0,1)
                            .addField(commandTypes[index], newCmdName);
                        } break;
                        case('🔴'): {
                            return data.stop();
                        } //break;
                    }
                    m.edit({embed: newHelpEmbed})
                    .then(async () => {
                        const collection = m.reactions.cache.filter(r => r.users.cache.has(static));
                        try {
                            for(const r of collection.values())
                            await r.users.remove(static);
                        } catch(e) {
                            if(e) throw e;
                        }
                    });
                });
                data.on('end', () => {
                    let finalEmbed = new Discord.MessageEmbed()
                    .setTitle('Finished');

                    m.edit({embed: finalEmbed})
                    .then(() => {
                        m.reactions.removeAll();
                        queue.delete(`${msg.guild.id}.${msg.author.id}`);
                    });
                });
            });
        }
    }
}