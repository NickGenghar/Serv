const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');
const reload = require('../../initial/reload.js');

O = new Object;

O.name = 'reload';
O.alias = ['reload', 'rl', 'vibecheck'];
O.desc = 'Reloads the command modules. WARNING! Will delete any timers attached to the bot.';
O.usage = [
    '//Reload'
];
O.run = async (msg, args, queue) => {
    if(!master.developer.includes(msg.author.id)) return;
    await msg.delete()
    .then(() => {
        msg.channel.send('Reloading commands...');
    })
    .catch(e => console.log(e));

    reload(msg.client);
}

module.exports = O;