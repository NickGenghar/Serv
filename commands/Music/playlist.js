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
        'playlist <Option> [Selection] [Data]',
        'Option: Available options: create, add, delete, show',
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
            case('create'):
                pl.push({
                    name: selection,
                    data: []
                });
                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                return msg.channel.send(`Playlist **${selection}** has been created. Type "playlist add ${selection} <link>" to add your music links to this playlist.`);

            case('list'):
                let plInfo = pl.find(n => n.name == selection);
                if(plInfo) {
                    let PlaylistListEmbed = new Discord.MessageEmbed()
                    .setTitle(`${plInfo.name} List`)
                    .setDescription(plInfo.data.join('\n'));

                    return msg.channel.send({embed: PlaylistListEmbed});
                } else {
                    return msg.channel.send(`Playlist **${selection}** doesn't exist.`);
                }

            case('add'):
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

                if(plLink)
                plLink.data.push(link.url);

                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                msg.channel.send(`Music **${link.title}** has been added to playlist **${selection}**`);
            break;

            case('remove'):
                let plLinkData = pl.find(n => n.name == selection);
                let vidNames = [];
                for(let i = 0; i < plLinkData.length; i++)
                vidNames[i] = (await ytdl.getInfo(plLinkData.data[i])).title;
            break;

            case('delete'):
                let plLinkDelete = pl.find(n => n.name == selection);
                let plName = plLinkDelete.name;
                if(plLinkDelete) pl.splice(pl.findIndex(key => key.name == selection), 1);
                fs.writeFileSync(`./data/playlist/${msg.author.id}.json`, JSON.stringify(pl));
                msg.channel.send(`Playlist ${plName} has been deleted.`);
            break;

            default:
        }
    }
}