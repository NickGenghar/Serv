const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

module.exports = {
    name: '',
    alias: [module.exports.name],
    desc: '',
    usage: [],
    dev: false,
    mod: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        await msg.delete().catch(e => console.log(e));
    
        //dev only command
        if(!master.developer.includes(msg.author.id)) return;
    
        //server specific command
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
    
        //command needed to be activated first
        if(!svr.modules.includes(module.exports.name)) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');
    
        //code here
        return;
    }
}