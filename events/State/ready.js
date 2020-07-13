const Discord = require('discord.js');
const checksum = require('../../initial/checksum.js');
const pseudocron = require('../../initial/pseudocron.js');

module.exports = {
    event: 'ready',
    /**
     * @param {Discord.Client} bot
     */
    run: (bot) => {
        checksum(bot);
        pseudocron(bot);
        console.log('\x1b[32m%s\x1b[0m',`${bot.user.username} Ready.`);
    }
}