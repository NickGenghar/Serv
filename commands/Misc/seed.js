module.exports = {
    name: 'seed',
    alias: ['seed'],
    desc: 'Generates or encode Minecraft seeds',
    usage: [
        '//seed {Generate | Encode} <Input Seed>',
        'Generate (No input): Generates a random numerical seed.',
        'Encode: Encodes a given text into a seed.',
        'Input: Input for Encoding seed.'
    ],
    run: async (msg, args) => {
        switch (args[0]) {
            case 'generate':
                let newSeed = parseInt(Math.random() * Math.pow(10, 16));
                msg.channel.send(`${newSeed}`);
                break;

            case 'encode':
                let n = 0;
                let i = args[1].split('');
                let seedArray = [];
                let seedString = 0;

                while (n < i.length) {
                    seedArray[n] = i[n].charCodeAt(0);

                    seedString += seedArray[n] * Math.pow(31, i.length - 1 - n);

                    if (n == (i.length - 1)) {
                        msg.channel.send(`${seedString}`)
                    }

                    n++;
                }
                break;

            default:
                return msg.channel.send('Please type in an operant before a seed.');
        }
    }
}