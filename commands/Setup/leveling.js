const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'leveling',
    alias: [module.exports.name, 'lvli'],
    desc: 'Configure leveling system of the bot. Requires module to be activated first.',
    usage: [
        '//leveling',
        'Shows the current leveling configuration.',
        '',
        '//leveling Multiplier <Value>',
        'Value: The multiplier value for gaining experience.',
        '',
        '//leveling Timeout <Value>',
        'Value: The timeout value, in seconds, before experience can be given.',
        '',
        '//leveling Default {Multiplier|Timeout}',
        'Revert the settings based on the inputted names.',
        '',
        '//leveling Reset {User|All}',
        'Reset: Resets the levels of target user or everyone.',
        'User: The target user for resetting their levels.',
        'All: Targets all users for level reset.'
    ],
    dev: false,
    mod: true,
    activate: true,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');
        if(!svr.modules.includes(module.exports.name)) return msg.channel.send('This module is not activated. Please activate it via the `setup` command.');

        if(!args) {
            let levelingEmbed = new Discord.MessageEmbed()
            .setTitle('Leveling Config')
            .addField('Multiplier', svr.lvlmul, true)
            .addField('Timeout', svr.lvlbuf, true);
            return msg.channel.send({embed: levelingEmbed});
        }

        let opt, val;
        if(args[0]) opt = args.shift();
        if(args[0]) val = parseFloat(args.shift());
        else if(['default','reset'].includes(opt.toLowerCase())) val = args.shift();
        else return msg.channel.send('No value provided. Please provide a value in the second argument.');

        switch(opt.toLowerCase()) {
            case('multiplier'): {
                svr.lvlmul = val;
                fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                return msg.channel.send(`Changed experience multiplier to \`${val}\`.`);
            } //break;
            case('timeout'): {
                svr.lvlbuf = val * 1000;
                fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                return msg.channel.send(`Changed experience gain timeout to \`${val}\`.`);
            } //break;
            case('default'): {
                svr.lvlmul = 1;
                svr.lvlbuf = 60000;
                fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                return msg.channel.send(`Revert all configurations to default.`);
            } //break;
            case('reset'): {
                let user = msg.guild.members.cache.get(val);
                fs.readdir(`./data/users/${msg.guild.id}`, (e,f) => {
                    if(e) return msg.channel.send('Server does not initiate leveling system yet.');
                    else if(user) {
                        f.forEach(i => {
                            if(i.split('.').shift() == `${user.id}`) fs.unlinkSync(`./data/users/${msg.guild.id}/${i}`);
                        });
                    } else {
                        f.forEach(i => {
                            fs.unlinkSync(`./data/users/${msg.guild.id}/${i}`);
                        });
                    }
                    msg.channel.send(`Successfully resetted ${user?user:'everyone'}'s levels.`);
                });
            } break;
            default: {
                return msg.channel.send(`Unknown option \`${opt}\`. Valid options are:\nMultiplier\nTimeout\nDefault\nReset`);
            }
        }
    }
}