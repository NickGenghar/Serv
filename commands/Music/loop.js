module.exports = {
    name: 'loop',
    alias: ['loop', 'l'],
    desc: 'Loop the playback',
    usage: [
        '//loop ["this"]',
        '',
        '"this": Toggle the option to loop current song.',
        'Without the `this` keyword, the command will toggle between loop all and loop off.'
    ],
    run: async (msg, args , queue) => {
        let SQ = queue.get(`${msg.guild.id}.music`);

        if(!SQ) return;
        if(SQ.loop) {
            SQ.loop = false;
            msg.channel.send('Loop has been disabled.');
        } else {
            if(args[0] && args[0] == 'this') {
                SQ.loop = true;
                SQ.mode = 0;
                msg.channel.send('Current music is now looped.');
            } else {
                SQ.loop = true;
                SQ.mode = 1;
                msg.channel.send('All music is now looped.');
            }
        }
    }
}