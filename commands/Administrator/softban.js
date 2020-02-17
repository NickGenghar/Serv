const Discord = require('discord.js');
const fs = require('fs');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'softban',
    alias: ['sb', 'sban', 'softban'],
    desc: 'Ban a user out from the server, then unban them soon after.',
    usage: ['//softban <user> <reason>\nuser: Target user to be soft banned,\nreason: Reason why they got soft banned.\n\nReason must be provided in order for this command to succeed.'],
    run: async (msg, args) => {
        msg.delete().catch(console.error)
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        let softbanUser = msg.mentions.members.first() || msg.guild.members.get(args[0]);
        args.shift();
        let reason = args.join(' ');

        //Checks
        if (!msg.guild.me.hasPermission(['ADMINISTRATOR'])) {
            return msg.channel.send('Permission not granted to do such task.');
        }
        if (!softbanUser) {
            return msg.channel.send('User not specified');
        }
        if (softbanUser.roles.cache.find(r => svr.modRole.includes(r.id))) {
            return msg.channel.send('Soft banning users with ban permission is forbidden.');
        }
        if (reason.length <= 0) {
            reason = 'unspecified';
        }

        softbanUser.send(`You have been soft banned from the server\n**${msg.guild.name}**\n\nwith the reason\n**${reason}**`).then(() => {
            msg.guild.ban(softbanUser).then(() => {
                msg.guild.unban(softbanUser.id)
            })
        }).catch(err => {
            msg.channel.send('Encountered error during soft banning.');
            return console.log(err);
        })

        let softbanEmbed = new Discord.MessageEmbed()
            .setColor(color.red)
            .addField('Soft banned user', softbanUser.user.tag, true)
            .addField('User ID', softbanUser.user.id, true)
            .addField('Soft banned by', msg.author.username, true)
            .addField('User ID', msg.author.id, true)
            .addField('Reason for being soft banned', reason)
            .addField('Time of soft ban', msg.createdAt.toLocaleString());

        let reportChannel = msg.guild.channels.cache.find(c => c.id == svr.logChan);
        if (!reportChannel) {
            reportChannel = msg.channel;
            msg.channel.send('Report channel doesn\'t exist. Sending report to local channel instead.');
        }

        reportChannel.send({ embed: softbanEmbed });
    }
}