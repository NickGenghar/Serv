const Discord = require('discord.js');
const archiver = require('archiver');
const fs = require('fs');

const master = require.main.require('./configurations/master.json').developer;

let compress = (msg, args) => {
    let output = fs.createWriteStream(`./data/${args[1]}.zip`);
    let archive = archiver('zip');

    archive.pipe(output);
    archive.directory(`${args[0]}`, false);
    archive.finalize();

    archive.on('error', e => {
        firstRes.edit('Encountered error during compression.');
        console.log(e);
    })

    output.on('close', () => {
        msg.channel.send('Content compressed.')
        .then(() => {
            const ex = new Discord.MessageAttachment(`./data/${args[1]}.zip`);
            msg.channel.send(ex)
            .then(() => {
                fs.unlinkSync(`./data/${args[1]}.zip`);
            })
            .catch(e => {
                msg.channel.send('Failed to upload file.');
                console.log(e);
            });
        })
        .catch(e => console.log(e));
    });
}

module.exports = {
    name: 'export',
    alias: ['export', 'ex'],
    desc: 'Export the bot source from remote for maintenance, updating and archiving.',
    usage: [
        '//export <Origin> <File Name>',
        'Origin: The folder to compress. Also works on root directory \'./\'',
        'File Name: The name of the zipped file.'
    ],
    run: async (msg, args) => {
        if(!master.includes(msg.author.id)) return;
        if(args.length < 2) return msg.client.commands.find(v => v.name == 'help').run(msg, ['export']);
        msg.delete().catch(e => console.log(e));

        msg.channel.send('Preparing content for exporting.')
        .then(m => {
            compress(m, args);
        });
    }
}