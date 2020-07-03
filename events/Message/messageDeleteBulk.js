const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'messageDeleteBulk',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Collection<String, Discord.Message>} msgs
     */
    run: async (bot, msgs) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msgs.first().guild.id}.json`));
        if(svr.logChan == '') return;

        let content = [];
        for(let i of msgs.array()) {
            content.push({
                author: i.author.tag,
                author_id: i.author.id,
                content: i.content
            });
        }

        fs.writeFileSync(`./temp/${msgs.first().guild.id}_bulk-delete.json`, JSON.stringify(content, null, '\t'));
        const attachment = new Discord.MessageAttachment(`./temp/${msgs.first().guild.id}_bulk-delete.json`);
        let messageDeleteBulkEmbed = new Discord.MessageEmbed()
        .setTitle('Message Delete Bulk')
        .attachFiles(attachment)
        .setFooter(`Bulk delete at ${new Date()}`);

        let logChannel = msgs.first().guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(messageDeleteBulkEmbed);
    }
}