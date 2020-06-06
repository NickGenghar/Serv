const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

O = new Object;

O.name = 'exit';
O.alias = ['exit'];
O.desc = 'Cause the bot to leave the server without the need to kick the bot.';
O.usage = [
    '//exit'
];
O.run = async (msg, args, queue) => {
    const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
    if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
    if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

    msg.channel.send('Thank you for using Serv.')
    .then(() => {
        return msg.guild.leave();
    });
}

module.exports = O;