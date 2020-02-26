const Discord = require('discord.js');
const fs = require('fs');

const core = require('./configurations/core.json');
const dev = require('./configurations/developer.json');
const token = process.env.token || require('./configurations/token.json').token;

const bot = new Discord.Client();

process.on('unhandledRejection', e => {
    console.log(e);
});

//Clear temp folder at startup
let clear = () => {
    fs.readdir('./temp', (e, f) => {
        let files = f.filter(e => {if(e.indexOf('.') > -1) return e});
        files.forEach(g => {
            fs.unlink(`./temp/${g}`, e => {
                if(e) return console.log(e);
            })
        })
    })
}

let reload = () => {
    bot.commands = new Discord.Collection();
    bot.sideload = new Discord.Collection();

    const sideloads = fs.readdirSync('./sideload').filter(file => {if(file.indexOf('.js') > -1) return file;});
    if(sideloads.length <= 0) {
        console.error('\x1b[31m%s\x1b[0m','Required directory is empty! Cannot proceed without any command modules installed. Exiting...');
        return process.exit(-1);
    } else {
        sideloads.forEach(sides => {
            let pull = require(`./sideload/${sides}`);
            bot.sideload.set(pull.task, pull);
        });
    }

    let commandFolder = fs.readdirSync('./commands').filter(folder => {if(folder.indexOf('.') < 0) return folder});
    if(commandFolder.length <= 0) {
        console.error('\x1b[31m%s\x1b[0m','Command modules are empty! Cannot proceed if no commands are present. Exiting...');
        return process.exit(-1);
    } else {
        commandFolder.forEach(subFolder => {
            let commandFiles = fs.readdirSync(`./commands/${subFolder}`).filter(files => {if(files.indexOf('.js') > -1) return files});
            if(commandFiles.length <= 0) {
                console.error('\x1b[33m%s\x1b[0m',`Folder "${subFolder}" is empty. Ignoring...`);
            } else {
                let command = [];
                let index = 0;
                commandFiles.forEach(files => {
                    try {
                        let pull = require(`./commands/${subFolder}/${files}`);
                        command[index] = {
                            name: pull.name,
                            alias: pull.alias,
                            desc: pull.desc,
                            usage: pull.usage,
                            run: pull.run,
                            type: subFolder
                        }
                        bot.commands.set(command[index].name, command[index++]);
                        console.log('\x1b[36m%s\x1b[0m',`Loaded command [${pull.name}] from "./commands/${subFolder}/${files}"`);
                    } catch(e) {
                        console.error('\x1b[31m%s\x1b[0m',e);
                    }
                })
            }
        })
    }
}

clear();
reload();

if(bot.commands.length <= 0) {
    console.error('\x1b[31m%s\x1b[0m', 'All command subfolders are empty! Cannot proceed without any command modules installed. Exiting...');
    return process.exit(-1);
}

bot.login(token);

bot.once('ready', () => {
    console.log('\x1b[32m%s\x1b[0m','Serv Ready.');
    bot.user.setPresence({activity: {name: '//help', type: 'CUSTOM_STATUS'}, status: 'online'});
})

bot.on('message', msg => {
    let cmd;
    if(bot.sideload) cmd = bot.sideload.get('levels');
    else return;

    try{
        cmd.run(msg);
    } catch(e) {
        if(e) throw e;
    }
})

bot.on('message', async msg => {
    if(dev.includes(msg.author.id) && msg.content.toLowerCase() == '///maintenance') {
        bot.user.setPresence({activity: {name: 'Maintenance Mode', type: 'CUSTOM_STATUS'}, status: 'dnd'});
        console.log(`\x1b[33m%s\x1b[0m`, 'Maintenance mode activated');
        delete bot.commands;
        delete bot.sideload;
        delete require.cache;
        return;
    } else if(dev.includes(msg.author.id) && msg.content.toLowerCase() == '///reload') {
        console.log(`\x1b[33m%s\x1b[0m`, 'Maintenance mode deactivated');
        reload();
        return bot.user.setPresence({activity: {name: '//help', type: 'CUSTOM_STATUS'}, status: 'online'});
    }

    let cmd;
    if(bot.sideload) cmd = bot.sideload.get('message');
    else return;

    try{
        cmd.run(msg);
    } catch(e) {
        if(e) throw e;
    }
})