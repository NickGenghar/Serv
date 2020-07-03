const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'emojiDelete',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.GuildEmoji} emoji
     */
    run: async (bot, emoji) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${emoji.guild.id}.json`));
        if(svr.logChan == '') return;

        let author;
        try {author = await emoji.fetchAuthor();}
        catch(e) {author = {username: 'Error retrieving user'};}

        let emojiDeleteEmbed = new Discord.MessageEmbed()
        .setTitle('Emoji Delete')
        .setThumbnail(emoji.url)
        .addField('Emoji Name', emoji.name, true)
        .addField('Author', author.username, true)
        .addField('Animated?', emoji.animated ? 'Yes' : 'No', true)
        .setFooter(`Emoji deleted at ${new Date()}`);

        let logChannel = emoji.guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(emojiDeleteEmbed);
    }
}