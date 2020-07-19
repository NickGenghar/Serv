const Discord = require('discord.js');
const fs = require('fs');

const sanitizer = require('../../functions/profanitySanitizer');

module.exports = {
    event: 'message',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Message} msg
     */
    run: async (bot, msg) => {
        let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));

        if(sanitizer(msg.content, svr.profanity) && !msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id)) && !msg.author.bot) {
            msg.channel.send(`Hello ${msg.author}, please refrain from using filtered words.`)
            .then(() => {msg.delete().catch(e => {if(e) throw e;})});
            return;
        }

        let cmd, lvl;
        if(bot.sideload) {
            cmd = bot.sideload.get('message');
            lvl = bot.sideload.get('levels');
        }
        else return;

        try {
            cmd.run(msg, svr);
            lvl.run(msg);
        } catch(e) {
            if(e) throw e;
        }
    }
}