const Discord = require('discord.js');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

O = new Object;

O.name = 'reaction';
O.alias = ['reaction', 'react', 'r', 'hand'];
O.desc = 'Create a message with reaction which when reacted, give a role to the user.';
O.usage = [
    '//reaction <Channel> <Role> <Emoji> <Message>',
    'Channel: The channel for the reaction message.',
    'Role: The role to be given to the member.',
    'Emoji: The emoji to react to.',
    'Message: The message to be shown to newcomers.',
    '',
    'Known issue: Does not support unicode emoji.'
];
O.run = async (msg, args, queue) => {
    const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
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
    .setTitle('Server Verification')
    .setDescription(args.splice(3).join(' '));

    verifyChannel.send(verifyEmbed)
    .then(m => {
        m.react(reactionEmoji)
        .then(() => {
            msg.client.on('messageReactionAdd', (react, user) => {
                if(react.message == m) msg.guild.members.cache.find(i => i.id == user.id).roles.add(verifyRole).catch(e => {console.log(e)});
            });
            msg.client.on('messageReactionRemove', (react, user) => {
                if(react.message == m) msg.guild.members.cache.find(i => i.id == user.id).roles.remove(verifyRole).catch(e => {console.log(e)});
            })
        });
    })
    .catch(e => {
        if(e) throw e;
    });
}

module.exports = O;