const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

O = new Object;

O.name = 'say';
O.alias = ['say', 'tell', 'talk'];
O.desc = 'Using Serv to talk. Fancy eh?';
O.usage = [
    '//say <Text> [Channel]',
    '',
    ''
];
O.run = async (msg, args, queue) => {
    await msg.delete().catch(e => console.log(e));

    const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
    if(!svr.modules.includes('say')) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');

    let chat = `> ${args.join(' ')}\n${msg.author}`;
    let chan = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[args.length - 1])
    if(chan) chan.send(chat);
    else msg.channel.send(chat);
    console.log(chat);
}

module.exports = O;