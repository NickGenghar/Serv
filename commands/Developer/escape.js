const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

module.exports = {
    name: 'escape',
    alias: [module.exports.name, 'esc'],
    desc: 'Exits a server remotely.',
    usage: [
        '//Escape',
        'Prints out the server details which then gives the option to remove the bot from it.'
    ],
    dev: true,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        if(!master.developer.includes(msg.author.id)) return;
    
        let guilds = msg.client.guilds.cache.array();
        let index = 0;
        let escapeEmbed = new Discord.MessageEmbed()
        .setTitle(guilds[index].name)
        .setThumbnail(guilds[index].iconURL())
        .addField('Owner', guilds[index].owner, true)
        .addField('Time of Join', guilds[index].joinedAt, true)
        .setFooter(`${index + 1} of ${guilds.length}`);

        msg.channel.send({embed: escapeEmbed})
        .then(m => {
            if(!col.get(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`))
                col.set(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`, msg.author.id);
            let author = col.get(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`);
            let filterReact = (reaction, user) => {
                return (reaction.emoji.name == '◀' || reaction.emoji.name == '▶' || reaction.emoji.name == '🗑' || reaction.emoji.name == '🔴') && user.id == author;
            }

            m.react('◀')
            .then(() => {m.react('▶')})
            .then(() => {m.react('🗑')})
            .then(() => {m.react('🔴')});

            let data = m.createReactionCollector(filterReact, {idle:60000});
            data.on('collect', async (react, user) => {
                let newEscapeEmbed = new Discord.MessageEmbed(escapeEmbed);

                switch(react.emoji.name) {
                    case('◀'): {
                        index--;
                        if(index < 0) index = 0;

                        newEscapeEmbed
                        .setTitle(guilds[index].name)
                        .setThumbnail(guilds[index].iconURL())
                        .spliceFields(0,newEscapeEmbed.fields.length)
                        .addField('Owner', guilds[index].owner, true)
                        .addField('Time of Join', guilds[index].joinedAt, true)
                        .setFooter(`${index + 1} of ${guilds.length}`);
                    } break;
                    case('▶'): {
                        index++;
                        if(index >= guilds.length) index = guilds.length - 1;

                        newEscapeEmbed
                        .setTitle(guilds[index].name)
                        .setThumbnail(guilds[index].iconURL())
                        .spliceFields(0,newEscapeEmbed.fields.length)
                        .addField('Owner', guilds[index].owner, true)
                        .addField('Time of Join', guilds[index].joinedAt, true)
                        .setFooter(`${index + 1} of ${guilds.length}`);} break;
                    case('🗑'): {
                        try {
                            let left = await guilds[index].leave();
                            newEscapeEmbed
                            .setFooter(`Successfully left: ${left.name}`, left.iconURL());
                        } catch(e) {
                            if(e) {
                                newEscapeEmbed
                                .setFooter(`Error leaving server: ${guilds[index].name}`, guilds[index].iconURL());
                            }
                        }
                    } break;
                    case('🔴'): {
                        return data.stop();
                    } //break;
                }

                m.edit({embed: newEscapeEmbed})
                .then(async () => {
                    const collection = m.reactions.cache.filter(r => r.users.cache.has(author));
                    try {
                        for(const r of collection.values())
                        await r.users.remove(author);
                    } catch(e) {
                        if(e) throw e;
                    }
                });
            });

            data.on('end', () => {
                let finalEmbed = new Discord.MessageEmbed(escapeEmbed)
                .setTitle('Finished');

                m.edit({embed: finalEmbed})
                .then(() => {
                    m.reactions.removeAll();
                    col.delete(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`);
                });
            });
        });
    }
}