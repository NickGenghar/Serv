module.exports = {
    name: 'skip',
    alias: ['skip', 's'],
    desc: 'skips the currently playing music',
    usage: ['//skip'],
    run: async (msg, args, queue) => {
        let SQ = queue.get(`${msg.guild.id}.music`);
        if(!SQ) return;
        msg.channel.send(`Skipped the song: **${SQ.songs[0].title}**`);
        SQ.connection.dispatcher.end();
    }
}