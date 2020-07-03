const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'messageDelete',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Message} msg
     */
    run: async (bot, msg) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.logChan == '') return;

        let messageDeleteEmbed = new Discord.MessageEmbed()
        .setTitle('Message Delete')
        .addField('User', msg.author, true)
        .addField('Message', msg.content == '' ? '`No Content`' : msg.content, true)
        .setFooter(`Message deleted at ${new Date()}`);

        if(msg.attachments.size > 0) {
            let content = [];
            for(let i of msg.attachments.array()) {
                content.push(i.url);
            }

            messageDeleteEmbed
            .addField('Attachments', content.join('\n'), true);
        }

        if(msg.embeds.length > 0) {
            let embeds = [];
            for(let i of msg.embeds) {
                embeds.push(`\`\`\`js\n${JSON.stringify(i.toJSON(), null, '\t')}\n\`\`\``);
            }

            messageDeleteEmbed
            .addField('Embeds', embeds.join('\n'));
        }

        let logChannel = msg.guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(messageDeleteEmbed);
    }
}