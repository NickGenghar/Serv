const Discord = require('discord.js');
const os = require('os');

const colors = require.main.require('./configurations/color.json');
const master = require('../../configurations/master.json');

module.exports = {
    name: 'statistic',
    alias: ['statistic', 'st', 'stat', 'stats'],
    desc: 'Get\'s the bot\'s hosting server statistics.',
    usage: [
        '//stat'
    ],
    dev: false,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        let cpu, devs = [];
		try {
			cpu = os.cpus()[0].model;
		} catch(e) {
			cpu = 'Error getting CPU data';
        }
        for(let i of master.developer) {
            let data = await msg.client.users.fetch(i, false);
            devs.push(data);
        }

        let statEmbed = new Discord.MessageEmbed()
        .setTitle('Statistic')
        .setColor(colors.white)
        .setThumbnail(msg.client.user.displayAvatarURL({size: 2048}))
        .addField('Hardware', `Processor: ${cpu}\nArchitecture: ${os.arch()}\nTotal Memory: ${Math.round(os.totalmem()/1024/1024/1024)} GB\nOperating System ${os.type()}`)
        .addField('General info', `Creators: ${devs.join('\n')},\nTime of Creation: ${msg.client.user.createdAt}`);

        return msg.channel.send({embed: statEmbed});
    }
}