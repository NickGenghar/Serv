const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json').developer;

module.exports = {
    name: 'clear',
    alias: ['clear', 'c'],
    desc: 'Clears messages in a channel.',
    usage: [
        '//clear <Count>',
        '',
        'Count: The amount of messages to be cleared.'
    ],
    run: async (msg, args) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        await msg.delete().catch(e => console.log(e));
        if(master.includes(msg.author.id))
        if(args[0] == 'c')
        return console.clear();

        if(!isNaN(args[0])) {
            if(args[0] > 100)
            args[0] = 100;

            msg.channel.bulkDelete(args[0], true)
            .then(m => {
                msg.channel.send(`Deleted \`${m.size}\` ${m.size <= 1 ? 'message': 'messages'}.`)
                .then(m => m.delete({timeout: 2000})
                .catch(e => {console.log(e)}))
            })
            .catch(e => {console.log(e)});
        }
    }
}