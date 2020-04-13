const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');

const master = require.main.require('./configurations/master.json').developer;

module.exports = {
    name: 'install',
    alias: ['download', 'down', 'install'],
    desc: 'Download and install an attached command module remotely (Only applicable if deployed remotely...)',
    usage: [
        '//download <Pathlike>',
        'Pathlike: Path to folder, will create the folder if it doesn\'t exist.',
        '',
        'Note: Please attach a .js file in order for this command to work'
    ],
    run: async (msg, args) => {
        if(!master.includes(msg.author.id)) return;

        let pathName = args[0].toString().split('/');
        let fileName = pathName.pop();
        let subFolder = pathName.pop();

        if(fileName.indexOf('.js') > -1) {
            pathName.push(subFolder);
            pathName.push(fileName);
            pathName = pathName.join('/');
            try {
                msg.channel.send('Downloading...')
                .then(() => {
                    request(msg.attachments.map(m => m.url)[0]).pipe(fs.createWriteStream(`./temp/${fileName}`));
                    msg.channel.send('Download complete. Initiating installation procedure...')
                    .then(() => {
                        msg.delete().catch(e => console.log(e));
                        fs.rename(`./temp/${fileName}`, `${pathName}`, (e) => {
                            if(e) {
                                fs.mkdir(`./commands/${subFolder}`, (e) => {
                                    if(e) {
                                        msg.channel.send('Encountered error during installation.');
                                        return console.log(e);
                                    }
                                    fs.renameSync(`./temp/${fileName}`, `${pathName}`);
                                });
                            }
                        });
                        msg.channel.send('Installation complete. The module will be ready the next time the bot restarts or a reload command is invoked.');
                    })
                    .catch(e => {
                        msg.channel.send('An error occurred during installation.');
                        console.log(e)
                    });
                })
                .catch(e => {
                    msg.channel.send('Error downloading attachment.');
                    console.log(e)
                });
            } catch(e) {
                msg.delete().catch(e => console.log(e));
                msg.channel.send('Error downloading attachment.');
                console.log(e);
            }
        } else {
            msg.channel.send('Attached file is not a valid \'.js\' file.');
        }
    }
}