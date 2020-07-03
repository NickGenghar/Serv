const Discord = require('discord.js');

/**
 * @param {Discord.Client} bot The Discord.Client object
 */
module.exports = (bot) => {
    bot.on('emojiCreate', async emoji => {bot.events.get('emojiCreate').run(bot, emoji);});
    bot.on('emojiDelete', async emoji => {bot.events.get('emojiDelete').run(bot, emoji);});
    bot.on('emojiUpdate', async (oldEmoji, newEmoji) => {bot.events.get('emojiUpdate').run(bot, oldEmoji, newEmoji);});
    bot.on('channelCreate', async chan => {bot.events.get('channelCreate').run(bot, chan);});
    bot.on('channelDelete', async chan => {bot.events.get('channelDelete').run(bot, chan);});
    bot.on('channelPinsUpdate', async chan => {bot.events.get('channelPinsUpdate').run(bot, chan);});
    bot.on('channelUpdate', async (oldChan, newChan) => {bot.events.get('channelUpdate').run(bot, oldChan, newChan);});
    bot.on('guildBanAdd', async (guild, user) => {bot.events.get('guildBanAdd').run(bot, guild, user);});
    bot.on('guildCreate', async guild => {bot.events.get('guildCreate').run(bot, guild);});
    bot.on('guildDelete', async guild => {bot.events.get('guildDelete').run(bot, guild);});
    bot.on('guildIntegrationsUpdate', async guild => {bot.events.get('guildIntegrationsUpdate').run(bot, guild);});
    bot.on('guildMemberAdd', async member => {bot.events.get('guildMemberAdd').run(bot, member);});
    bot.on('guildMemberRemove', async member => {bot.events.get('guildMemberRemove').run(bot, member);});
    bot.on('message', async msg => {bot.events.get('message').run(bot, msg);});
    bot.on('messageDelete', async msg => {bot.events.get('messageDelete').run(bot, msg);});
    bot.on('messageDeleteBulk', async msgs => {bot.events.get('messageDeleteBulk').run(bot, msgs);});
    bot.on('messageUpdate', async (oldMsg, newMsg) => {bot.events.get('messageUpdate').run(bot, oldMsg, newMsg);});
    bot.on('raw', async tag => {bot.events.get('raw').run(bot, tag);});
    bot.on('ready', async () => {bot.events.get('ready').run(bot);});
}