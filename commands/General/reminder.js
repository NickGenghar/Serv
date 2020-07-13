const Discord = require('discord.js');
const fs = require('fs');

const colors = require('../../configurations/color.json');
const toDuration = require('../../functions/toDuration.js');

module.exports = {
    name: 'reminder',
    alias: [module.exports.name, 'remind', 'checklist'],
    desc: 'Add a reminder for the bot to remind you.',
    usage: [
        '//reminder',
        'List all active reminders',
        '',
        '//reminder <Reminder Text> <Time>',
        'Reminder Text: The text for the reminder.',
        'Time: How long to wait before giving out the reminder.'
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
        let currentReminder;
        try {currentReminder = JSON.parse(fs.readFileSync(`./data/timer/${msg.author.id}.json`));}
        catch(e) {if(e) currentReminder = [];}

        let user = msg.guild.members.cache.get(msg.author.id);

        let timer = toDuration(args.pop());
        if(timer < 0) return msg.channel.send('Given timer value is not a number. Please input a numerable value into the `<Time>` section.');
        timer*=1000;
        let end = Date.now() + timer;

        let reminder = args.join(' ');
        let reminderEmbed = new Discord.MessageEmbed()
        .setTitle(`Reminder for ${user.user.username}`)
        .setThumbnail(user.user.displayAvatarURL())
        .setColor(colors.white)
        .setDescription(args.join(' '));

        currentReminder.push({
            guild: msg.guild.id,
            channel: msg.channel.id,
            message: msg.id,
            text: reminder,
            end: end
        });
        fs.writeFileSync(`./data/timer/${msg.author.id}.json`, JSON.stringify(currentReminder, null, '\t'));

        msg.channel.send('Reminder received.')
        .then(() => {
            msg.client.timeout[msg.author.id] = msg.client.setTimeout(() => {
                msg.channel.send(`${user}`,{embed: reminderEmbed});
                let currentReminder = JSON.parse(fs.readFileSync(`./data/timer/${msg.author.id}.json`));
                let message = currentReminder.find(i => i.message == msg.id);
                if(message) {
                    currentReminder.splice(currentReminder.indexOf(message), 1);
                    fs.writeFileSync(`./data/timer/${msg.author.id}.json`, JSON.stringify(currentReminder, null, '\t'));
                }
            }, timer);
        });
    }
}