const Discord = require('discord.js');
const fs = require('fs');

const initial = {
    xp: 0,
    level: 0,
    buffer: Date.now()
}

let increment = (msg, usr, cap) => {
    if(usr.xp >= cap) {
        usr.xp -= cap;
        usr.level += 1;
        msg.channel.send(`Congratulations ${msg.author}, you have leveled up in this server.`);
        increment(msg,usr);
    }
}

module.exports = {
    task: 'levels',
    run: (msg) => {
        if(msg.author.bot) return;

        let svr;
        try {
            svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
            if(!svr.modules.includes('level') || msg.content.indexOf(svr.prefix) == 0) return;
        } catch(e) {
            if(e) return;
        }

        let usr;
        try{
            usr = JSON.parse(fs.readFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`));
            if(!usr) {
                try {fs.writeFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`, JSON.stringify(initial));}
                catch(e) {
                    fs.mkdirSync(`./data/levels/${msg.guild.id}`)
                    fs.writeFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`, JSON.stringify(initial))
                }
                usr = JSON.parse(fs.readFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`));
            }
        } catch(e) {
            try {fs.writeFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`, JSON.stringify(initial));}
            catch(e) {
                fs.mkdirSync(`./data/levels/${msg.guild.id}`)
                fs.writeFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`, JSON.stringify(initial))
            }
            usr = JSON.parse(fs.readFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`));
        }

        if(Date.now() - usr.buffer < svr.lvlbuf) return;
        else usr.buffer = Date.now();

        let cap = (usr.level + 1) * svr.lvlincrement;
        let multiplier = Math.floor(Math.random() * (svr.lvlincrementmax - svr.lvlincrementmin + 1) + svr.lvlincrementmin) * svr.lvlmul;
        usr.xp += multiplier;

        increment(msg, usr, cap);

        fs.writeFileSync(`./data/levels/${msg.guild.id}/${msg.author.id}.json`, JSON.stringify(usr));
    }
}