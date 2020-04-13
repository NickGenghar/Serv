const Discord = require('discord.js');
const Twit = require('twit');
const fs = require('fs');

const master = require.main.require('./configurations/master.json').developer;
const key = require.main.require('./configurations/token.json').twkey;

var twitterClient = new Twit({
    consumer_key: key.consumer,
    consumer_secret: key.consumer_secret,
    access_token: key.access_token,
    access_token_secret: key.access_token_secret
});

module.exports = {
    name: 'twitter',
    alias: ['twitter', 'tweet'],
    desc: 'Stream data from user.',
    usage: [
        '//tweet <Stream> <Follow> <User>',
        '//tweet <Stream> Stop',
        '',
        '//tweet <Search> <User>',
        '',
        '//tweet <Tweet> <Tweet Content>',
        '',
        'User: The user to stream or search.',
        '',
        'Stream: Proceeds with sub options. Only moderators can use this.',
        'Follow: Track the tweet activity of the searched user.',
        'Stop: Stop streaming tweets from Follow.',
        '',
        'Search: Search a Twitter user and retrieve their Twitter profile.',
        '',
        'Tweet and Tweet content: Only for Nick Genghar, not much else to tell you..'
    ],
    run: async (msg, args, queue) => {
        if(master.includes(msg.author.id) && args[0] == 'tweet') {
            args.shift();
            twitterClient.post('statuses/update', {status: args.join(' ')}, (e, t, r) => {
                if(e) return console.log(e);
                fs.writeFileSync('./temp/TweetContent.json', JSON.stringify(t));
                fs.writeFileSync('./temp/TweetResponse.json', JSON.stringify(r));
            });
            return;
        }

        var flag = queue.get(`${msg.guild.id}.twitter`);

        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.tweetChan == '') return msg.channel.send('Twitter channel not defined. Please set a Twitter channel to retrieve tweet stream with `//setup set tweets <channel>`.');
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        let option = args.shift().toLowerCase();

        if(option == 'stream') {
            let mode = args.shift().toLowerCase();
            let choice = args.join(' ');

            if(mode == 'follow') {
                let user = await twitterClient.get('users/search', {
                    q: choice,
                    results_per_page: 1,
                    count: 1
                })

                let stream = twitterClient.stream('statuses/filter', {
                    follow: user.data[0].id
                });

                if(!flag) {
                    queue.set(`${msg.guild.id}.twitter`, stream);
                    flag = queue.get(`${msg.guild.id}.twitter`);
                }

                msg.channel.send(`Streaming Twitter user: \`${user.data[0].screen_name}\``);

                flag.on('tweet', tweet => {
                    let tweetEmbed = new Discord.MessageEmbed()
                    .setTitle(`New Tweet From ${user.data[0].screen_name}`)
                    .setThumbnail(user.data[0].profile_image_url)
                    .setDescription(tweet.text)
                    .setFooter(tweet.created_at);
    
                    if(user.data[0].entities.media) {
                        tweetEmbed.setImage(user.data[0].entities.media[0].media_url);
                    }
    
                    let tweetChannel = msg.guild.channels.cache.find(c => c.id == svr.tweetChan);
                    if(!tweetChannel) return;
                    tweetChannel.send({embed: tweetEmbed});
                });
    
                flag.on('error', e => {
                    console.log(e);
                    return msg.channel.send('Encountered error during decoding tweet stream.');
                })
    
                flag.on('disconnect', () => {
                    return msg.channel.send('Received disconnect call from Twitter. Ending stream...');
                })
            }

            if(mode == 'stop') {
                if(!flag) return;
                flag.stop();
                queue.delete(`${msg.guild.id}.twitter`);
                msg.channel.send('Stopped streaming Twitter user.');
            }
        }

        if(option == 'search') {
            let choice = args.join(' ');

            twitterClient.get('users/search', {
                q: choice,
                results_per_page: 1,
                count: 1
            }, (e, d, r) => {
                if(e) {
                    msg.channel.send('Encountered error while searching the user.');
                    return console.log(e);
                }

                let twitterUserEmbed = new Discord.MessageEmbed()
                .setTitle(`User: ${d[0].screen_name}`)
                .setDescription(d[0].description)
                .setThumbnail(d[0].profile_image_url)
                .setColor(d[0].profile_link_color)
                .addField('Following', d[0].friends_count, true)
                .addField('Followers', d[0].followers_count, true)
                .setFooter(`Joined Twitter since ${d[0].created_at}`);

                msg.channel.send({embed: twitterUserEmbed});
            })
        }
    }
}