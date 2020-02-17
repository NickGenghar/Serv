const Discord = require('discord.js');
const twitter = require('twitter');
const fs = require('fs');

const dev = require('../../configurations/developer.json');

var key;
try {
    key = require('../../configurations/token.json').twkey;
} catch(e) {
    key = {
        consumer: process.env.consumer,
        consumer_secret: process.env.consumer_secret,
        access_token: process.env.access_token,
        access_token_secret: process.env.access_token_secret
    }
}

module.exports = {
    name: 'twitter',
    alias: ['twitter', 'tweet'],
    desc: 'Stream data from user.',
    usage: [
        '//tweet {User|Search} [Optional User Parameter]',
        '//tweet [Tweet Content]',
        '',
        'User: User to track. Available to all members',
        'Tweet content: Only for Nick Genghar...'
    ],
    run: async (msg, args) => {
        var twitterClient = new twitter({
            consumer_key: key.consumer,
            consumer_secret: key.consumer_secret,
            access_token_key: key.access_token,
            access_token_secret: key.access_token_secret
        });

        if(dev.includes(msg.author.id) && args[0] == 'tweet') {
            args.shift();
            twitterClient.post('statuses/update', {status: args.join(' ')}, (e, t, r) => {
                if(e) return console.log(e);
                fs.writeFileSync('./temp/TweetContent.json', JSON.stringify(t));
                fs.writeFileSync('./temp/TweetResponse.json', JSON.stringify(r));
            });
            return;
        }

        const svr = JSON.parse(fs.readFileSync(`./data/guilds/${msg.guild.id}.json`));
        if(svr.tweetChan == '') return msg.channel.send('Twitter channel not defined. Please set a Twitter channel to retrieve tweet stream with `//setup set tweets <channel>`.');
        if(svr.modRole.length <= 0) return msg.channel.send('No Moderator Role Set.');
        if(!msg.guild.member(msg.author).roles.cache.find(r => svr.modRole.includes(r.id))) return msg.channel.send('You do not have the required moderation role.');

        twitterClient.get('users/search', {
            q: args[0].toString(),
            page: 1,
            count: 1
        }, (e, d, r) => {
            if(e) return console.log(e);
            msg.channel.send(`Streaming Twitter user \`${d[0].screen_name}\`.`);
            twitterClient.stream('statuses/filter', {follow: d[0].id}, stream => {
                stream.on('data', t => {
                    let tweetEmbed = new Discord.MessageEmbed()
                    .setTitle(`New Tweet From ${d[0].screen_name}`)
                    .setAuthor(d[0].screen_name)
                    .setThumbnail(d[0].profile_image_url)
                    .setDescription(t.text)
                    .setFooter(t.created_at);

                    let tweetChannel = msg.guild.channels.cache.find(c => c.id == svr.tweetChan);
                    if(!tweetChannel) return;
                    tweetChannel.send({embed: tweetEmbed});
                })
                stream.on('error', e => {
                    console.log(e);
                    return msg.channel.send('Encountered error during decoding tweet stream.');
                })
                stream.on('end', end => {
                    return msg.channel.send('Stream finished.');
                })
            })
        })
    }
}