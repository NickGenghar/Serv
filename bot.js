const Discord = require('discord.js');
const fs = require('fs');

const defaults = require('./configurations/defaults.json');
const master = require('./configurations/master.json');
const token = process.env.token || require('./configurations/token.json').token;

const bot = new Discord.Client({partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'USER', 'GUILD_MEMBER']});

process.on('unhandledRejection', (e) => {
    bot.guilds.cache.find(e => e.id == master.guild).fetchWebhooks()
    .then(w => {
        let rejectionEmbed = new Discord.MessageEmbed()
        .setTitle('Unhandled Rejection')
        .setDescription(e.toString());

        const webhook = w.find(e => e.name.toLowerCase() == 'serv master log');
        if(webhook) webhook.send(rejectionEmbed);
    });
    console.log(e);
});

//Create directory tree for data storage at first launch from clone.
//Also determine the status of each subfolders.
fs.access('./data', (e) => {
    if(e) {
        console.log('\x1b[33m%s\x1b[0m','Directory doesn\'t exist. Creating...');
        fs.mkdir('./data', (e) => {
            if(e) return console.log('\x1b[31m%s\x1b[0m\n%s','Encountered error while creating data stores.\nYou might not have the required permission to do so', e);
        });
    }

    fs.readdir('./data', (e,f) => {
        if(e) throw e;
        f = f.filter(v => {return v.indexOf('.') < 0;});
        defaults.datastore.forEach(d => {
            fs.mkdir(`./data/${d}`, e => {
                if(e) console.log('\x1b[36m%s\x1b[0m',`Directory [${d}] available.`);
                else console.log('\x1b[33m%s\x1b[0m',`Directory [${d}] doesn\'t exist. Creating...`);
            });
        });
    });
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

bot.on('guildCreate', guild => {
    guild.client.guilds.cache.find(e => e.id == master.guild).fetchWebhooks()
    .then(w => {
        let guildCreateEmbed = new Discord.MessageEmbed()
        .setTitle('Guild Created')
        .setThumbnail(guild.iconURL())
        .addField('Guild Name', guild.name, true)
        .addField('Guild Owner', guild.owner.user.username, true)
        .addField('Guild Created', guild.createdAt, true)
        .addField('Guild Members', guild.memberCount, true)
        .addField('Data Creation Date', new Date(), true);

        const webhook = w.find(e => e.name.toLowerCase() == 'serv master log');
        if(webhook) webhook.send(guildCreateEmbed);
    })

    fs.writeFile(`./data/guilds/${guild.id}.json`, defaults.server_config, (e) => {
        if(e) console.log('Encountered error while creating new server data.');
    });
});

bot.on('guildDelete', guild => {
    guild.client.guilds.cache.find(e => e.id == master.guild).fetchWebhooks()
    .then(w => {
        let guildRemoveEmbed = new Discord.MessageEmbed()
        .setTitle('Guild Deleted')
        .setThumbnail(guild.iconURL())
        .addField('Guild Name', guild.name, true)
        .addField('Guild Owner', guild.owner.user.username, true)
        .addField('Guild Created', guild.createdAt, true)
        .addField('Guild Members', guild.memberCount, true)
        .addField('Data Deletion Date', new Date(Date.now()+604800000));

        const webhook = w.find(e => e.name.toLowerCase() == 'serv master log');
        if(webhook) webhook.send(guildRemoveEmbed);
    })

    setTimeout(() => {
        fs.unlink(`./data/guilds/${guild.id}.json`, (e) => {
            if(e) console.log('Encountered error while deleting old server data.');
        });
    }, 604800000);
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

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(channelCreateEmbed);
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

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(channelDeleteEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
});

bot.on('channelUpdate', async (oldChan, newChan) => {
    let guild = bot.guilds.cache.find(e => e.id.toString() == newChan.toJSON().guild);
    guild.fetchWebhooks()
    .then(a => {
        let channelUpdateEmbed = new Discord.MessageEmbed()
        .setTitle('Channel Update')
        .addField('Old Channel', oldChan.name)
        .addField('New Channel', newChan.toString());

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(channelUpdateEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
});

bot.on('channelPinsUpdate', async (chan, time) => {
    let guild = bot.guilds.cache.find(e => e.id.toString() == chan.toJSON().guild);
    guild.fetchWebhooks()
    .then(a => {
        let channelPinsUpdateEmbed = new Discord.MessageEmbed()
        .setTitle('Channel Pins Update')
        .addField('Channel Name', chan.toJSON().name, true)
        .addField('Channel Type', chan.type, true)
        .addField('Pin Update Timestamp', chan.lastPinAt, true);

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(channelPinsUpdateEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
});

bot.on('emojiCreate', async emoji => {
    let guild = bot.guilds.cache.find(e => e.id == emoji.guild.id);
    guild.fetchWebhooks()
    .then(async a => {
        let author;
        try {author = await emoji.fetchAuthor();}
        catch(e) {author = 'Error retrieving user';}

        let emojiCreateEmbed = new Discord.MessageEmbed()
        .setTitle('Emoji Update')
        .setThumbnail(emoji.url)
        .addField('Emoji Name', emoji.name, true)
        .addField('Emoji Author', author.username, true)
        .addField('Emoji Animated', emoji.animated, true)
        .addField('Emoji Creation Date', emoji.createdAt, true);

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(emojiCreateEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
});

bot.on('emojiDelete', async emoji => {
    let guild = bot.guilds.cache.find(e => e.id == emoji.guild.id);
    guild.fetchWebhooks()
    .then(async a => {
        let author;
        try {author = await emoji.fetchAuthor();}
        catch(e) {author = 'Error retrieving user';}

        let emojiDeleteEmbed = new Discord.MessageEmbed()
        .setTitle('Emoji Update')
        .setThumbnail(emoji.url)
        .addField('Emoji Name', emoji.name, true)
        .addField('Emoji Author', author.username, true)
        .addField('Emoji Animated', emoji.animated, true)
        .addField('Emoji Creation Date', emoji.createdAt, true);

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(emojiDeleteEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
});

bot.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    let guild = bot.guilds.cache.find(e => e.id = newEmoji.guild.id);
    guild.fetchWebhooks()
    .then(a => {
        let emojiUpdateEmbed = new Discord.MessageEmbed()
        .setTitle('Emoji Update')
        .addField('Old Emoji', oldEmoji.toString(), true)
        .addField('Old Emoji Name', oldEmoji.name, true)
        .addField('New Emoji', newEmoji.toString(), true)
        .addField('New Emoji Name', newEmoji.name, true);

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(emojiUpdateEmbed);
    })
    .catch(e => {
        if(e) throw e;
    });
});

bot.on('guildMemberAdd', async member => {
    let guild = bot.guilds.cache.find(e => e.id == member.guild.id);
    guild.fetchWebhooks()
    .then(a => {
        let guildMemberAddEmbed = new Discord.MessageEmbed()
        .setTitle('Member Join')
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Name', member.user.username, true)
        .addField('Bot?', member.user.bot ? 'Yes' : 'No', true)
        .addField('Location', member.user.locale, true)
        .addField('Joined Since', member.joinedAt, true);
        
        let webhook = a.find(e => e.name.toLowerCase() = 'serv log');
        if(webhook) webhook.send(guildMemberAddEmbed);
    });
});

bot.on('guildMemberRemove', async member => {
    let guild = bot.guilds.cache.find(e => e.id == member.guild.id);
    guild.fetchWebhooks()
    .then(a => {
        let guildMemberRemoveEmbed = new Discord.MessageEmbed()
        .setTitle('Member Left')
        .setThumbnail(member.user.displayAvatarURL())
        .addField('Name', member.user.username, true)
        .addField('Bot?', member.user.bot ? 'Yes' : 'No', true)
        .addField('Location', member.user.locale, true)
        .addField('Joined Since', member.joinedAt, true);
        
        let webhook = a.find(e => e.name.toLowerCase() = 'serv log');
        if(webhook) webhook.send(guildMemberRemoveEmbed);
    });
});

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
    if(master.developer.includes(msg.author.id) && msg.content.toLowerCase() == '///reload') {
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

bot.on('messageDelete', async msg => {
    let guild = bot.guilds.cache.find(e => e.id == msg.guild.id);
    guild.fetchWebhooks()
    .then(a => {
        let messageDeleteEmbed = new Discord.MessageEmbed()
        .setTitle('Message Delete')
        .addField('Message Author', msg.author, true)
        .addField('Message Content', msg.content, true);

        let attachments = msg.attachments.array();
        if(attachments.length > 0) {
            attachments = attachments.map(e => e.url);
            messageDeleteEmbed.addField('Message Attachments', attachments, true);
        }

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook && !msg.author.bot) webhook.send(messageDeleteEmbed);
    });
});

bot.on('messageDeleteBulk', async msgs => {
    let guild = bot.guilds.cache.find(e => e.id == msgs.array()[0].guild.id);
    guild.fetchWebhooks()
    .then(a => {
        msgs = msgs.array();
        let newMsgs = [];
        for(let i = 0; i < msgs.length; i++) {
            newMsgs.push({
                author: msgs[i].author.tag,
                content: msgs[i].content
            });
        }
        fs.writeFileSync(`./temp/${msgs[0].guild.id}.json`, JSON.stringify(newMsgs));
        const attachment = new Discord.MessageAttachment(`./temp/${msgs[0].guild.id}.json`);
        let messageDeleteBulkEmbed = new Discord.MessageEmbed()
        .setTitle('Message Delete Bulk')
        .attachFiles(attachment);

        let webhook = a.find(e => e.name.toLowerCase() == 'serv log');
        if(webhook) webhook.send(messageDeleteBulkEmbed);
    });
});