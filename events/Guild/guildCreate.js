const Discord = require('discord.js');
const fs = require('fs');

const master = require('../../configurations/master.json');
const defaults = require('../../configurations/defaults.json');

module.exports = {
    event: 'guildCreate',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Guild} guild
     */
    run: async (bot, guild) => {
        let home = bot.guilds.cache.find(i => i.id == master.guild);
        if(!home) return;
        home.fetchWebhooks()
        .then(w => {
            let guildCreateEmbed = new Discord.MessageEmbed()
            .setTitle('Guild Created')
            .setThumbnail(guild.iconURL())
            .addField('Guild Name', guild.name, true)
            .addField('Guild Owner', guild.owner.user.username, true)
            .addField('Guild Created', guild.createdAt, true)
            .addField('Guild Members', guild.memberCount, true)
            .addField('Data Creation Date', new Date(), true);
    
            const webhook = w.find(e => e.id == master.webhook);
            if(webhook) webhook.send(guildCreateEmbed);
        })
        .catch(e => {
            if(e) throw e;
        });

        if(bot.timeout[guild.id]) {
            bot.clearTimeout(bot.timeout[guild.id]);
        } else {
            fs.writeFile(`./data/guilds/${guild.id}.json`, JSON.stringify(defaults.server_config, null, '\t'), (e) => {
                if(e) console.log('Encountered error while creating new server data.');
            });
        }
    }
}