const Discord = require('discord.js');
const fs = require('fs');

const colors = require('../configurations/color.json');
/**
 * @param {Discord.Client} bot 
 */
module.exports = async (bot) => {
    fs.readdir('./data/timer', (e,f) => {
        if(e) throw e;
        f.forEach(i => {
            fs.readFile(`./data/timer/${i}`, (e,d) => {
                if(e) throw e;
                let now = Date.now();
                let data = JSON.parse(d.toString());
                data.forEach(e => {
                    let channel = bot.guilds.cache.get(e.guild).channels.cache.get(e.channel);
                    let user = channel.guild.members.cache.get(i.split('.').shift())
                    let reminderEmbed = new Discord.MessageEmbed()
                    .setTitle(`Reminder for ${user.user.username}`)
                    .setThumbnail(user.user.displayAvatarURL())
                    .setColor(colors.white)
                    .setDescription(e.text);

                    if(now >= e.end) {
                        channel.send(`${user}\nThe bot experience a downtime which makes this reminder overdue. Sorry for the inconvenience.`, {embed: reminderEmbed})
                        .then(() => {
                            let file = JSON.parse(fs.readFileSync(`./data/timer/${user.id}.json`));
                            let item = file.find(a => a.message == e.message);
                            if(item) file.splice(file.indexOf(item), 1);
                            fs.writeFileSync(`./data/timer/${user.id}.json`, JSON.stringify(file));
                        });
                    }
                    else {
                        bot.timeout[i.split('.').shift()] = bot.setTimeout(() => {
                            channel.send(`${user}`,{embed: reminderEmbed})
                            .then(() => {
                                let file = JSON.parse(fs.readFileSync(`./data/timer/${user.id}.json`));
                                let item = file.find(a => a.message == e.message);
                                if(item) file.splice(file.indexOf(item), 1);
                                fs.writeFileSync(`./data/timer/${user.id}.json`, JSON.stringify(file));
                            });
                        }, e.end - now);
                    }
                });
                fs.writeFile(`./data/timer/${i}`, JSON.stringify(data, null, '\t'), (e) => {if(e) throw e;});
            });
        });
    });
}