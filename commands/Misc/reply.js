module.exports = {
    name: 'reply',
    alias: ['reply', 'say'],
    desc: 'Gives a response to the user.',
    usage: [
        '//reply <Text>',
        '',
        'Text: A random text for Serv to reply to.'
    ],
    run: async (msg, args) => {
        if(!args[0]) {return msg.channel.send('No question given...');} else {
        let replyPool = [
            'Here\'s your item as requested.',
            'I could help you with that.',
            'Might be hard to come by. Just hold on.',
            'Perhaps I can get you a better one.',
            'I don\'t think I can deliver your request.',
            'Why not having a cancer?',
            'No, no I don\'t think I will...',
            'This? Pfft...',
            'I would do it, but with a price',
            'Yes?',
            'Yes.',
            'Perhaps...',
            'Even FBI says no...',
            'That\'s a tough one.',
            'Oh really? I never would have though so.',
            'Instructions unclear. Is it "Destroy Humanity"?',
            'Please ask Nick Genghar for that question. I am not sentient to understant your request.'
        ];
        let reply = replyPool[Math.floor(Math.random() * replyPool.length)];
        return msg.channel.send(`${reply}`);}
    }
}