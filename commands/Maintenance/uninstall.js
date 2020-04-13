const fs = require('fs');

const master = require.main.require('./configurations/master.json').developer;

module.exports = {
    name: 'uninstall',
    alias: ['uninstall', 'remove'],
    desc: 'Uninstall a command module from the bot.',
    usage: [
        '//uninstall <Module Path>',
        'Module Path: Required, the module name to be uninstalled.',
        '',
        'Careful using this command as it can uninstall any command modules, including this one!'
    ],
    run: async (msg, args) => {
        if(!master.includes(msg.author.id)) return;
        let pathLike = args[0].split('/');
        let fileName = pathLike.pop();
        let subFolder = pathLike.pop();

        pathLike.push(subFolder);
        pathLike.push(fileName);
        pathLike = pathLike.join('/');

        if(fileName.indexOf('.js') > -1) {
            fs.unlink(pathLike, (e) => {
                if(e) {
                    msg.channel.send('Encountered error during uninstalling.');
                    return console.log(e);
                } else {
                    fs.rmdir(`./commands/${subFolder}`, () => {});
                    msg.channel.send(`Module ${pathLike} has been uninstalled. Please wait for the bot to reload or invoke the reload command to remove the command from the bot's memory.`);
                }
            })
        }
    }
}