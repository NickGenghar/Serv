const Discord = require('discord.js');
const fs = require('fs');

const defaults = require.main.require('./configurations/defaults.json');

const queue = new Map();

module.exports = {
    task: 'message',
    run: async (msg, svr) => {
        if(msg.channel.type == 'dm' || msg.author.bot) return;

        let prefix = svr.prefix || defaults.prefix;

        if(svr.noInvite && msg.content.match(/(.*)discord.gg(.*)/)) {
            msg.delete().catch(e => {if(e) throw e;});
            return msg.channel.send(`Hello ${msg.author}, invitation link is prohibited in this server.`);
        }
        let mainPool = '(.*\\S)(?=.)(\\S)';

        let testPool = defaults.linkPattern.slice();
        testPool = testPool.join('|');
        testPool = `(${testPool})`;

        let regex = new RegExp(mainPool+testPool,'g');
        if(svr.noLink && msg.content.match(regex)) {
            msg.delete().catch(e => {if(e) throw e;});
            return msg.channel.send(`Hello ${msg.author}, link is not allowed in this server.`);
        }

        if(msg.mentions.users.first() == msg.client.user) return msg.channel.send(`My prefix is \`${prefix}\`.`);

        var args = msg.content.split(/ +|"(.*?)"|'(.*?)'/g).filter(v => {if(typeof v != 'undefined' || v != '') return v;});
        var coms = args.shift();

        if(coms && coms.indexOf(prefix) == 0) coms = coms.slice(prefix.length);
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