const Discord = require('discord.js');
const fs = require('fs');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'announce',
    alias: ['announce', 'annoy', 'broadcast', 'relay'],
    desc: 'Sends an announcement to a channel',
    usage: [
        '//announce <Channel> <Announcement>',
        'Channel: The channel to do announcement',
        'Announcement: The announcement text.',
        '',
        'This command handles the `@everyone` or `@here` ping accordingly.'
    ],
    dev: false,
    mod: true,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        let channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]);
        if(!channel) return msg.channel.send('Announcement channel unspecified');
        if(!args[1]) return msg.channel.send(`No announcement information supplied.`);

        let announcement = args.splice(0).join(' ');

        if (!msg.guild.me.hasPermission(['MENTION_EVERYONE'])) {
            announcement = announcement.replace(/@everyone/g, 'everyone');
            announcement = announcement.replace(/@here/g, 'here');
        }

        let announceEmbed = new Discord.MessageEmbed()
            .setTitle('Public Server Announcement')
            .setDescription(`By: ${msg.author.username}`)
            .setColor(color.blue)
            .setThumbnail(msg.author.displayAvatarURL({size:2048}))
            .addField('Announcement:', `${announcement}`, true);
        channel.send({ embed: announceEmbed });
    }
}