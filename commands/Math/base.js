module.exports = {
    name: 'base',
    alias: [module.exports.name],
    desc: 'Convert the base number supplied to a different base',
    usage: [
        '//base <Input Value> <Input Base> <Output Base>',
        'Input Value: The value to convert its base.',
        'Input Base: The base of which the value is originated.',
        'Output Base: The base of which the value is going to be converted.',
        '',
        'Please input the correct Input Base of the Input Value to avoid inaccurate conversion.'
    ],
    dev: false,
    mod: false,
    activate: false,
    /**
     * @param {Discord.Message} msg The Discord.Message() object.
     * @param {Array<String>} [args] The argument.
     * @param {Map<String,any> | Discord.Collection<String|any>} [col] The collector.
     */
    run: async (msg, args, col) => {
        const hex = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
        let numeric = args[0], base = args[1], convert = args[2];
        let div, mul, final = [];

        if(isNaN(numeric)) numeric = numeric.toUpperCase().split('');
        else numeric = numeric.split('');
        for(let i = 0; i < numeric.length; i++)
        for(let j = 0; j < hex.length; j++) {
            if(isNaN(numeric[i]) && numeric[i] == hex[j]) numeric[i] = j;
        }

        let subnum = numeric.indexOf('.');
        if(subnum == -1) {
            div = numeric, mul = 0;
        } else {
            div = numeric.slice(0, subnum);
            numeric.splice(0, subnum-1, '0');
            mul = numeric;
        }

        if(base && base != 0) {
            for(let i = div.length; i > 0; i--) {
                final.push(div[div.length - i] * Math.pow(base, i-1));
            }
            div = eval(final.join('+'));
            final = [];
        } else {
            return msg.channel.send('Failed to identify base.');
        }

        if(convert && convert != 0) {
            while (div > 0) {
                final.unshift(hex[div % convert]);
                div = Math.floor(div / convert);
            }

            if(mul) {
                final.push('.');
                let i = 8;
                while(mul > 0 && i-- != 0) {
                    mul = mul * 2;
                    if(mul - 1 > 0) {
                        final.push(1);
                        mul -= 1;
                    }
                    else final.push(0);
                }
            }
        } else {
            return msg.channel.send('Conversion failed.');
        }

        return msg.channel.send(final.join(''));
    }
}