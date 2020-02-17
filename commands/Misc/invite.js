const Discord = require('discord.js');

module.exports = {
    name: 'invite',
    alias: ['invite', 'i'],
    desc: 'Invites the bot',
    usage: ['//invite'],
    run: async (msg, args) => {
        let inviteEmbed = new Discord.MessageEmbed()
        .setTitle('Invite The Bot To Your Server')
        .setThumbnail(msg.client.user.displayAvatarURL({size:2048}))
        .setURL('https://discordapp.com/api/oauth2/authorize?client_id=557523643811495936&permissions=8&scope=bot')
        return msg.channel.send({embed: inviteEmbed});
    }
}