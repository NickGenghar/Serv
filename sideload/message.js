const Discord = require('discord.js');
const fs = require('fs');

const core = require('../configurations/core.json');

const queue = new Map();

module.exports = {
    task: 'message',
    run: async msg => {
        let serverConfig = {
            prefix: core.prefix,
            modules: ['help'],
            modRole: [],
            defRole: '',
            logChan: '',
            loggedChan: [],
            noInvite: true
        };
        let svr;
        try {
            svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        } catch(e) {
            if(msg.channel.type == 'dm') return;
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(serverConfig));
            svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        }
        let prefix = svr.prefix || core.prefix;

        if(svr.noInvite && msg.content.match(/(.*)discord.gg(.*)/)) {
            msg.delete().catch(e => (console.log(e)));
            return msg.channel.send(`Hello ${msg.author}, invitation link is prohibited in this server.`);
        }

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