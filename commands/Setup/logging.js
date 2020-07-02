const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');

module.exports = {
    name: 'logging',
    alias: [module.exports.name, 'log', 'lg'],
    desc: 'Shows the current logging configuration.',
    usage: [
        '//Logging',
        'Gives the overview of the configuration.',
        '',
        '//Logging <Log Channel> \'Log\'',
        'Log Channel: Channel to log.',
        'Log [Flag]: Marks the specified channel as the primary logging channel.'
    ],
    dev: false,
    mod: true,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
    
        let logChannel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]); args.shift();
        let logChan;
        if(svr.logChan != '') logChan = msg.guild.channels.cache.get(svr.logChan);
        else logChan = 'Not logging';
    
        if(!logChannel) {
            let logChannelEmbed = new Discord.MessageEmbed()
            .setTitle('Logging Channel Config');
    
            let gLogChannel = msg.guild.channels.cache.array();
            let logChannels = [];
            for(let i of gLogChannel)
            for(let j of svr.loggedChan) {
                if(i.id == j) logChannels.push(i);
            }
    
            logChannelEmbed.setDescription(`Logging Channel:\n${logChan}\n\nLogged Channels:\n${logChannels.join('\n')}`);
            return msg.channel.send({embed: logChannelEmbed});
        }
    
        if(args[0] && args[0].toLowerCase() == 'log') {
            svr.logChan = logChannel.id;
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            return msg.channel.send(`Set ${logChannel} as the primary logging channel.`);
        }
    
        if(svr.logChan == logChannel.id) {
            svr.logChan = '';
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            return msg.channel.send(`Unset ${logChannel} from the primary logging channel.`);
        } else if(svr.loggedChan.includes(logChannel.id)) {
            svr.loggedChan.splice(svr.loggedChan.findIndex(v => v == logChannel.id), 1);
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            return msg.channel.send(`Removed ${logChannel} from being logged.`);
        } else {
            svr.loggedChan.push(logChannel.id);
            fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
            return msg.channel.send(`Added ${logChannel} for logging.`);
        }
    }
}