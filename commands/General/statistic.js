const Discord = require('discord.js');
const os = require('os');

const color = require.main.require('./configurations/color.json');

module.exports = {
    name: 'statistic',
    alias: ['statistic', 'st', 'stat', 'stats'],
    desc: 'Get\'s the bot\'s hosting server statistics.',
    usage: [
        '//stat'
    ],
    run: async (msg, args) => {
        let cpu;
		try {
			cpu = os.cpus()[0].model;
		} catch(e) {
			cpu = 'Error getting CPU data';
		}

        let statEmbed = new Discord.MessageEmbed()
        .setTitle('Statistic')
        .setColor(color.white)
        .setThumbnail(msg.client.user.displayAvatarURL({size: 2048}))
        .addField('Processor', cpu, true)
        .addField('Architecture', os.arch(), true)
        .addField('RAM in Gigabytes', `${Math.round(os.totalmem()/1024/1024/1024)} GB`, true)
        .addField('Operating System', os.type(), true);

        return msg.channel.send({embed: statEmbed});
    }
}