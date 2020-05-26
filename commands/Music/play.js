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
    SQ.conn.play(ytdl(song.url))
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
    } else if(!SQ && args[0] != `${prefix}playlist`) {
        msg.channel.send('Searching...')
        .then(async m => {
            let video;
            try {
                video = await youtube.getVideo(search);
                m.edit('Retrieving data from server...');
            } catch(e) {
                try {
                    let vs = await youtube.searchVideos(search, 1);
                    video = await youtube.getVideoByID(vs[0].id);
                    m.edit('Retrieving data from server...');
                } catch(e) {
                    m.edit('Provided search query failed to return any result.')
                    .then(() => {throw e;});
                }
            }

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

            if(SQ) {
                m.edit(`Added the following music to queue:\n${stream.keys()}`);
            }
            return handler(msg, stream, queue);
        });
    } else if(!SQ && args[0] == `${prefix}playlist` && args.length > 1) {
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
    } else if(!SQ && args[0] == `${prefix}playlist` && args.length <= 1) {
        return msg.channel.send('No playlist name inputted.');
    } else {
        return msg.channel.send('No search query inputted.');
    }
}

module.exports = O;