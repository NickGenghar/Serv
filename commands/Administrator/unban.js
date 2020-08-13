const Discord = require('discord.js');
const fs = require('fs');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'unban',
    alias: ['ub', 'unban', 'pardon'],
    desc: 'Unban a banned user in the server',
    usage: [
        '//unban <userID> <reason>',
        'userID: Target user ID to be unbanned,',
        'reason: Reason for why they got unbanned.'
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

        let unbanUser = await msg.client.fetchUser(args[0]);
        args.shift();
        let reason = args.join(' ');

        if (!msg.guild.me.hasPermission(['ADMINISTRATOR'])) {
            return msg.channel.send('Permission not granted to do such task.')
        }
        if (!unbanUser) {
            return msg.channel.send('User not specified');
        }
        if (reason.length <= 0) {
            reason = 'unspecified';
        }

        unbanUser.send(`You have been unbanned from the server\n**${msg.guild.name}**\n\nwith the reason\n**${reason}**`).then(() => {
            try {
                msg.guild.unban(unbanUser);
            } catch (e) {
                msg.channel.send('Encountered error during unbanning the user.');
                return console.log(e);
            }
        }).catch(err => {
            msg.channel.send('Encountered error during unbanning the user.');
            return console.log(err)
        })

        let unbanEmbed = new Discord.MessageEmbed()
            .setColor(color.red)
            .addField('Unbanned user', unbanUser.user.tag, true)
            .addField('User ID', unbanUser.user.id, true)
            .addField('Unbanned by', msg.author.username, true)
            .addField('User ID', msg.author.id, true)
            .addField('Reason for being unbanned', reason)
            .addField('Time of unban', msg.createdAt.toLocaleString());

        let reportChannel = msg.guild.channels.cache.find(c => c.id == svr.logChan);
        if (!reportChannel) {
            reportChannel = msg.channel;
            msg.channel.send('Report channel doesn\'t exist. Sending report to local channel instead.');
        }

        reportChannel.send({ embed: unbanEmbed });
    }
}