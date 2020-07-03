const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'emojiUpdate',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.GuildEmoji} oldEmoji
     * @param {Discord.GuildEmoji} newEmoji
     */
    run: async (bot, oldEmoji, newEmoji) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${newEmoji.guild.id}.json`));
        if(svr.logChan == '') return;

        let emojiUpdateEmbed = new Discord.MessageEmbed()
        .setTitle('Emoji Update')
        .addField('Old Emoji', oldEmoji.toString(), true)
        .addField('New Emoji', newEmoji.toString(), true)
        .setFooter(`Emoji updated since ${new Date()}`);

        let logChannel = newEmoji.guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(emojiUpdateEmbed);
    }
}