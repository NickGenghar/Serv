const Twitch = require('tmi.js');

/**
 * @param {Twitch.Client} twitch 
 */
module.exports = (twitch) => {
    twitch.on('message', (channel, user, message, self) => {
        if(self) return;
        console.log(`Channel: ${channel}\n${user}: ${message}`);
    });
}