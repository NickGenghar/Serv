const Discord = require('discord.js');

const colors = require('../../configurations/color.json');

module.exports = {
    name: 'memberinfo',
    alias: ['memberinfo','mi'],
    desc: 'Get\'s the information of the server member. Not to be confused with `userinfo` where it fetches the data of a user.',
    usage: [
        '//memberinfo',
        'Returns the amount of users based on their status.'
    ],
    dev: false,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        let user = msg.guild.members.cache.map(e => e.presence).map(e => e.status);
        let memberEmbed = new Discord.MessageEmbed()
        .setTitle('Member Info')
        .setThumbnail(msg.guild.iconURL)
        .setDescription(`Current member counts:\n${msg.guild.memberCount}`)
        .setColor(colors.purple)
        .addField('Online', user.filter(a => a == 'online').length, true)
        .addField('Idle', user.filter(a => a == 'idle').length, true)
        .addField('Do Not Disturb', user.filter(a => a == 'dnd').length, true)
        .addField('Offline', user.filter(a => a == 'offline').length, true);

        return msg.channel.send({embed: memberEmbed});
    }
}