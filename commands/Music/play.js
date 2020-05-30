const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const YouTube = require('simple-youtube-api');

const color = require.main.require('./configurations/color.json');
const token = require.main.require('./configurations/token.json').ytkey;

const youtube = new YouTube(token);

/**
 * 
 * @param {any} msg The Discord.Message object.
 * @param {any} song The stream data.
 * @param {Map} queue The queue Map.
 */
let player = (msg, song, queue) => {
    const SQ = queue.get(`${msg.guild.id}.music`);
    
    if(!song) {
        SQ.chan.leave();
        queue.delete(`${msg.guild.id}.music`);
        return msg.channel.send('Queue finished.');
    }

    let playEmbed = new Discord.MessageEmbed()
    .setColor(color.red)
    .setImage(SQ.list[0].thumbnail)
    .setTitle('Now Playing')
    .setDescription(SQ.list[0].title);

    msg.channel.send({embed: playEmbed});
    let stream = ytdl(song.url);
    SQ.conn.play(stream)
    .on('finish', () => {
        let loopable = SQ.list.shift();

        if(SQ.loop) {
            if(SQ.mode == 0) {
                SQ.list.unshift(loopable);
            } else {
                SQ.list.push(loopable)
            }
        }
        player(msg, SQ.list[0], queue);
    })
    .on('error', (e) => {
        SQ.chan.leave();
        queue.delete(`${msg.guild.id}.music`);
        msg.channel.send('Encountered error during playback. Stopping...')
        .then(() => {
            throw e;
        });
    })
    .setVolumeLogarithmic(1);
}

/**
 * 
 * @param {any} msg The Discord.Message object.
 * @param {Array<String>} stream A collection of links.
 * @param {Map} queue The queue Map.
 */
let handler = async (msg, stream, queue) => {
    let SQ = queue.get(`${msg.guild.id}.music`);

    if(!SQ) {
        let Q = {
            chan: msg.member.voice.channel,
            conn: null,
            loop: false,
            mode: 0,
            list: [],
            play: true
        }
        queue.set(`${msg.guild.id}.music`, Q);

        Q.list = Q.list.concat(stream);

        try {
            let conn = await msg.member.voice.channel.join();
            Q.conn = conn;
            await player(msg, Q.list[0], queue);
        } catch(e) {
            msg.channel.send('Encountered error during connection.')
            .then(() => {throw e;});
        }
    } else {
        SQ.list = SQ.list.concat(stream);
    }
}

O = new Object;

O.name = 'play';
O.alias = ['play', 'p'];
O.desc = 'Play music with the bot.';
O.usage = [
    '//play {Query|Link}',
    '',
    'Query: Search query to a YouTube video.',
    'Link: Link to a YouTube video.'
];
O.run = async (msg, args, queue) => {
    if(!msg.member.voice.channel) return msg.channel.send('You are not connected to a voice channel. Please connect to a voice channel first before proceeding.');
    const prefix = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`)).prefix;
    let SQ = queue.get(`${msg.guild.id}.music`);
    if(SQ && !args[0]) {
        if(SQ.play) {
            msg.channel.send('The player is now paused.');
            SQ.conn.dispatcher.pause();
            SQ.play = false;
        } else {
            msg.channel.send('The player is now unpaused.');
            SQ.conn.dispatcher.resume();
            SQ.play = true;
        }
        return;
    } else if(!SQ && !args[0]) {
        return msg.channel.send('No search query inputted.');
    }

    let stream = [];
    let search = args.join(' ').replace(/<(.+)>/g, '$1');
    if(search.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        msg.channel.send('Processing playlist...')
        .then(async m => {
            const playlist = await youtube.getPlaylist(search);
            const pl = await playlist.getVideos();
            for(const v of Object.values(pl)) {
                const video = await youtube.getVideoByID(v.id);

                let videoThumbnail;
                let pool = Object.keys(video.thumbnails);
                if(pool.indexOf('maxres') > -1) {videoThumbnail = video.thumbnails.maxres.url}
                else if(pool.indexOf('high') > -1) {videoThumbnail = video.thumbnails.high.url}
                else if(pool.indexOf('medium') > -1) {videoThumbnail = video.thumbnails.medium.url}
                else if(pool.indexOf('standard') > -1) {videoThumbnail = video.thumbnails.standard.url}
                else {videoThumbnail = video.thumbnails.default.url;}
                let load = {
                    title: video.title,
                    id: video.id,
                    url: video.url,
                    thumbnail: videoThumbnail,
                    description: video.description
                }

                stream.push(load);
            };
            m.edit('Playlist imported...');
            return handler(msg, stream, queue);
        });
    } else {
        if(args[0] != `${prefix}playlist`) {
            msg.channel.send('Searching...')
            .then(async m => {
                var previd = [];
                try {
                    let videoThumbnail;
                    let retrieved = await youtube.getVideo(search);
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
                        url: retrieved.url,
                        thumbnail: videoThumbnail,
                        description: retrieved.description
                    });
                    m.edit('Retrieving data from server...');
                } catch(e) {
                    try {
                        let vs = await youtube.searchVideos(search, 20);
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
                                url: retrieved.url,
                                thumbnail: videoThumbnail[i],
                                description: retrieved.description
                            }
                        }
                        m.edit('Retrieving data from server...');
                    } catch(e) {
                        m.edit('Provided search query failed to return any result.')
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
                    if(!queue.get(`${msg.guild.id}.${msg.author.id}`))
                        queue.set(`${msg.guild.id}.${msg.author.id}`, msg.author.id);
                    let static = queue.get(`${msg.guild.id}.${msg.author.id}`);
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
                                stream.push(previd[index]);
                                handler(msg, stream, queue);
                                return data.stop();
                            } //break;
                            case('🔴'): {
                                m.edit('No selection were made.');
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
                        .setDescription(previd[index].description)
                        .setImage(previd[index].thumbnail);

                        if(SQ) {
                            finalEmbed.setTitle(`Added: ${previd[index].title}`)
                        } else {
                            finalEmbed.setTitle(`Selected: ${previd[index].title}`)
                        }
                        m.edit({embed: finalEmbed})
                        .then(() => {
                            m.reactions.removeAll();
                            queue.delete(`${msg.guild.id}.${msg.author.id}`);
                        });
                    });
                });
            });
        } else if(args[0] == `${prefix}playlist`) {
            if(args.length <= 1) return msg.channel.send('No playlist name inputted.');
            args.shift();
            msg.channel.send('Processing localized playlist...')
            .then(async m => {
                const playlist = JSON.parse(fs.readFileSync(`./data/playlist/${msg.author.id}.json`)).find(e => e.name == args.join(' ')).data;
                if(!playlist) return msg.channel.send('Given playlist name does not exist.');
                for(const v of Object.values(playlist)) {
                    const video = await youtube.getVideoByID(v.id);

                    let load = {
                        title: v.title,
                        id: v.id,
                        url: v.url,
                        thumbnail: v.thumbnail,
                        description: video.description
                    }

                    stream.push(load);
                };
                m.edit('Playlist imported...');
                return handler(msg, stream, queue);
            });
        }
    }
}

module.exports = O;
