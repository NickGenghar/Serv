const Discord = require('discord.js');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

module.exports = {
    name: '',
    alias: [],
    desc: '',
    usage: [],
    run: async (msg, args, queue) => {
        await msg.delete().catch(e => console.log(e));

        if(!dev.includes(msg.author.id)) return;

        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        //code here
    }
}