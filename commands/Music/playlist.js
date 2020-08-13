const Discord = require('discord.js');
const fs = require('fs');
const YT = require('simple-youtube-api');

const color = require.main.require('./configurations/color.json');
const token = require.main.require('./configurations/token.json');
if(!token.ytkey) {
    return module.exports = {
        name: 'playlist',
        alias: [module.exports.name, 'pl'],
        desc: 'Play a locally stored playlist of yours.',
        usage: ['This module is disabled due to incomplete data.'],
        dev: false,
        mod: false,
        activate: false,
        /**
         * @param {Discord.Message} msg The Discord.Message() object.
         * @param {Array<String>} [args] The argument.
         * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
         */
        run: async (msg, args, col) => {
            return msg.channel.send('Sorry, this module is disabled due to incomplete data. Please contact the developer in regards to this issue.');
        }
    }
}
const youtube = new YT(token.ytkey);

module.exports = {
    name: 'playlist',
    alias: [module.exports.name, 'pl'],
    desc: [
        'Play a locally stored playlist of yours',
        'Limitations:',
        'Only single word playlist name supported.'
    ],
    usage: [
        '//playlist <Option> [Selection] [Data]',
        'Option: Available options: create, add, delete, list',
        'Selection: Playlist name',
        'Data: Link or search term to video.'
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
        let pl;

        try {
            pl = JSON.parse(fs.readFileSync(`./data/playlist/${msg.author.id}.json`));
        } catch(e) {
            pl = [];
        }

        let option = args.shift();
        let selection = args.shift();
        let data = args.join(' ');

        if(!option) {
            let plNames = [];
            for(let i = 0; i < pl.length; i++) {
                if([pl.name != ''])
                plNames.push(pl[i].name);
            }
            let PlaylistEmbed = new Discord.MessageEmbed()
            .setTitle('Playlist')
            .setColor(color.white)
            .setThumbnail(msg.author.displayAvatarURL({size: 2048}))
            .addField('Your Playlists', plNames.length > 0 ? plNames : 'No playlist created.');

            return msg.channel.send({embed: PlaylistEmbed});
        }

        switch(option.toLowerCase()) {
            case('create'): {
                if(!selection) return msg.channel.send('Please specify a playlist name to create.\n`//playlist create <Playlist Name>`');
                pl.push({
                    name: selection,
                    data: []
                });
                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                return msg.channel.send(`Playlist **${selection}** has been created. Type "playlist add ${selection} <link>" to add your music links to this playlist.`);
            }

            case('list'): {
                if(!selection) return msg.channel.send('Please specify a playlist name to list.\n`//playlist list <Playlist Name>`');
                if(!col.get(`${msg.guild.id}.${msg.author.id}`)) {
                    col.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);
                }

                let static = col.get(`${msg.guild.id}.${msg.author.id}`);

                let plInfo = pl.find(n => n.name == selection);
                if(plInfo) {
                    let index = 0;
                    let PlaylistListEmbed = new Discord.MessageEmbed()
                    .setTitle(`${plInfo.name} [${index+1} of ${plInfo.data.length}]`)
                    .setDescription(`[${plInfo.data[index].title}](${plInfo.data[index].url})`)
                    .setImage(plInfo.data[index].thumbnail);

                    let filterReact = (reaction, user) => {
                        return (reaction.emoji.name == '◀' || reaction.emoji.name == '▶' || reaction.emoji.name == '🗑' || reaction.emoji.name == '🔴') && user.id == static;
                    }

                    msg.channel.send({embed: PlaylistListEmbed})
                    .then(m => {
                        m.react('◀')
                        .then(() => {m.react('▶')})
                        .then(() => {m.react('🗑')})
                        .then(() => {m.react('🔴')});

                        let data = m.createReactionCollector(filterReact);
                        data.on('collect', async (react, user) => {
                            let newPlaylistEmbed = new Discord.MessageEmbed(PlaylistListEmbed);

                            switch(react.emoji.name) {
                                case('◀'): {
                                    index--;
                                    if(index < 0) index = 0;
                                    newPlaylistEmbed
                                    .setTitle(`${plInfo.name} [${index+1} of ${plInfo.data.length}]`)
                                    .setDescription(`[${plInfo.data[index].title}](${plInfo.data[index].url})`)
                                    .setImage(plInfo.data[index].thumbnail);
                                } break;
                                case('▶'): {
                                    index++;
                                    if(index >= plInfo.data.length) index = plInfo.data.length - 1;
                                    newPlaylistEmbed
                                    .setTitle(`${plInfo.name} [${index+1} of ${plInfo.data.length}]`)
                                    .setDescription(`[${plInfo.data[index].title}](${plInfo.data[index].url})`)
                                    .setImage(plInfo.data[index].thumbnail);
                                } break;
                                case('🗑'): {
                                    let deleted = plInfo.data.splice(index, 1);
                                    newPlaylistEmbed
                                    .setFooter(`Successfully deleted:\n${deleted[0].title}`, deleted[0].thumbnail);
                                    index = 0;
                                    fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                                } break;
                                case('🔴'): {
                                    return data.stop();
                                } //break;
                                default:
                            }
                            m.edit({embed: newPlaylistEmbed})
                            .then(async () => {
                                const collection = m.reactions.cache.filter(r => r.users.cache.has(static));
                                try {
                                    for(const r of collection.values())
                                    await r.users.remove(static);
                                } catch(e) {
                                    if(e) throw e;
                                }
                            });
                        });
                        data.on('end', () => {
                            let finalEmbed = new Discord.MessageEmbed()
                            .setTitle('Finished.');
                            m.edit({embed: finalEmbed})
                            .then(i => {
                                i.reactions.removeAll()
                                col.delete(`${msg.guild.id}.${msg.author.id}`);
                            });
                        });
                    });
                } else {
                    msg.channel.send(`Playlist **${selection}** doesn't exist.`);
                }
            } break;

            case('add'): {
                if(!selection) return msg.channel.send('Please specify a playlist name to add.\n`//playlist add <Playlist Name> <Query or Link>`');
                if(!option) return msg.channel.send(`Please specify a search query to add into the playlist.\n\`//playlist list ${selection} <Query or Link>\``);
                let plLink = pl.find(n => n.name == selection);
                if(!plLink) return msg.channel.send(`Playlist **${selection}** doesn't exist. Try \`//playlist\` to list down your playlist.`);

                msg.channel.send('Searching...')
                .then(async m => {
                    let previd = [];
                    try{
                        let videoThumbnail;
                        let retrieved = await youtube.getVideo(data);
                        let pool = Object.keys(retrieved.thumbnails);
                        if(pool.indexOf('maxres') > -1) {videoThumbnail = retrieved.thumbnails.maxres.url}
                        else if(pool.indexOf('high') > -1) {videoThumbnail = retrieved.thumbnails.high.url}
                        else if(pool.indexOf('medium') > -1) {videoThumbnai  = retrieved.thumbnails.medium.url}
                        else if(pool.indexOf('standard') > -1) {videoThumbnai  = retrieved.thumbnails.standard.url}
                        else {videoThumbnail = retrieved.thumbnails.default.url;}

                        if(retrieved.description.length > 1000) retrieved.description = retrieved.description.slice(0, 999).concat('...');
                        previd.push({
                            title: retrieved.title,
                            id: retrieved.id,
                            thumbnail: videoThumbnail,
                            url: retrieved.url,
                            description: retrieved.description
                        });
                        m.edit('Retrieving data from server...');
                    } catch(e) {
                        try {
                            let vs = await youtube.searchVideos(data, 20);
                            for(let i = 0; i < vs.length; i++) {
                                let videoThumbnail = [];
                                let retrieved = await youtube.getVideoByID(vs[i].id);
                                let pool = Object.keys(retrieved.thumbnails);
                                if(pool.indexOf('maxres') > -1) {videoThumbnail[i] = retrieved.thumbnails.maxres.url}
                                else if(pool.indexOf('high') > -1) {videoThumbnail[i] = retrieved.thumbnails.high.url}
                                else if(pool.indexOf('medium') > -1) {videoThumbnail[i] = retrieved.thumbnails.medium.url}
                                else if(pool.indexOf('standard') > -1) {videoThumbnail[i] = retrieved.thumbnails.standard.url}
                                else {videoThumbnail[i] = retrieved.thumbnails.default.url;}

                                if(retrieved.description.length > 1000) retrieved.description = retrieved.description.slice(0, 999).concat('...');
                                previd[i] = {
                                    title: retrieved.title,
                                    id: retrieved.id,
                                    thumbnail: videoThumbnail[i],
                                    url: retrieved.url,
                                    description: retrieved.description
                                }
                            }
                            m.edit('Retrieving data from server...');
                        } catch (e) {
                            m.edit('Provided search term fails to return any videos.')
                            .then(() => {throw e;});
                        }
                    }

                    let index = 0;
                    let videoSelectEmbed = new Discord.MessageEmbed()
                    .setTitle(`[${index+1} of ${previd.length}] ${previd[index].title}`)
                    .setDescription(previd[index].description)
                    .setImage(previd[index].thumbnail);

                    m.edit({embed: videoSelectEmbed})
                    .then(() => {
                        if(!col.get(`${msg.guild.id}.${msg.author.id}`))
                            col.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);
                        let static = col.get(`${msg.guild.id}.${msg.author.id}`);
                        let filterReact = (reaction, user) => {
                            return (reaction.emoji.name == '◀' || reaction.emoji.name == '▶' || reaction.emoji.name == '🟢' || reaction.emoji.name == '🔴') && user.id == static;
                        }

                        m.react('◀')
                        .then(() => {m.react('▶')})
                        .then(() => {m.react('🟢')})
                        .then(() => {m.react('🔴')});
                        let data = m.createReactionCollector(filterReact);
                        data.on('collect', (react, user) => {
                            let newVideoSelectEmbed = new Discord.MessageEmbed(videoSelectEmbed);

                            switch(react.emoji.name) {
                                case('◀'): {
                                    index--;
                                    if(index < 0) index = 0;
                                    newVideoSelectEmbed
                                    .setTitle(`[${index+1} of ${previd.length}] ${previd[index].title}`)
                                    .setDescription(previd[index].description)
                                    .setImage(previd[index].thumbnail);
                                } break;
                                case('▶'): {
                                    index++;
                                    if(index >= previd.length) index = previd.length - 1;
                                    newVideoSelectEmbed
                                    .setTitle(`[${index+1} of ${previd.length}] ${previd[index].title}`)
                                    .setDescription(previd[index].description)
                                    .setImage(previd[index].thumbnail);
                                } break;
                                case('🟢'): {
                                    plLink.data.push({
                                        title: previd[index].title,
                                        id: previd[index].id,
                                        thumbnail: previd[index].thumbnail,
                                        url: previd[index].url
                                    });

                                    fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                                    return data.stop();
                                } //break;
                                case('🔴'): {
                                    m.edit('No changes were made.');
                                    return data.stop();
                                } //break;
                            }
                            m.edit({embed: newVideoSelectEmbed})
                            .then(async () => {
                                const collection = m.reactions.cache.filter(r => r.users.cache.has(static));
                                try {
                                    for(const r of collection.values())
                                    await r.users.remove(static);
                                } catch(e) {
                                    if(e) throw e;
                                }
                            });
                        });
                        data.on('end', () => {
                            let finalEmbed = new Discord.MessageEmbed(videoSelectEmbed)
                            .setTitle(`Added to Playlist: ${previd[index].title}`)
                            .setDescription(previd[index].description)
                            .setImage(previd[index].thumbnail)

                            m.edit({embed: finalEmbed})
                            .then(() => {
                                m.reactions.removeAll();
                                col.delete(`${msg.guild.id}.${msg.author.id}`);
                            });
                        });
                    });
                });
            } break;

            case('delete'): {
                if(!selection) return msg.channel.send('Please specify a playlist name to delete.\n`//playlist delete <Playlist Name>`');
                let plLinkDelete = pl.find(n => n.name == selection);
                let plName = plLinkDelete.name;
                if(!plLinkDelete) return msg.channel.send(`Playlist **${plName}** doesn't exist.`);
                pl.splice(pl.findIndex(key => key.name == selection), 1);
                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                return msg.channel.send(`Playlist ${plName} has been deleted.`);
            } break;

            default:
        }
    }
}