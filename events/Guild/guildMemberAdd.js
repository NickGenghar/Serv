const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    event: 'guildMemberAdd',
    /**
     * @param {Discord.Client} bot
     * @param {Discord.GuildMember} member
     */
    run: async (bot, member) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${member.guild.id}.json`));
        if(svr.logChan == '') return;

        let memberAddEmbed = new Discord.MessageEmbed()
        .setTitle('Member Add')
        .setThumbnail(member.user.avatarURL())
        .addField('User', member.user.username, true)
        .addField('Bot?', member.user.bot ? 'Yes' : 'No', true)
        .addField('Joined Discord Since', member.user.createdAt, true)
        .setFooter(`User joined at ${member.joinedAt}`);

        let logChannel = member.guild.channels.cache.find(e => e.id == svr.logChan);
        if(logChannel) logChannel.send(memberAddEmbed);
    }
}