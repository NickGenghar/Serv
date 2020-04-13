const Discord = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const YT = require('simple-youtube-api');

const color = require.main.require('./configurations/color.json');
const key = require.main.require('./configurations/token.json').ytkey;

const youtube = new YT(key);

let play = (msg, song, queue) => {
    const SQ = queue.get(`${msg.guild.id}.music`);

    if(!song) {
        SQ.vChan.leave();
        queue.delete(`${msg.guild.id}.music`);
        return msg.channel.send('Queue finished.');
    }

    let playEmbed = new Discord.MessageEmbed()
    .setColor(color.red)
    .setImage(SQ.songs[0].thumbnail)
    .addField('Now Playing', SQ.songs[0].title);

    msg.channel.send({embed: playEmbed});
    const dispatcher = SQ.connection.play(ytdl(song.url))
    .on('finish', () => {
        if(SQ.loop) {
            let loopable = SQ.songs.shift();
            SQ.songs.push(loopable);
        } else {SQ.songs.shift();}
        play(msg, SQ.songs[0], queue);
    })
    .on('error', (e) => {
        msg.channel.send('Encountered error during playback. Stopping...');
        SQ.vChan.leave();
        queue.delete(`${msg.guild.id}.music`);
        console.log(e);
    });
    dispatcher.setVolumeLogarithmic(1);
};

let vHandler = async (msg, streamData, queue) => {
    const SQ = queue.get(`${msg.guild.id}.music`);

    if(!SQ) {
        const QCon = {
            vChan: msg.member.voice.channel,
            connection: null,
            loop: false,
            songs: [],
            playing: true
        };
        queue.set(`${msg.guild.id}.music`, QCon);

        QCon.songs = QCon.songs.concat(streamData);

        try {
            var connection = await msg.member.voice.channel.join()
            QCon.connection = connection;
            await play(msg, QCon.songs[0], queue);
        } catch(e) {
            queue.delete(`${msg.guild.id}.music`);
            msg.guild.me.voice.channel.leave();
            msg.channel.send('Encountered error during connection.');
            console.log(e);
        }
    } else {
        SQ.songs = SQ.songs.concat(streamData);
        if(Array.isArray(streamData)) return msg.channel.send('Added a playlist to the queue.');

        let playAddEmbed = new Discord.MessageEmbed()
        .setImage(streamData.thumbnail)
        .addField('Added To Queue', streamData.title);
    
        msg.channel.send({embed: playAddEmbed});
    }msg.guild.id
}

module.exports = {
    name: 'play',
    alias: ['play', 'p'],
    desc: 'Play a music into the voice channel.',
    usage: [
        '//play <Link | Search Term>',
        'Link: Link to music.',
        'Search Term: Search term to look for the music.',
        '',
        '//play //playlist <Playlist>',
        'Playlist: Playlist created by the use of //playlist command.'
    ],
    run: async (msg, args, queue) => {
        const prefix = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`)).prefix;
        let pl;
        let init = [{
            name: '',
            data: []
        }]

        try {
            pl = JSON.parse(fs.readFileSync(`./data/playlist/${msg.author.id}.json`));
        } catch(e) {
            pl = init;
            fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(init));
        }
        let SQ = queue.get(`${msg.guild.id}.music`);

        if(SQ && !args[0]) {
            if(SQ.playing) {
                SQ.connection.dispatcher.pause();
                SQ.playing = false;
                return msg.channel.send('The player is now paused.');
            } else {
                SQ.connection.dispatcher.resume();
                SQ.playing = true;
                return msg.channel.send('The player is now resumed.');
            }
        }

        if(!msg.member.voice.channel) return msg.channel.send('You are not in a voice channel.');

        let plName = pl.find(n => n.name == args[1]);
        let plLinks = [];
        if(plName) plLinks = plName.data;
        let ST = args.join(' ').replace(/<(.+)>/g, '$1');
        let streamData = [];

        if(ST.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            msg.channel.send('Processing youtube playlist...');
            const playlist = await youtube.getPlaylist(ST);
            const pl = await playlist.getVideos();
            for(const v of Object.values(pl)) {
                const video = await youtube.getVideoByID(v.id);
                
                let videoThumbnail;
                if(video.thumbnails.hasOwnProperty('maxres')) videoThumbnail = video.thumbnails.maxres.url;
                else if(video.thumbnails.hasOwnProperty('standard')) videoThumbnail = video.thumbnails.standard.url;
                else if(video.thumbnails.hasOwnProperty('high')) videoThumbnail = video.thumbnails.high.url;
                else if(video.thumbnails.hasOwnProperty('medium')) videoThumbnail = video.thumbnails.medium.url;
                else videoThumbnail = video.thumbnails.default.url;

                let load = {
                    id: video.id,
                    title: video.title,
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    thumbnail: videoThumbnail,
                    description: video.description
                }
                streamData.push(load);
            }
            return vHandler(msg, streamData, queue);
        } else {
            if(args[0]!=`${prefix}playlist`) {
                msg.channel.send('Searching...');
                try{
                    var video = await youtube.getVideo(ST);
                    msg.channel.send('Retrieving data from server...');
                } catch(e) {
                    try {
                        var vSearched = await youtube.searchVideos(ST, 1);
                        var video = await youtube.getVideoByID(vSearched[0].id);
                        msg.channel.send('Retrieving data from server...');
                    } catch (e) {
                        return msg.channel.send('Provided search term fails to return any videos.');
                    }
                }

                let videoThumbnail;
                if(video.thumbnails.hasOwnProperty('maxres')) videoThumbnail = video.thumbnails.maxres.url;
                else if(video.thumbnails.hasOwnProperty('standard')) videoThumbnail = video.thumbnails.standard.url;
                else if(video.thumbnails.hasOwnProperty('high')) videoThumbnail = video.thumbnails.high.url;
                else if(video.thumbnails.hasOwnProperty('medium')) videoThumbnail = video.thumbnails.medium.url;
                else videoThumbnail = video.thumbnails.default.url;

                streamData = {
                    id: video.id,
                    title: video.title,
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    thumbnail: videoThumbnail,
                    description: video.description
                }

                return vHandler(msg, streamData, queue);
            } else if(args[0]==`${prefix}playlist` && plName) {
                msg.channel.send('Importing playlist...');
                for(let i = 0; i < plLinks.length; i++) {
                    let video = await ytdl.getInfo(plLinks[i]);
                    let load = {
                        id: video.video_id,
                        title: video.title,
                        url: video.video_url,
                        thumbnail: video.player_response.videoDetails.thumbnail.thumbnails[video.player_response.videoDetails.thumbnail.thumbnails.length - 1].url,
                        description: video.description
                        //There is an issue when using video.thumbnail_url method which causes it to return 'undefined'...
                    }
                    streamData.push(load);
                }
                msg.channel.send('Playlist imported.');
                return vHandler(msg, streamData, queue);
            }
        }
    }
}