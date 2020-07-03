const Discord = require('discord.js');

module.exports = {
    event: 'message',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.Message} msg
     */
    run: async (bot, msg) => {
        let cmd, lvl;
        if(bot.sideload) {
            cmd = bot.sideload.get('message');
            lvl = bot.sideload.get('levels');
        }
        else return;

        try {
            cmd.run(msg);
            lvl.run(msg);
        } catch(e) {
            if(e) throw e;
        }
    }
}