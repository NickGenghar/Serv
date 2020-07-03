const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'messageUpdate',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Message} oldMsg
     * @param {Discord.Message} newMsg
     */
    run: async (bot, oldMsg, newMsg) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${newMsg.guild.id}.json`));
        if(svr.logChan == '' || newMsg.author.bot) return;

        let messageUpdateEmbed = new Discord.MessageEmbed()
        .setTitle('Message Update')
        .addField('User', newMsg.author, true)
        .setFooter(`Message update at ${new Date()}`);

        messageUpdateEmbed
        .addField('Old Message', oldMsg.content, true);
        if(oldMsg.attachments.size > 0) {
            let content = [];
            for(let i of oldMsg.attachments.array()) {
                content.push(i.url);
            }
            
            messageUpdateEmbed
            .addField('Old Message Attachments', content.join('\n'));
        }

        messageUpdateEmbed
        .addField('New Message', newMsg.content, true);
        if(newMsg.attachments.size > 0) {
            let content = [];
            for(let i of newMsg.attachments.array()) {
                content.push(i.url);
            }

            messageUpdateEmbed
            .addField('New Message Attachments', content.join('\n'));
        }

        let logChannel = newMsg.guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(messageUpdateEmbed);
    }
}