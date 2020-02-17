module.exports = {
    name: 'invert',
    alias: ['invert', 'mirror', 'in'],
    desc: 'Invert your text.',
    usage: 'invert <Input>\nInput: The input text you want to invert',
    access: 'Member',
    run: async (msg, args) => {
        msg.delete().catch(e => console.log(e));
        let straigh = args.join(' ').split('');
        let inverted = [];
        let i = straigh.length, j = 0;

        while(i--) {
            inverted[j++] = straigh[i];
        }

        msg.channel.send(inverted.join(''));
    }
}