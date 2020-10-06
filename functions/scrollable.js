const Discord = require('discord.js');

/**
 * 
 * @param {Discord.MessageEmbed} embed - The main Discord.MessageEmbed object to mutate.
 * @param {Discord.Message} msg - The Discord.Message object
 * @param {any} collector - The collector function
 * @param {Number} index - The index of the scrollable
 * @param {{emoji:Discord.Emoji,mutator:Function}[]} func - An array of object in this format:
 */
module.exports = (embed, msg, collector, index, func) => {
    //create filter
    let filter = (r,u) => {
        let filterer = func.map(a => a.emoji);
        return filterer.includes(r.emoji.name) && u.id == collector;
    }

    //start the scrollable driver
    msg.edit({embed:embed})
    .then(() => {
        //add reactions
        func.forEach(e => {
            msg.react(e.emoji);
        });

        //perform reaction collection
        let scrollable = msg.createReactionCollector(filter);
        scrollable.on('collect', (reaction, user) => {
            //copy the base embed
            let newEmbed = new Discord.MessageEmbed(embed);
            //find the correct mutator based on the reaction emojis specified
            let mutator = func.find(a => a.emoji == reaction.emoji.name);

            //fail safe, ignore other emojis
            if(mutator)
            index = mutator.mutator(newEmbed, collector, index, scrollable);

            msg.edit('Finished.')
            .then(async () => {
                const collected = msg.reactions.cache.filter(r => r.users.cache.has(collector));
                try {
                    for(const r of collected.values())
                    await r.users.remove(collector);
                } catch(e) {
                    if(e) throw e;
                }
            });
        });

        scrollable.on('end', () => {
            msg.edit('Collector ended.');
        })
    });
}