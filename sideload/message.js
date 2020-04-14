const Discord = require('discord.js');
const fs = require('fs');

const pref = require.main.require('./configurations/defaults.json').prefix;

const queue = new Map();

module.exports = {
    task: 'message',
    run: async msg => {
        let serverConfig = require('../configurations/defaults.json').server_config;
        let svr;
        try {
            svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        } catch(e) {
            if(msg.channel.type == 'dm') return;
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(serverConfig));
            svr = serverConfig;
        }
        let prefix = svr.prefix || pref;

        if(svr.noInvite && msg.content.match(/(.*)discord.gg(.*)/)) {
            msg.delete().catch(e => (console.log(e)));
            return msg.channel.send(`Hello ${msg.author}, invitation link is prohibited in this server.`);
        }

        if(msg.mentions.users.first() == msg.client.user) return msg.channel.send(`My prefix is \`${prefix}\`.`);

        var args = msg.content.split(/ +/);
        var coms = args.shift();

        if(coms.indexOf(prefix) == 0) coms = coms.slice(prefix.length);
        else return;

        var execute = msg.client.commands.get(coms) || msg.client.commands.find(a => a.alias && a.alias.includes(coms));
        if(!execute) return;

        try {
            execute.run(msg, args, queue);
        } catch(e) {
            if(e) throw e;
        }
    }
}