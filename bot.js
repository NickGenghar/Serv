const Discord = require('discord.js');

const integrity = require('./initial/integrity.js');
const clear = require('./initial/clear.js');
const reload = require('./initial/reload.js');
const state = require('./initial/state.js');
const events = require('./initial/events.js');
const parser = require('./initial/parser.js');

const master = require('./configurations/master.json');
const token = require('./configurations/token.json').token;

const bot = new Discord.Client();

process.on('unhandledRejection', (e) => {
    let home = bot.guilds.cache.find(e => e.id == master.guild);
    if(!home) return console.log(e);
    home.fetchWebhooks()
    .then(w => {
        let rejectionEmbed = new Discord.MessageEmbed()
        .setTitle('Unhandled Rejection')
        .setDescription(e.toString());

        const webhook = w.find(e => e.name.toLowerCase() == 'serv master log');
        if(webhook) webhook.send(rejectionEmbed);
    });
    console.log(e);
});

integrity();
state();
clear();
reload(bot);
events(bot);

bot.login(token);
parser(bot);