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

        let guilds = msg.client.guilds.cache.array();
        let guildEmbed = new Discord.MessageEmbed()
        .setTitle('Serv is Serving in the following servers:')

        for(let i = 0; i < guilds.length; i++){
            let invites = await guilds[i].fetchInvites();
            invites = invites.map(a => a.code);
            if(invites.length <= 0) invites = '`No invites`';
            guildEmbed.addField(guilds[i].name, invites, true);
        }

        msg.channel.send({embed: guildEmbed});
    }
}