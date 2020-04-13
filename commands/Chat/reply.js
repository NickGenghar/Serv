const replyPool = require.main.require('./configurations/defaults.json').replyPool;

module.exports = {
    name: 'reply',
    alias: ['reply'],
    desc: 'Gives a response to the user.',
    usage: [
        '//reply <Text>',
        '',
        'Text: A random text for Serv to reply to.'
    ],
    run: async (msg, args) => {
        if(!args[0]) {return msg.channel.send('No question given...');} else {
            let reply = replyPool[Math.floor(Math.random() * replyPool.length)];
        return msg.channel.send(`${reply}`);}
    }
}