const Discord = require('discord.js');
const fs = require('fs');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'announce',
    alias: ['announce', 'annoy', 'broadcast', 'relay'],
    desc: 'Sends an announcement to a channel',
    usage: '//announce <announcement>\nannouncement: Any text. Take note that this command handles the Everyone\'s ping.',
    access: 'Moderator',
    run: async (msg, args) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        if(args) {
            let announcement = args.join(' ');

            if (!msg.guild.me.hasPermission(['MENTION_EVERYONE'])) {
                announcement = announcement.replace(/@everyone/, 'everyone');
            }

            let announceEmbed = new Discord.MessageEmbed()
                .setTitle('Public Server Announcement')
                .setDescription(`By: ${msg.author.username}`)
                .setColor(color.blue)
                .setThumbnail(msg.author.displayAvatarURL({size:2048}))
                .addField('Announcement:', `${announcement}`, true);
            return msg.channel.send({ embed: announceEmbed });
        } else {
            msg.channel.send(`No announcement information supplied.`);
        }
    }
}