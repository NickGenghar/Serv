const Discord = require('discord.js');
const fs = require('fs');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'kick',
    alias: ['k', 'kick'],
    desc: 'Kicks a user out from the server.',
    usage: ['//kick <user> <reason>\nuser: Target user to be kicked,\nreason: Reason for being kick.\n\nReason must be provided in order for this command to succeed.'],
    run: async (msg, args) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        let kickUser = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
        args.shift();
        let reason = args.join(' ');

        if (!msg.guild.me.hasPermission(['ADMINISTRATOR'])) {
            return msg.channel.send('Permission not granted to do such task.');
        }
        if (!kickUser) {
            return msg.channel.send('User not specified.');
        }
        if (kickUser.roles.cache.find(r => svr.modRole.includes(r.id))) {
            return msg.channel.send('Cannot kick a fellow moderator.');
        }
        if (reason.length <= 0) {
            reason = 'unspecified';
        }

        kickUser.send(`You have been kick from the server\n**${msg.guild.name}**\n\nwith the reason\n**${reason}**`).then(() => {
            kickUser.kick()
        }).catch(e => {
            msg.channel.send('Encountered error during kicking.');
            return console.log(e)
        });

        let kickEmbed = new Discord.MessageEmbed()
            .setColor(color.orange)
            .addField('Kicked user', kickUser.user.username, true)
            .addField('User ID', kickUser.user.id, true)
            .addField('Kicked by', msg.author.username, true)
            .addField('User ID', msg.author.id, true)
            .addField('Reason for being kicked', reason)
            .addField('Time of kick', msg.createdAt.toLocaleString());

        let reportChannel = msg.guild.channels.cache.find(c => c.id == svr.logChan);
        if (!reportChannel) {
            reportChannel = msg.channel;
            msg.channel.send('Report channel doesn\'t exist. Sending report to local channel instead.');
        }

        msg.delete().catch(console.error)
        reportChannel.send({ embed: kickEmbed });
    }
}