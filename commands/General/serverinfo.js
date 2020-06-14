const Discord = require('discord.js');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'serverinfo',
    alias: ['si', 'serverinfo', 'guild', 'pool', 'coolkids'],
    desc: 'Gets the information of the server/guild.',
    usage: '//serverinfo',
    access: 'Members',
    run: async (msg) => {
        let serverinfoEmbed = new Discord.MessageEmbed()
            .setTitle('Server Information')
            .setColor(color.purple)
            .setThumbnail(msg.guild.iconURL)
            .addField('Server Owner', msg.guild.owner, true)
            .addField('Server Name', msg.guild.name, true)
            .addField('Server Region', msg.guild.region, true)
            .addField('Filter Level', msg.guild.explicitContentFilter, true)
            .addField('Authentication Level', msg.guild.verificationLevel, true)
            .addField('Boost Counts', msg.guild.premiumSubscriptionCount, true)
            .addField('Boost Tier', msg.guild.premiumTier, true)
            .addField('Large Server?', msg.guild.large ? 'Yes' : 'No', true)
            .addField('Partnered?', msg.guild.partnered ? 'Yes' : 'No', true)
            .addField('Verified?', msg.guild.verified ? 'Yes' : 'No', true)
            .addField('Created since', msg.guild.createdAt, true);

        msg.channel.send({embed: serverinfoEmbed});
    }
}