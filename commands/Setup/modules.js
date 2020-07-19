const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'modules',
    alias: [module.exports.name, 'module'],
    desc: 'Activate and deactivate command modules for use with the server.',
    usage: [
        '//modules',
        'Shows the current configuration.',
        '',
        '//modules Add <Module>',
        'Activate the specified module.',
        'Module: The name of the module to activate.',
        '',
        '//modules Remove <Module>',
        'Deactivate the specified module.',
        'Module: The name of the module to deactivate.'
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
        let svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        if(!args) {
            let modulesEmbed = new Discord.MessageEmbed()
            .setTitle('Modules Config')
            .setDescription(svr.modules.join('\n'));
            return msg.channel.send({embed: modulesEmbed});
        }

        let opt, val;
        if(args[0]) opt = args.shift();
        if(args[0]) val = args.shift();
        else return msg.channel.send('No module name specified.');

        val = val.toLowerCase();
        switch(opt.toLowerCase()) {
            case('add'): {
                let cmd = msg.client.commands.get(val);
                if(!cmd) return msg.channel.send(`There are no modules named \`${val}\`.`);
                if(!cmd.activate) return msg.channel.send(`Module \`${val}\` does not require activation. It is active by default.`);
                svr.modules.push(val);
                fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                return msg.channel.send(`Module \`${val}\` has been activated.`);
            } //break;
            case('remove'): {
                let cmd = msg.client.commands.get(val);
                if(!cmd) return msg.channel.send(`There are no modules named \`${val}\`.`);
                if(!cmd.activate) return msg.channel.send(`Module \`${val}\` cannot deactivation. It is active by default.`);
                svr.modules.splice(svr.modules.indexOf(val), 1);
                fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                return msg.channel.send(`Module \`${val}\` has been deactivated.`);
            } //break;
            case(''): {
                svr.modules = [];
                fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr));
                return msg.channel.send(`Active server modules have been reverted to default.`);
            } break;
            default: {
                return msg.channel.send(`Unknown option \`${opt}\`. Valid options are:\nAdd\nRemove\nDefault`);
            }
        }
    }
}