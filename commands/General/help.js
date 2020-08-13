const Discord = require('discord.js');
const master = require('../../configurations/master.json');

module.exports = {
    name: 'help',
    alias: ['help', 'h'],
    desc: 'List down all the commands as well as the details of a command',
    usage: [
        '//help [Command]',
        'Command:',
        'The command name to get the detailed explanation of.'
    ],
    dev: false,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        let helpEmbed = new Discord.MessageEmbed();

        if(args[0]) {
            let finalCommand = msg.client.commands.get(args[0].toLowerCase());
            if(!finalCommand) return msg.channel.send(`No command named **${args[0].toLowerCase()}**.`);

            if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id)) && finalCommand.mod)
            return msg.channel.send('Sorry, this command information is limited to moderators of the server.');

            if(!master.developer.includes(msg.author.id) && finalCommand.dev)
            return msg.channel.send('Sorry, this command information is limited to the developer.');

            helpEmbed.setTitle(`Command Info of ${finalCommand.name}`)
            .setThumbnail(msg.client.user.displayAvatarURL)
            .addField('Name', finalCommand.name, true)
            .addField('Alias', finalCommand.alias, true)
            .addField('Type', finalCommand.type)
            .addField('Description', finalCommand.desc, true)
            .addField('Usage', finalCommand.usage, true)
            .addField('Requires Activation?', finalCommand.activate, true);

            return msg.channel.send({embed: helpEmbed});
        } else {
            let commandTypes = msg.client.commands.map(n => n.type).filter((v, i, a) => {return a.indexOf(v) === i});
            let index = 0;
            helpEmbed.setTitle(`[1 of ${commandTypes.length}] Available Commands`)
            .setThumbnail(msg.client.user.displayAvatarURL);

            let commandNames = msg.client.commands.filter(t => t.type == commandTypes[index]).map(n => n.name);
            helpEmbed.addField(commandTypes[index], commandNames);
            msg.channel.send({embed: helpEmbed})
            .then(m => {
                if(!col.get(`${msg.guild.id}.${msg.author.id}`))
                    col.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);
                let static = col.get(`${msg.guild.id}.${msg.author.id}`);
                let filterReact = (reaction, user) => {
                    return (reaction.emoji.name == '◀' || reaction.emoji.name == '▶' || reaction.emoji.name == '🔴') && user.id == static;
                }

                m.react('◀')
                .then(() => {m.react('▶')})
                .then(() => {m.react('🔴')});

                let data = m.createReactionCollector(filterReact);
                data.on('collect', (react, user) => {
                    helpEmbed = new Discord.MessageEmbed(helpEmbed);

                    switch(react.emoji.name) {
                        case('◀'): {
                            index--;
                            if(index < 0) index = 0;
                            let newCmdName = msg.client.commands.filter(t => t.type == commandTypes[index]).map(n => n.name);
                            helpEmbed
                            .setTitle(`[${index + 1} of ${commandTypes.length}] Available Commands`)
                            .spliceFields(0,1)
                            .addField(commandTypes[index], newCmdName);
                        } break;
                        case('▶'): {
                            index++;
                            if(index >= commandTypes.length) index = commandTypes.length - 1;
                            let newCmdName = msg.client.commands.filter(t => t.type == commandTypes[index]).map(n => n.name);
                            helpEmbed
                            .setTitle(`[${index + 1} of ${commandTypes.length}] Available Commands`)
                            .spliceFields(0,1)
                            .addField(commandTypes[index], newCmdName);
                        } break;
                        case('🔴'): {
                            return data.stop();
                        } //break;
                    }
                    m.edit({embed: helpEmbed})
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
                    let finalEmbed = new Discord.MessageEmbed(helpEmbed)
                    .setTitle('Finished');

                    m.edit({embed: finalEmbed})
                    .then(() => {
                        m.reactions.removeAll();
                        col.delete(`${msg.guild.id}.${msg.author.id}`);
                    });
                });
            });
        }
    }
}