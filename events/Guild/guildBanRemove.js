const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'guildBanRemove',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Guild} guild
     * @param {Discord.User} user
     */
    run: async (bot, guild, user) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${guild.id}.json`));
        if(svr.logChan == '') return;

        let banRemoveEmbed = new Discord.MessageEmbed()
        .setTitle('Guild Ban Remove')
        .setThumbnail(user.avatarURL())
        .addField('User', user.username, true)
        .addField('Bot?', user.bot ? 'Yes' : 'No', true)
        .setFooter(`Ban revoked at ${new Date()}`);

        let logChannel = guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(banRemoveEmbed);
    }
}