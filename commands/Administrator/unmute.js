const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'unmute',
    alias: ['unmute','um'],
    desc: 'Unmute a member from the server. Requires the member to have the muted role in order to unmute.',
    usage: [
        '//unmute <Member>',
        'Member: Target member to unmute.',
        '',
        'WARNING! If you remove the muted role manually, the member\'s original roles will not be restored.'
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

        fs.access(`./data/users/${msg.guild.id}`, (e) => {
            if(e) {
                fs.mkdirSync(`./data/users/${msg.guild.id}`);
                return msg.channel.send('No users have been muted.');
            }
        });

        let user = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);

        try {
            let userRoleData = JSON.parse(fs.readFileSync(`./data/users/${msg.guild.id}/${user.id}.json`));
            for(let i = 0; i < userRoleData.length; i++) {
                user.roles.add(msg.guild.roles.cache.get(userRoleData[i]));
            }
        } catch(e) {
            if(e) return msg.channel.send('The following user has not been muted.')
            .then(() => {throw e;});
        }

        user.roles.remove(msg.guild.roles.cache.get(svr.muteRole));
        fs.unlinkSync(`./data/users/${msg.guild.id}/${user.id}.json`);

        return msg.channel.send(`User ${user} have been unmuted.`);
    }
}