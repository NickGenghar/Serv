module.exports = {
    name: 'math',
    alias: ['calc', 'math', 'compute'],
    desc: 'Do simple math...',
    usage: [
        '//math <Operant>',
        '//math <Operant with X> <Value of X>',
        '',
        'Operant: Simple arithmetic calculations (1+1, 2*2, 3-3, 4/4)',
        '',
        'Operant with X: Simple arithmetic calculations with X as a variable (1+x, 2*x, 3-x, 4/x)',
        'Value of X: The value of x to be substitute.'
    ],
    accessibleby: 'Members',
    run: async (msg, args) => {
        var compute = (iterator, iteration) => {
            if (iteration.includes('x') && iterator != NaN) {
                iteration = iteration.split('x').join(iterator);
            }
            return iteration;
        }

        var func = args[0];
        var val = args[1];

        if (!func) {
            return msg.channel.send('Function not provided');
        } else if (func.includes('x')) {
            if (val) {
                try {
                    let calc = eval(compute(val, func));
                    return msg.channel.send(`Your result is: ${calc}`);
                } catch (noN) {
                    console.log(`Error: Value ${val} is not a valid number.\n${noN}`);
                    return msg.channel.send(`Error! Value ${val} is not a valid number.`);
                }
            } else {
                return msg.channel.send('No substitute for x specified.');
            }
        } else {
            try {
                if (!isNaN(eval(func))) {
                    return msg.channel.send(`Your result is: ${eval(func)}`);
                }
            } catch (noX) {
                if (noX) {
                    console.log(noX);
                    return msg.channel.send(`Error! Function ${func} has no x to substitude.`);
                }
            }
        }
    }
}