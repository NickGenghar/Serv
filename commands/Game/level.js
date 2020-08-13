const Discord = require('discord.js');
const fs = require('fs');

const selection = [
    'set',
    'add',
    'sub',
    'reset'
]

rescale = (usr, svr) => {
    usr.xp = usr.xp - ((usr.level + 1) * svr.lvlmul);
    usr.level += 1;
    if(usr.xp >= ((usr.level + 1) * svr.lvlmul))
    rescale(usr, svr);
}

module.exports = {
    name: 'level',
    alias: ['level','lvl','rank'],
    desc: 'Level system in the server. Requires configuration to set this module active before using.',
    usage: [],
    dev: false,
    mod: true,
    activate: true,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(!svr.modules.includes('level')) return;

        let usr;/**/
        if(msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id)) && selection.includes(args[0])) {
            switch(args[0]) {
                case(selection[0]): {
                    let m = msg.mentions.members.first() || msg.guild.members.cache.get(args[1]);
                    if(!m) return msg.channel.send('Target member unspecified.');
                    if(!m.username) m = m.user;
                    usr = JSON.parse(fs.readFileSync(`./data/levels/${msg.guild.id}/${m.id}.json`));
                    switch(args[2]) {
                        case('level'): {
                            usr.level = parseInt(args[3]);
                            if(usr.xp > ((usr.level + 1) * svr.lvlmul)) usr.xp = 0;
                        } break;

                        case('xp'): {
                            usr.xp = parseInt(args[3]);
                            if(usr.xp > ((usr.level + 1) * svr.lvlmul)) {
                                rescale(usr, svr);
                            }
                        } break;
                    }
                    fs.writeFileSync(`./data/levels/${msg.guild.id}/${m.id}.json`, JSON.stringify(usr));
                } return;

                case(selection[1]): {

                } return;

                case(selection[2]): {

                } return;

                case(selection[3]): {
                    fs.readdir(`./data/levels/${msg.guild.id}`, (e, f) => {
                        if(e) throw e;
                        f.filter(u => {if(u.indexOf('.js') > -1) return u});
                        f.forEach(info => {
                            fs.readFile(`./data/levels/${msg.guild.id}/${info}`, (e, g) => {
                                if(e) throw e;
                                let content = JSON.parse(g);
                                content.level = 0;
                                content.xp = 0;
                                fs.writeFile(`./data/levels/${msg.guild.id}/${info}`, JSON.stringify(content), (e) => {if(e) throw e;});
                            })
                        })
                    })
                    msg.channel.send('All user levels has been reset.');
                } return;

                default: {}
            }
        } else {
            var member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
            if(!member) {
                member = msg.author;
            }
            if(!member.username) member = member.user;

            usr = JSON.parse(fs.readFileSync(`./data/levels/${msg.guild.id}/${member.id}.json`));
        }
/**/
        let levelsEmbed = new Discord.MessageEmbed()
        .setTitle('Rank')
        .setThumbnail(member.displayAvatarURL({size:2048}))
        .addField('Experience', `${usr.xp} / ${((usr.level + 1) * svr.lvlmul)}`, true)
        .addField('Level', usr.level, true);

        msg.channel.send({embed: levelsEmbed});
    }
}