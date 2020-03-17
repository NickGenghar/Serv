const Discord = require('discord.js');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

O = new Object;

O.name = 'invert';
O.alias = ['invert', 'mirror', 'in'];
O.desc = 'Invert your text';
O.usage = [
    '//Invert <Text>',
    'Text: Text to invert.'
];
O.run = async (msg, args, queue) => {
    const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
    if(!svr.modules.includes(O.name)) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');

    msg.delete().catch(e => console.log(e));
    let straigh = args.join(' ').split('');
    let inverted = [];
    let i = straigh.length, j = 0;

    while(i--) {
        inverted[j++] = straigh[i];
    }

    msg.channel.send(inverted.join(''));
}

module.exports = O;