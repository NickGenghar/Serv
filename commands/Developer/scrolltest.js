const Discord = require('discord.js');
const fs = require('fs');

const master = require.main.require('./configurations/master.json');
const scrollable = require('../../functions/scrollable');

module.exports = {
    name: 'scrolltest',
    alias: [module.exports.name],
    desc: 'Testing the scrollable driver',
    usage: ['//scrolltest'],
    dev: true,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        //dev only command
        if(!master.developer.includes(msg.author.id)) return;
        if(!col.get(`${msg.guild.id}.${msg.author.id}`))
            col.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);
        let collector = col.get(`${msg.guild.id}.${msg.author.id}`);

        //code here
        let index = 0;
        let testEmbed = new Discord.MessageEmbed()
        .setTitle('Tester')
        .setDescription('For testing the new Scrollable Driver.')
        .addField('Test Field', 'This field is bonkers.', true);

        let fields = [{
            name: 'Test 1',
            value: 'Value 1',
            inline: true
        }, {
            name: 'Test 2',
            value: 'Value 2',
            inline: true
        }, {
            name: 'Test 3',
            value: 'Value 3',
            inline: true
        }]

        let Drivers = [
            {
                "emoji": "✔",
                /**
                 * @param {Discord.MessageEmbed} embed
                 */
                "mutator": (embed, collector, index, scroller) => {
                    index++;
                    if(index >= fields.length) index = fields.length - 1;

                    embed
                    .spliceFields(0, embed.fields.length)
                    .addField(fields[index].name, fields[index].value, fields[index].inline);

                    return index;
                }
            }, {
                "emoji": "🔴",
                "mutator": (embed, collector, index, scroller) => {
                    index--;
                    if(index < 0) index = 0;

                    embed
                    .spliceFields(0, embed.fields.length)
                    .addField(fields[index].name, fields[index].value, fields[index].inline);

                    return index;
                }
            }, {
                "emoji": "🖤",
                /**
                 * @param {Discord.ReactionCollector} scroller
                 */
                "mutator": (embed, collector, index, scroller) => {
                    scroller.stop();
                }
            }
        ];
        msg.channel.send('Starting embed driver...').then(m => {
            scrollable(testEmbed, m, collector, index, Drivers);
        });

        return;
    }
}