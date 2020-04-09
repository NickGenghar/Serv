const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

O = new Object;

O.name = '';
O.alias = [];
O.desc = '';
O.usage = [];
O.run = async (msg, args, queue) => {
    await msg.delete().catch(e => console.log(e));

    //dev only command
    if(!master.developer.includes(msg.author.id)) return;

    //server specific command
    const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
    if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
    if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

    //command needed to be activated first
    if(!svr.modules.includes(O.name)) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');

    //code here
}

module.exports = O;