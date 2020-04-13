const Discord = require('discord.js');

const master = require.main.require('./configurations/master.json').developer;

module.exports = {
    name: 'guilds',
    alias: ['guilds', 'gg'],
    desc: 'Get bot\'s guild data',
    usage: ['//guilds'],
    access: 'Developer',
    run: async (msg, args) => {
        if(!master.includes(msg.author.id)) return;

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