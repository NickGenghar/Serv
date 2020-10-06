const Discord = require('discord.js');
const Twitch = require('tmi.js');
const token = require('../configurations/token.json');

module.exports = {
    discord: () => {
        const bot = new Discord.Client();
        bot.login(token.token);
        return bot;
    },
    /**
     * @return {Twitch.Client}
     */
    twitch: () => {
        const bot = new Twitch.Client({
            identity: {
                username: 'servbynick',
                password: token.twitch.id
            }
        });
        bot.connect()
        .catch(e => {
            if(e) throw e;
        });
        return bot;
    }
}