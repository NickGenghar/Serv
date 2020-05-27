const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const YT = require('simple-youtube-api');

const color = require.main.require('./configurations/color.json');
const key = require.main.require('./configurations/token.json').ytkey;

const youtube = new YT(key);

module.exports = {
    name: 'playlist',
    alias: ['playlist', 'pl'],
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
    run: async (msg, args, queue) => {
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
                if(args.length <= 1) return msg.channel.send('Please specify a playlist name to create.\n`/playlist create <Playlist Name>`');
                pl.push({
                    name: selection,
                    data: []
                });
                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                return msg.channel.send(`Playlist **${selection}** has been created. Type "playlist add ${selection} <link>" to add your music links to this playlist.`);
            }

            case('list'): {
                if(args.length <= 1) return msg.channel.send('Please specify a playlist name to list.\n`/playlist list <Playlist Name>`');
                if(!queue.get(`${msg.guild.id}.${msg.author.id}`)) {
                    queue.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);
                }

                let static = queue.get(`${msg.guild.id}.${msg.author.id}`);

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
                                queue.delete(`${msg.guild.id}.${msg.author.id}`);
                            });
                        });
                    });
                } else {
                    msg.channel.send(`Playlist **${selection}** doesn't exist.`);
                }
            } break;

            case('add'): {
                if(args.length <= 1) return msg.channel.send('Please specify a playlist name to add.\n`/playlist list <Playlist Name>`');
                else if(args.length <= 2) return msg.channel.send(`Please specify a search query to add into the playlist.\n\`/playlist list ${args[1]} <Query or Link>\``);
                let plLink = pl.find(n => n.name == selection);
                if(!plLink) return msg.channel.send(`Playlist **${selection}** doesn't exist`);
                msg.channel.send('Searching...');
                try{
                    var link = await youtube.getVideo(data);
                    msg.channel.send('Retrieving data from server...');
                } catch(e) {
                    try {
                        var vSearched = await youtube.searchVideos(data, 1);
                        var link = await youtube.getVideoByID(vSearched[0].id);
                        msg.channel.send('Retrieving data from server...');
                    } catch (e) {
                        return msg.channel.send('Provided search term fails to return any videos.');
                    }
                }

                let videoThumbnail;
                let pool = Object.keys(link.thumbnails);
                if(pool.indexOf('maxres') > -1) {videoThumbnail = link.thumbnails.maxres.url}
                else if(pool.indexOf('high') > -1) {videoThumbnail = link.thumbnails.high.url}
                else if(pool.indexOf('medium') > -1) {videoThumbnail = link.thumbnails.medium.url}
                else if(pool.indexOf('standard') > -1) {videoThumbnail = link.thumbnails.standard.url}
                else {videoThumbnail = link.thumbnails.default.url;}
                plLink.data.push({
                    title: link.title,
                    id: link.id,
                    thumbnail: videoThumbnail,
                    url: link.url
                });

                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                return msg.channel.send(`Music **${link.title}** has been added to playlist **${selection}**`);
            }

            case('delete'): {
                if(args.length <= 1) return msg.channel.send('Please specify a playlist name to delete.\n`/playlist delete <Playlist Name>`');
                let plLinkDelete = pl.find(n => n.name == selection);
                let plName = plLinkDelete.name;
                if(!plLinkDelete) return msg.channel.send(`Playlist **${plName}** doesn't exist.`);
                pl.splice(pl.findIndex(key => key.name == selection), 1);
                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                return msg.channel.send(`Playlist ${plName} has been deleted.`);
            }

            default:
        }
    }
}