const Discord = require('discord.js');
const fs = require('fs');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'reaction',
    alias: ['reaction', 'react', 'r', 'hand'],
    desc: 'Create a message with reaction which when reacted, give a role to the user.',
    usage: [
        '//reaction <Channel> <Role> <Emoji> <Message>',
        'Channel: The channel for the reaction message.',
        'Role: The role to be given to the member.',
        'Emoji: The emoji to react to.',
        'Message: The message to be shown to newcomers.',
        '',
        'Known issue: Does not support unicode emoji.'
    ],
    dev: false,
    mod: true,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
        if(!svr.modules.includes('reaction')) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');

        let verifyChannel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]);
        let verifyRole = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
        let reactionEmoji = msg.client.emojis.cache.find(i => i.toString() == args[2]) || msg.client.emojis.cache.get(args[2]);

        if(!verifyChannel) return msg.channel.send('Verification channel unspecified.');
        if(!verifyRole) return msg.channel.send('Verification role unspecified.');
        if(!reactionEmoji) return msg.channel.send('Provided emoji is unusable or invalid. Please use a different emoji.');

        let verifyEmbed = new Discord.MessageEmbed()
        .setTitle('Reaction')
        .setColor(color.white)
        .setDescription(args.splice(3).join(' '));

        verifyChannel.send(verifyEmbed)
        .then(m => {
            svr.reactions.push({
                msg: m.id,
                role: verifyRole.id,
                emoji: reactionEmoji.id
            });
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            m.react(reactionEmoji)
            .then(() => {
                msg.client.on('messageReactionAdd', async (react, user) => {
                    if(react.partial) {
                        try {await react.fetch();}
                        catch(e) {if(e) throw e;}
                    }
                    if(react.message == m && !user.bot) msg.guild.members.cache.find(i => i.id == user.id).roles.add(verifyRole).catch(e => {console.log(e)});
                });
                msg.client.on('messageReactionRemove', async (react, user) => {
                    if(react.partial) {
                        try {await react.fetch();}
                        catch(e) {if(e) throw e;}
                    }
                    if(react.message == m && !user.bot) msg.guild.members.cache.find(i => i.id == user.id).roles.remove(verifyRole).catch(e => {console.log(e)});
                });
            });
        })
        .catch(e => {
            if(e) throw e;
        });
        msg.channel.send(`Reaction role added to the channel ${verifyChannel}.`);
    }
}