const Discord = require('discord.js');
const fs = require('fs');

const color = require('../../configurations/color.json');

module.exports = {
    name: 'ban',
    alias: ['b', 'ban', 'hammer', 'smite'],
    desc: 'Ban a user out from the server',
    usage: [
        '//ban <User> [Reason]',
        '',
        'User: Target user to be banned,',
        'Reason: Reason why they got banned.'
    ],
    run: async (msg, args) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        let banUser = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
        args.shift();
        let reason = args.join(' ');

        //Checks
        if (!msg.guild.me.hasPermission(['ADMINISTRATOR'])) {
            return msg.channel.send('Permission not granted to do such task.');
        }
        if (!banUser) {
            return msg.channel.send('User not specified');
        }
        if (banUser.roles.cache.find(r => svr.modRole.includes(r.id))) {
            return msg.channel.send('Banning users with the moderator role is forbidden.');
        }
        if (reason.length <= 0) {
            reason = 'Unspecified';
        }

        banUser.send(`You have been banned from the server**${msg.guild.name}**with the reason**${reason}**`).then(() => {
            msg.guild.members.ban(banUser)
        }).catch(err => {
            msg.channel.send('Encountered error during banning.');
            return console.log(err);
        })

        let banEmbed = new Discord.MessageEmbed()
            .setColor(color.red)
            .addField('Banned user', banUser.user.tag, true)
            .addField('User ID', banUser.user.id, true)
            .addField('Banned by', msg.author.username, true)
            .addField('User ID', msg.author.id, true)
            .addField('Reason for being banned', reason)
            .addField('Time of ban', msg.createdAt.toLocaleString());

        let reportChannel = msg.guild.channels.cache.find(c => c.id == svr.logChan);
        if (!reportChannel) {
            reportChannel = msg.channel;
            msg.channel.send('Report channel doesn\'t exist. Sending report to local channel instead.');
        }

        reportChannel.send({ embed: banEmbed });
    }
}