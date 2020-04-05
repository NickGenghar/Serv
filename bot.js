const Discord = require('discord.js');
const fs = require('fs');

const core = require('./configurations/core.json');
const dev = require('./configurations/developer.json');
const token = process.env.token || require('./configurations/token.json').token;

const bot = new Discord.Client();

process.on('unhandledRejection', e => {
    console.log(e);
});

//Create directory tree for data storage at first launch from clone.
fs.access('./data', (e) => {
    if(e) {
        console.log('\x1b[33m%s\x1b[0m','Directory doesn\'t exist. Creating...');
        fs.mkdir('./data', (e) => {
            if(e) throw e;
            fs.mkdir('./data/guilds', (e) => {
                if(e) throw e;
            });
            fs.mkdir('./data/levels', (e) => {
                if(e) throw e;
            });
            fs.mkdir('./data/playlist', (e) => {
                if(e) throw e;
            });
            fs.mkdir('./data/users', (e) => {
                if(e) throw e;
            });
        });
    }
});

//Clear temp folder at startup
let clear = () => {
    fs.access('./temp', (e) => {
        if(e) {
            fs.mkdir('./temp', (e) => {
                if(e) throw e;
            });
        } else {
            fs.readdir('./temp', (e, f) => {
                if(e) throw e;
                let files = f.filter(e => {if(e.indexOf('.') > -1) return e});
                files.forEach(g => {
                    fs.unlink(`./temp/${g}`, e => {
                        if(e) return console.log(e);
                    });
                });
            });
        }
    });
}

let reload = () => {
    bot.commands = new Discord.Collection();
    bot.sideload = new Discord.Collection();

    let indexSuccess = 0;
    let indexSkipped = 0;
    let indexFailed = 0;
    const sideloads = fs.readdirSync('./sideload').filter(file => {if(file.indexOf('.js') > -1) return file;});
    if(sideloads.length <= 0) {
        console.error('\x1b[31m%s\x1b[0m','Required directory is empty! Cannot proceed without any command modules installed. Exiting...');
        return process.exit(-1);
    } else {
        sideloads.forEach(sides => {
            delete require.cache[require.resolve(`./sideload/${sides}`)];
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
                        delete require.cache[require.resolve(`./commands/${subFolder}/${files}`)];
                        let pull = require(`./commands/${subFolder}/${files}`);
                        if(pull.name != '') {
                            command[index] = {
                                name: pull.name,
                                alias: pull.alias,
                                desc: pull.desc,
                                usage: pull.usage,
                                run: pull.run,
                                type: subFolder
                            }
                            bot.commands.set(command[index].name, command[index++]);
                            indexSuccess += 1;
                            console.log('\x1b[36m%s\x1b[0m',`Loaded command [${pull.name}] from "./commands/${subFolder}/${files}"`);
                        } else {
                            indexSkipped += 1;
                            console.log('\x1b[33m%s\x1b[0m',`Command module [${files}] has incomplete parameters. Ignoring...`);
                        }
                    } catch(e) {
                        indexFailed += 1;
                        console.error('\x1b[31m%s\x1b[0m',e);
                    }
                })
            }
        })
    }

    if(indexFailed > 0)
    console.log(`\x1b[33m%s\x1b[0m`, 'Some modules failed to load. Check the logs to see what module failed to load.');
    if(indexSkipped > 0)
    console.log(`\x1b[33m%s\x1b[0m`, 'Some modules are skipped. Check the logs to see what module skipped from loading.');
    return [indexSuccess, indexSkipped, indexFailed];
}

reload();
clear();

if(bot.commands.length <= 0) {
    console.error('\x1b[31m%s\x1b[0m', 'All command subfolders are empty! Cannot proceed without any command modules installed. Exiting...');
    return process.exit(-1);
}

bot.login(token);

bot.once('ready', () => {
    console.log('\x1b[32m%s\x1b[0m','Serv Ready.');
    bot.user.setPresence({activity: {name: '//help', type: 'CUSTOM_STATUS'}, status: 'online'});
});

bot.on('channelCreate', async chan => {
    let guild = chan.client.guilds.cache.find(e => e.id.toString() == chan.toJSON().guild);
    guild.fetchWebhooks()
    .then(a => {
        let channelCreateEmbed = new Discord.MessageEmbed()
        .setTitle('Channel Deleted')
        .addField('Channel Name', chan.toJSON().name, true)
        .addField('Channel Type', chan.type, true)
        .addField('Created Timestamp', chan.createdAt, true);

        let webhook = a.find(e => e.name.toLowerCase() == 'logging');
        webhook.send(channelCreateEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
});

bot.on('channelDelete', async chan => {
    let guild = chan.client.guilds.cache.find(e => e.id.toString() == chan.toJSON().guild);
    guild.fetchWebhooks()
    .then(a => {
        let channelDeleteEmbed = new Discord.MessageEmbed()
        .setTitle('Channel Deleted')
        .addField('Channel Name', chan.toJSON().name, true)
        .addField('Channel Type', chan.type, true)
        .addField('Created Timestamp', chan.createdAt, true);

        let webhook = a.find(e => e.name.toLowerCase() == 'logging');
        webhook.send(channelDeleteEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
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
});

bot.on('message', async msg => {
    if(dev.includes(msg.author.id) && msg.content.toLowerCase() == '///reload') {
        await msg.delete().catch(e => console.log(e));
        console.log(`\x1b[33m%s\x1b[0m`, 'Reloading Commands');
        reload();
    }

    let cmd;
    if(bot.sideload) cmd = bot.sideload.get('message');
    else return;

    try{
        cmd.run(msg);
    } catch(e) {
        if(e) throw e;
    }
});
