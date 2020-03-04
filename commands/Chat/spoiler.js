module.exports = {
    name: 'spoiler',
    alias: ['spoiler', 'hide', 'redacted'],
    desc: 'Generates a spoiler based on input.',
    usage: [
        '//spoiler <text> [mode]',
        'text: Text to make a spoiler.',
        'mode: Simple or Full,',
        'Simple = full text being set to spoiler,',
        'Full = every letter has a spoiler.',
        '',
        'This command is effective if the input does not have any spoiler tags.'
    ],
    run: async (msg, args) => {
        if (args.length > 1) {
            let Mode = args.pop();
            let simple = ['s', 'simple'];
            let full = ['f', 'full'];

            if (simple.includes(Mode.toLowerCase())) {
                var word = args.join('|| ||');
            } else if (full.includes(Mode.toLowerCase())) {
                var word = [...`${args}`].join('').split('').join('||||').split(',').join(' ');
            } else {
                var word = `${args.join('|| ||')}|| ||${Mode}`;
            }

            msg.delete().catch(e => console.log(e));
            return msg.channel.send(`||${word}||`);
        } else if (args.length == 1) {
            word = args;
            msg.delete().catch(e => console.log(e));
            return msg.channel.send(`||${word}||`);
        } else {
            return msg.channel.send(`Not much stuff to spoil apparently...`);
        }
    }
}