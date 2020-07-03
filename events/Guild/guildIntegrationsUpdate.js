const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'guildIntegrationsUpdate',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Guild} guild
     */
    run: async (bot, guild) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${guild.id}.json`));
        if(svr.logChan == '') return;
        let integration;
        try {
            integration = await guild.fetchIntegrations();
        } catch(e) {
            if(e) throw e;
        }

        let guildIntegrationEmbed = new Discord.MessageEmbed()
        .setTitle('Guild Integration Update')
        .addField('Integration Size', integration.size, true)
        .setFooter(`Integration updated at ${new Date()}`);

        let logChannel = guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(guildIntegrationEmbed);
    }
}