const Discord = require('discord.js');

const master = require.main.require('./configurations/master.json').developer;

module.exports = {
    name: 'guilds',
    alias: ['guilds', 'gg'],
    desc: 'Get bot\'s guild data',
    usage: ['//guilds'],
    dev: true,
    mod: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args) => {
        let guild = msg.client.guilds.cache.array();
        let guildEmbed = new Discord.MessageEmbed()
        .setTitle(`${msg.client.user.username} is Serving in the following servers:`);

        if(master.includes(msg.author.id)) {
            for(let i of guild){
                let invite;
                try {
                    invite = await i.fetchInvites();
                    invite = invite.map(a => a.code);
                    if(invite.length <= 0) invite = '```No invites```';
                } catch(e) {
                    if(e) invite = '```Unable to resolve invites.```'
                }
                guildEmbed.addField(i.name, invite, true);
            }
        } else {
            guildEmbed.setDescription(`Servers:\n\n${guild.map(i => i.name).join('\n')}`);
        }

        msg.channel.send({embed: guildEmbed});
    }
}