require('dotenv').config();
const Discord = require('discord.js');

const integrity = require('./initial/integrity.js');
const clear = require('./initial/clear.js');
const reload = require('./initial/reload.js');
const state = require('./initial/state.js');
const events = require('./initial/events.js');
const parser = require('./initial/parser.js');
const bots = require('./initial/bots.js');

const master = require('./configurations/master.json');

integrity.local();
state();
clear();

const bot = bots.discord();
//const twitch = bots.twitch();

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

reload(bot);
events(bot);
parser(bot);