const Discord = require('discord.js');
const YouTube = require('simple-youtube-api');

const token = require('../../configurations/token.json').ytkey;
const youtube = new YouTube(token);

module.exports = {
    name: 'youtube',
    alias: [module.exports.name, 'yt'],
    desc: 'Search a video on YouTube and make use of Discord\'s embed feature as a miniplayer.',
    usage: [
        '//YouTube <Search Term>',
        'Search Term: The search term you want the bot to search for.',
        '',
        'This feature does not support YouTube links because it returns a YouTube link for the embed based miniplayer (duh).'
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
        msg.channel.send('Searching...')
        .then(async m => {
            let contentInfo = [];
            try{
                var searched = await youtube.searchVideos(args.join(' '), 20)
                for(let i of searched) {
                    let videoThumbnail;
                    let pool = Object.keys(i.thumbnails);
                    if(pool.indexOf('maxres') > -1) {videoThumbnail = i.thumbnails.maxres.url;}
                    else if(pool.indexOf('high') > -1) {videoThumbnail = i.thumbnails.high.url;}
                    else if(pool.indexOf('medium') > -1) {videoThumbnail = i.thumbnails.medium.url;}
                    else if(pool.indexOf('standard') > -1) {videoThumbnail = i.thumbnails.standard.url;}
                    else {videoThumbnail = i.thumbnails.default.url;}

                    let duration = [0,0,i.durationSeconds];
                    if(duration[2] > 60) {duration[1] = Math.floor(duration[2]/60); duration[2] %= 60;}
                    if(duration[1] > 60) {duration[0] = Math.floor(duration[1]/60); duration[1] %= 60;}

                    if(i.description.length > 1000) retrieved.description = retrieved.description.slice(0, 999).concat('...');
                    contentInfo.push({
                        url: i.url,
                        title: i.title,
                        channel: i.channel.title,
                        description: i.description,
                        duration: i.durationSeconds >= 0 ? duration.join(':') : 'Unable to resolve duration.',
                        id: i.id,
                        thumbnail: videoThumbnail
                    });
                }
            } catch(e) {
                if(e) m.edit('Encountered error while retrieving data from YouTube.')
                .then(() => {throw e;});
            }

            let index = 0;
            let videoEmbed = new Discord.MessageEmbed()
            .setTitle(`${contentInfo[index].channel}\n${contentInfo[index].title}`)
            .setImage(contentInfo[index].thumbnail)
            .setDescription(contentInfo[index].description)
            .setFooter(`${index+1} of ${contentInfo.length}, Duration: ${contentInfo[index].duration}`)
            .setURL(contentInfo[index].url);

            m.edit({embed: videoEmbed})
            .then(() => {
                if(!col.get(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`))
                    col.set(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`, msg.author.id);
                let author = col.get(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`);
                let filterReact = (reaction, user) => {
                    return (reaction.emoji.name == '◀' || reaction.emoji.name == '▶' || reaction.emoji.name == '🟢' || reaction.emoji.name == '🔴') && user.id == author;
                }

                m.react('◀')
                .then(() => {m.react('▶')})
                .then(() => {m.react('🟢')})
                .then(() => {m.react('🔴')});
                let returnvalue;
                let data = m.createReactionCollector(filterReact);
                data.on('collect', (react, user) => {
                    let newVideoEmbed = new Discord.MessageEmbed(videoEmbed);

                    switch(react.emoji.name) {
                        case('◀'): {
                            index--;
                            if(index < 0) index = 0;

                            newVideoEmbed
                            .setTitle(`${contentInfo[index].channel}\n${contentInfo[index].title}`)
                            .setImage(contentInfo[index].thumbnail)
                            .setDescription(contentInfo[index].description)
                            .setFooter(`${index+1} of ${contentInfo.length}, Duration: ${contentInfo[index].duration}`)
                            .setURL(contentInfo[index].url);
                        } break;
                        case('▶'): {
                            index++;
                            if(index >= contentInfo.length) index = contentInfo.length - 1;

                            newVideoEmbed
                            .setTitle(`${contentInfo[index].channel}\n${contentInfo[index].title}`)
                            .setImage(contentInfo[index].thumbnail)
                            .setDescription(contentInfo[index].description)
                            .setFooter(`${index+1} of ${contentInfo.length}, Duration: ${contentInfo[index].duration}`)
                            .setURL(contentInfo[index].url);
                        } break;
                        case('🟢'): {
                            returnvalue = contentInfo[index].url;
                            return data.stop();
                        } //break;
                        case('🔴'): {
                            return data.stop();
                        } //break;
                    }
                    m.edit({embed: newVideoEmbed})
                    .then(async () => {
                        const collection = m.reactions.cache.filter(r => r.users.cache.has(author));
                        try {
                            for(const r of collection.values())
                            await r.users.remove(author);
                        } catch(e) {
                            if(e) throw e;
                        }
                    });
                });
                data.on('end', () => {
                    m.edit(`${returnvalue?returnvalue:'No video selected.'}`,{embed: null})
                    .then(() => {
                        m.reactions.removeAll();
                        col.delete(`${msg.guild.id}.${msg.author.id}.${module.exports.name}`);
                    });
                });
            });
        })
    }
}