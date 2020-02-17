const Discord = require('discord.js');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

module.exports = {
    name: 'guilds',
    alias: ['guilds', 'gg'],
    desc: 'Get bot\'s guild data',
    usage: ['//guilds'],
    access: 'Developer',
    run: async (msg, args) => {
        if(!dev.includes(msg.author.id)) return;

        let guilds = msg.client.guilds.array();
        let listed = [];
        guilds.forEach(v => {
            listed.push(v.name);
        })
        let guildEmbed = new Discord.MessageEmbed()
        .setTitle('Serv is Serving in the following servers:')
        .setDescription(`Total Servers: ${listed.length}\n\nServers:\n${listed.join('\n')}`);
        msg.channel.send({embed: guildEmbed});
    }
}