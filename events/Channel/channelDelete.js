const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'channelDelete',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.GuildChannel} chan
     */
    run: async (bot, chan) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${chan.guild.id}.json`));
        if(svr.logChan == '') return;

        let channelDeleteEmbed = new Discord.MessageEmbed()
        .setTitle('Channel Deleted')
        .addField('Channel Name', chan.toJSON().name, true)
        .addField('Channel Type', chan.type, true)
        .setFooter(`Created at ${chan.createdAt}`);

        let logChannel = chan.guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(channelDeleteEmbed);
    }
}