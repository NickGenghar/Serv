module.exports = {
    name: 'loop',
    alias: ['loop', 'l'],
    desc: 'Loop the playback',
    usage: ['//loop'],
    run: async (msg, args , queue) => {
        let SQ = queue.get(msg.guild.id);

        if(!SQ) return;
        if(SQ.loop) {
            SQ.loop = false;
            msg.channel.send('Loop disabled.');
        } else {
            SQ.loop = true;
            msg.channel.send('Loop enabled.');
        }
    }
}