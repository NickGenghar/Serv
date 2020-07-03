const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'channelUpdate',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.GuildChannel} oldChan
     * @param {Discord.GuildChannel} newChan
     */
    run: async (bot, oldChan, newChan) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${newChan.guild.id}.json`));
        if(svr.logChan == '') return;

        let channelUpdateEmbed = new Discord.MessageEmbed()
        .setTitle('Channel Update')
        .addField('Old Channel', oldChan.name)
        .addField('New Channel', newChan.toString())
        .setFooter(`Changed since ${newChan.createdAt}`);

        let logChannel = newChan.guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(channelUpdateEmbed);
    }
}