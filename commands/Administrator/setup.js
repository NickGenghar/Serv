const Discord = require('discord.js');
const fs = require('fs');

const core = require('../../configurations/core.json');

var serverConfig = {
    prefix: core.prefix,
    modules: ['setup','help'],
    modRole: [],
    defRole: '',
    logChan: '',
    loggedChan: [],
    noInvite: true,
    tweetChan: ''
};

module.exports = {
    name: 'setup',
    alias: ['setup', 'set'],
    desc: 'Set up the bot to start doing and handling commands',
    usage: [
        '`//setup`',
        'Print\'s the current configurations.',
        '',
        '`//setup {Set|Add|Remove} {Prefix|Module|Mod|Join|Invite} <Option>`',
        '',
        'Set: Set a configuration to a specific value.',
        'Add: Add a configuration on top of a current configuration.',
        'Remove: Remove a configuration and set it to the default value.',
        '',
        'Prefix [Set]: Set the server prefix.',
        'Module [Add]: Activate a command module to the server.',
        'Mod [Set|Add]: Add a moderator role for use with this bot.',
        'Join [Set]: Set a join role to the server and add that role to new members.',
        'Invite [Set = Yes | Remove = No]: Allow or prohibit invites from everyone, including moderators.',
        '',
        'Option: Role, Module name, or prefix.',
        '',
        'Note: Once a moderator role is set, members are required to have that role in order to use commands that requires it.'
    ],
    run: async (msg, args) => {
        var svr;
        var setupEmbed = new Discord.MessageEmbed();
        try{
            svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
            if(!svr) fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(serverConfig));
        } catch(e) {
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(serverConfig));
        }
        svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));

        if(args.length <= 0) {
            let loggedChannel = [];
            for(let i = 0; i < svr.loggedChan.length; i++)
            loggedChannel.push(msg.guild.channels.array().cache.find(i => i.id == svr.loggedChan[i]));

            let moderatorRole = [];
            for(let i = 0; i < svr.modRole.length; i++)
            moderatorRole.push(msg.guild.roles.cache.find(role => role.id == svr.modRole[i]));

            try {var logChannel = msg.guild.channels.cache.find(c => c.id == svr.logChan);}
            catch(e) {var logChannel = 'No Logging Channel Set.';}

            try {
                var twChannel = msg.guild.channels.cache.find(c => c.id == svr.tweetChan);
                if(!twChannel) var twChannel = 'No Twitter Channel Set.';
            }
            catch(e) { var twChannel = 'No Twitter Channel Set.';}

            setupEmbed.setTitle(`Current Configurations of ${msg.guild.name}`)
            .setDescription(`Server Prefix: **[ ${svr.prefix} ]**`)
            .setThumbnail(msg.guild.iconURL)
            .addField('Active Modules', svr.modules.length > 0 ? svr.modules : '**WARNING!!!** No Modules Set! Please activate at least one of the core modules to avoid issues.', true)
            .addField('Moderator Role', svr.modRole.length > 0 ? moderatorRole : 'No Moderator Role Set', true)
            .addField('Server Join Role', svr.defRole != '' ? svr.defRole : 'No Server Join Role Set', true)
            .addField('Logging Channel', logChannel, true)
            .addField('Channels Logged', loggedChannel.length > 0 ? loggedChannel : 'No Channel Logged', true)
            .addField('Twitter Channel', twChannel, true)
            .addField('Invite Enforcement', svr.noInvite ? 'Prohibited' : 'Allowed', true)
            .setFooter(new Date);

            msg.channel.send({embed: setupEmbed});
        } else {
            let S = args[0] ? args[0].toLowerCase() : '';
            let M = args[1] ? args[1].toLowerCase() : '';
            let O = args[2] ? args[2] : '';
            switch(S) {
                case('set'): {
                    switch(M) {
                        case('prefix'): {
                            if(O != '') {
                                svr.prefix = O;
                                fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                                msg.channel.send(`Server prefix has been set to **[${O}]**.`);
                            } else {
                                msg.channel.send('Prefix is undefined. Please try a different prefix.');
                            }
                        } break;

                        case('mod'): {
                            let moderatorRole = msg.mentions.roles.first() || msg.guild.roles.cache.find(role => role.id == O);
                            if(!moderatorRole) return msg.channel.send(`Role ${O} is invalid.`);
                            if(svr.modRole.includes(moderatorRole.id)) return msg.channel.send(`Role ${O} has already been set as Moderator Role.`);
                            svr.modRole.push(moderatorRole.id);
                            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                            msg.channel.send(`Role ${moderatorRole} has been set as Moderator Role.`);
                        } break;

                        case('log'): {
                            let loggingChannel = msg.mentions.channels.first() || msg.guild.channels.cache.find(chan => chan.id == O);
                            if(!loggingChannel) return msg.channel.send(`Channel ${O} is invalid.`);
                            svr.logChan = loggingChannel.id;
                            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                            msg.channel.send(`Channel ${loggingChannel} has been set as Logging Channel`);
                        } break;

                        case('invite'): {
                            svr.noInvite = false;
                            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                            msg.channel.send('Invite link is now allowed in this server.');
                        } break;

                        case('tweets'): {
                            let tweetChannel = msg.mentions.channels.first() || msg.guild.channels.cache.find(chan => chan.id == O);
                            if(!tweetChannel) return msg.channel.send(`Channel ${O} is invalid`);
                            svr.tweetChan = tweetChannel.id;
                            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                            msg.channel.send(`Channel ${tweetChannel} has been set as Twitter Channel`);
                        } break;
                    }
                } break;

                case('add'): {
                    switch(M) {
                        case('mod'): {
                            let moderatorRole = msg.mentions.roles.first() || msg.guild.roles.cache.find(role => role.id == O);
                            if(!moderatorRole) return msg.channel.send(`Role ${O} is invalid.`);
                            if(svr.modRole.includes(moderatorRole.id)) return msg.channel.send(`Role ${O} has already been set as Moderator Role.`);
                            svr.modRole.push(moderatorRole.id);
                            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                            msg.channel.send(`Role ${moderatorRole} has been added as Moderator Role.`);
                        } break;
                    }
                } break;

                case('remove'): {
                    switch(M) {
                        case('tweets'): {
                            let tweetChannel = msg.guild.channels.cache.find(chan => chan.id == svr.tweetChan);
                            svr.tweetChan = '';
                            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                            msg.channel.send(`Channel ${tweetChannel} has been remove from Twitter Channel.`);
                        } break;
                    }
                    if(M == 'prefix') {
                        svr.prefix = core.prefix;
                        fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                        msg.channel.send('Prefix has been reset to the default prefix: **[//]**');
                    } else if(M == 'mod') {
                        let moderatorRole = msg.mentions.roles.first() || msg.guild.roles.cache.find(role => role.id == O);
                        if(!moderatorRole) return msg.channel.send(`Role ${O} is invalid.`);
                        if(!svr.modRole.includes(moderatorRole.id)) return msg.channel.send(`Role ${O} is not set as Moderator Role.`);
                        svr.modRole = svr.modRole.filter(m => m != moderatorRole.id);
                        fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                        msg.channel.send(`Role ${moderatorRole} has been remove from Moderator Role.`);
                    } else if(M == 'log') {
                        let loggingChannel = msg.mentions.channels.first() || msg.guild.channels.cache.find(chan => chan.id == O);
                        if(!loggingChannel) return msg.channel.send(`Channel ${O} is invalid.`);
                        if(svr.logChan != loggingChannel.id) return msg.channel.send(`Channel ${loggingChannel} is not set as Logging Channel.`);
                        svr.logChan = '';
                        fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                        msg.channel.send(`Channel ${loggingChannel} has been remove from Logging Channel`);
                    } else if(M == 'invite') {
                        svr.noInvite = true;
                        fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                        msg.channel.send('Invite link is now prohibited in this server.');
                    }
                } break;

                default: {
                    let help = require('../General/help.js');
                    return help.run(msg, ['setup']);
                }
            }
        }
    }
}