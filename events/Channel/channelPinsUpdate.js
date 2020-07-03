const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'channelPinsUpdate',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.GuildChannel} chan
     */
    run: async (bot, chan) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${chan.guild.id}.json`));
        if(svr.logChan == '') return;

        let channelPinsUpdateEmbed = new Discord.MessageEmbed()
        .setTitle('Channel Pins Update')
        .addField('Channel Name', chan.toJSON().name, true)
        .addField('Channel Type', chan.type, true)
        .setFooter(`Pin Update at ${chan.lastPinAt}`);

        let logChannel = a.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(channelPinsUpdateEmbed);
    }
}