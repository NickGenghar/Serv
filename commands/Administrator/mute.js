const Discord = require('discord.js');
const fs = require('fs');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'mute',
    alias: ['mute','m'],
    desc: 'Mute a member from the server. Requires the server to create a role to be use as the muted role.',
    usage: [
        '//mute <Member> [Reason] [Duration]',
        'Member: Target member to mute.',
        'Reason: Reason for muting the member.',
        'Duration: The duration to mute the member. Ommiting this option will permanently mute the member.',
        '',
        'To unmute a muted member, use the command `//unmute <Member>`.'
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
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
        if(svr.muteRole.length <= 0) return msg.channel.send('No Muted Role set.');

        let mutedUser = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]); args.shift();

        let test, reason, duration;
        if(args[0]) {
            if(args.length > 0) test = args.pop();

            let value = test.split('');
            let select = value.pop();
            value = parseInt(value.join(''));
            if(!isNaN(value)) {
                if(select == 's') {duration = value; duration = parseInt(duration);}
                else if(select == 'm') {duration = value * 60; duration = parseInt(duration);}
                else if(select == 'h') {duration = value * 3600; duration = parseInt(duration);}
                else if(select == 'd') {duration = value * 86400; duration = parseInt(duration);}
                else if(select == 'w') {duration = value * 604800; duration = parseInt(duration);}
                else {duration = 'indefinite';}
            } else {
                args.push(test);
            }

            reason = args.length > 0 ? args.join(' ') : 'Unspecified';
        } else {
            duration = 'indefinite';
            reason = 'Unspecified';
        }

        let userRoleData = [];
        let userRoles = mutedUser.roles.cache.array();
        for(let i = 0; i < userRoles.length; i++) {
            if(userRoles[i].name != '@everyone') {
                userRoleData.push(userRoles[i].id);
                mutedUser.roles.remove(mutedUser.roles.cache.get(userRoles[i].id));
            }
        }

        fs.access(`./data/users/${msg.guild.id}`, (e) => {
            if(e) fs.mkdirSync(`./data/users/${msg.guild.id}`);
            fs.writeFileSync(`./data/users/${msg.guild.id}/${mutedUser.id}.json`, JSON.stringify(userRoleData));
        });

        await mutedUser.roles.add(msg.guild.roles.cache.get(svr.muteRole));

        duration = duration * 1000;
        if(typeof duration == 'number') {
            setTimeout(() => {
                mutedUser.roles.remove(msg.guild.roles.cache.get(svr.muteRole));
                let roleRestore = JSON.parse(fs.readFileSync(`./data/users/${msg.guild.id}/${mutedUser.id}.json`));
                for(let i of roleRestore) {
                    mutedUser.roles.add(msg.guild.roles.cache.get(i));
                }
                fs.unlinkSync(`./data/users/${msg.guild.id}/${mutedUser.id}.json`);
                msg.channel.send(`${mutedUser} has been unmuted.`);
            }, duration);
        }

        let reportEmbed = new Discord.MessageEmbed()
        .setDescription('Report ticket')
        .setColor(color.red)
        .addField('Muted user', `${mutedUser}`, true)
        .addField('Channel', `${msg.channel}`, true)
        .addField('Time', `${msg.createdAt}`, true)
        .addField('Reason', reason, true)
        .addField('Muted by', `${msg.author}`, true);

        let reportChannel = msg.guild.channels.cache.find(c => c.id == svr.logChan);
        if (!reportChannel) {
            reportChannel = msg.channel;
            msg.channel.send('Report channel doesn\'t exist. Sending report to local channel instead.');
        }
        reportChannel.send({ embed: reportEmbed });
    }
}