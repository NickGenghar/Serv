const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

O = new Object;

O.name = 'devexit';
O.alias = ['devexit'];
O.desc = 'Exits a server remotely.';
O.usage = [
    '//devexit <Server ID>',
    'Server ID: The server ID you want the bot to leave.'
];
O.run = async (msg, args, queue) => {
    if(!master.developer.includes(msg.author.id)) return;

    let leftGuild = msg.client.guilds.cache.get(args[0]);
    try {
        leftGuild.leave()
        .then(g => {
            return msg.channel.send(`Left the server \`${g.name}\``);
        })
        .catch(e => {
            if(e) throw e;
        })
    }
    catch(e) {
        if(e) msg.channel.send(`Failed to leave server ${args[0]}`)
        .then(() => {throw e;});
    };
}
O.dev = true;

module.exports = O;