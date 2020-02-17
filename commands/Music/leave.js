module.exports = {
    name: 'leave',
    alias: ['leave', 't', 'stop'],
    desc: 'Leaves the voice channel',
    usage: ['leave'],
    run: async (msg, args, queue) => {
        let SQ = queue.get(msg.guild.id);
        if(SQ) {
            queue.delete(msg.guild.id);
            msg.channel.send('Queue data has been cleared.');
        }

        if(!msg.guild.me.voice.channel || msg.guild.me.voice.channelID != msg.member.voice.channelID) return;
        msg.guild.me.voice.channel.leave();
        msg.channel.send('Disconnected successfully.');
    }
}