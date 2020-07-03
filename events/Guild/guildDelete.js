const Discord = require('discord.js');
const fs = require('fs');

const master = require('../../configurations/master.json');

module.exports = {
    event: 'guildDelete',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Guild} guild
     */
    run: async (bot, guild) => {
        let home = bot.guilds.cache.find(i => i.id == master.guild);
        if(!home) return;
        home.fetchWebhooks()
        .then(w => {
            let guildRemoveEmbed = new Discord.MessageEmbed()
            .setTitle('Guild Deleted')
            .setThumbnail(guild.iconURL())
            .addField('Guild Name', guild.name, true)
            .addField('Guild Owner', guild.owner.user.username, true)
            .addField('Guild Created', guild.createdAt, true)
            .addField('Guild Members', guild.memberCount, true)
            .addField('Data Deletion Date', new Date(Date.now()+604800000));
    
            const webhook = w.find(e => e.name.toLowerCase() == 'serv master log');
            if(webhook) webhook.send(guildRemoveEmbed);
        })
        .catch(e => {
            if(e) throw e;
        });

        bot.timeout[guild.id] = bot.setTimeout(() => {
            fs.unlink(`./data/guilds/${guild.id}.json`, (e) => {
                if(e) console.log('Encountered error while deleting old server data.');
            });
        }, 604800000);
    }
}