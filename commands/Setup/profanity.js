const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'profanity',
    alias: [module.exports.name, 'badword'],
    desc: 'Manage profanity filtered words.',
    usage: [
        '//profanity {Add|Remove} <Word>',
        'Add: Add a given word into the profanity list.',
        'Remove: Remove the given word from the profanity list.',
        '',
        'Word: The word to be added or removed from the profanity list.'
    ],
    dev: false,
    mod: true,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        if(!args[0]) {
            let profanityEmbed = new Discord.MessageEmbed()
            .setTitle('Profanity List')
            .setDescription(`The following words has been added to the profanity list.\n\n||${svr.profanity.join('\n')}||`);

            return msg.channel.send({embed: profanityEmbed});
        }
        switch(args[0].toLowerCase()) {
            case('add'): {
                if(svr.profanity.indexOf(args[1]) < 0) {
                    svr.profanity.push(args[1]);
                    fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr, null, '\t'));
                    return msg.channel.send(`Added ||\`${args[1]}\`|| into the profanity list.`);
                } else {
                    return msg.channel.send(`The word ||\`${args[1]}\`|| has already added to the profanity list.`);
                }
            } //break;
            case('remove'): {
                if(svr.profanity.indexOf(args[1]) > -1) {
                    svr.profanity.splice(svr.profanity.indexOf(args[1]), 1);
                    fs.writeFileSync(`./data/guilds/${msg.guild.id}.json`, JSON.stringify(svr, null, '\t'));
                    return msg.channel.send(`Removed ||\`${args[1]}\`|| from the profanity list.`);
                } else {
                    return msg.channel.send(`The word ||\`${args[1]}\`|| is not listed in the profanity list.`);
                }
            } //break;
        }
    }
}