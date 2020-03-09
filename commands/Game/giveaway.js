const Discord = require('discord.js');
const fs = require('fs');
const randomOrg = require('random-org-http');

module.exports = {
    name: 'giveaway',
    alias: ['giveaway', 'give'],
    desc: 'Create a giveaway. Once the time runs out, the bot will automatically ping the winners saying they have won the giveaway. Also ping the initiator for notifying the end of the giveaway.',
    usage: [
        '//giveaway <Winners> <Duration(Switch)> <Item>',
        '',
        'Winners: How many winners that can win this giveaway.',
        'Duration: duration of the giveaway in range 30 seconds to 7 days.',
        'Switch: Valid switch: s (seconds), m (minutes), h (hours), d (days)',
        'Item: The item winners won. This is a type string/text.'
    ],
    run: async (msg, args, queue) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        let emoji = msg.client.emojis.cache.find(e => e.name == 'NickExeMove').id;

        if(args.length < 3) return;
        let winners = parseInt(args.shift());
        let duration = args.shift();
        let item = args.join(' ');

        duration = duration.split('');
        let tSwitch = duration.pop();
        tSwitch = tSwitch.toLowerCase();
        duration = parseInt(duration.join(''));

        switch(tSwitch) {
            case('s'): {duration = duration * 1000;} break;
            case('m'): {duration = duration * 1000 * 60;} break;
            case('h'): {duration = duration * 1000 * 60 * 60;} break;
            case('d'): {duration = duration * 1000 * 60 * 60 * 24;} break;
            default: {return msg.channel.send(`No switch inputted.`);}
        }
        if(duration > 604800000 && duration <= 30000) return msg.channel.send('Duration out of range.');

        let giveawayEmbed = new Discord.MessageEmbed()
        .setTitle('Server Giveaway!')
        .setDescription(`Prizes:\n**${item}**\n\nEnter this giveaway by reacting to the emoji below!`)
        .setThumbnail(msg.guild.iconURL);

        msg.channel.send({embed: giveawayEmbed})
        .then(m => {
            m.react(emoji);
            m.awaitReactions((e) => {return e.emoji.name == 'NickExeMove'},{time: duration})
            .then(async r => {
                let pool = [];
                let data = JSON.parse(JSON.stringify(r))[0].users;
                data = data.filter(s => {return s != msg.client.user.id});

                if(data.length == 1) {
                    pool = [msg.guild.members.cache.get(data[0])];
                } else if(data.length > 1) {
                    for(let i = 0; i < winners; i++) {
                        let index;

                        if(data.length <= 0) break;
                        else if(data.length == 1) index = [0];
                        else {
                            index = await randomOrg.integers({
                                num: 1,
                                min: 0,
                                max: data.length - 1
                            });
                        }

                        let member = msg.guild.members.cache.get(data[index[0]]);
                        pool.push(member);
                        data = data.filter((d,n) => {return n != index[0]});
                    }
                } else {
                    return msg.channel.send('No participants, no winner can be chosen.');
                }
                msg.channel.send(`And the winner of the giveaway is:\n${pool}.\n\nCongratulations!`);
            })
            .catch(e => {
                if(e) throw e;
            });
        })
    }
}