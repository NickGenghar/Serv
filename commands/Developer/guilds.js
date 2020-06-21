const Discord = require('discord.js');

const master = require.main.require('./configurations/master.json').developer;

module.exports = {
    name: 'guilds',
    alias: ['guilds', 'gg'],
    desc: 'Get bot\'s guild data',
    usage: ['//guilds'],
    access: 'Developer',
    run: async (msg, args) => {
        let guild = msg.client.guilds.cache.array();
        let guildEmbed = new Discord.MessageEmbed()
        .setTitle('Serv is Serving in the following servers:');

        if(master.includes(msg.author.id)) {
            for(let i = 0; i < guild.length; i++){
                let invite;
                try {
                    await guild[i].fetchInvites();
                    invite = invite.map(a => a.code);
                    if(invite.length <= 0) invite = '```No invites```';
                } catch(e) {
                    if(e) invite = '```Unable to resolve invites.```'
                }
                guildEmbed.addField(guild[i].name, invite, true);
            }
        } else {
            guildEmbed.setDescription(`Servers:\n\n${guild.map(i => i.name).join('\n')}`);
        }

        msg.channel.send({embed: guildEmbed});
    }
}