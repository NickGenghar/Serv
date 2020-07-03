const Discord = require('discord.js');
const fs = require('fs');

/**
 * 
 * @param {Discord.Client} bot The Discord.Client object.
 * @returns {void}
 */
module.exports = (bot) => {
    bot.events = new Discord.Collection();

    let eventIssue = [];
    const eventFolder = fs.readdirSync('./events').filter(folder => {if(folder.indexOf('.') < 0) return folder});
    if(eventFolder.length <= 0) {
        console.error('\x1b[31m%s\x1b[0m','Required directory is empty! Cannot proceed without any event modules installed. Exiting...');
        return process.exit(-1);
    } else {
        eventFolder.forEach(subFolder => {
            let eventfiles = fs.readdirSync(`./events/${subFolder}`).filter(files => {if(files.indexOf('.js') > -1) return files});
            if(eventfiles.length <= 0) {
                console.error('\x1b[33m%s\x1b[0m',`Folder "${subFolder}" is empty. Ignoring...`);
            } else {
                eventfiles.forEach(files => {
                    try {
                        delete require.cache[require.resolve(`../events/${subFolder}/${files}`)];
                        let pull = require(`../events/${subFolder}/${files}`);
                        if(pull.event && pull.event != '' && typeof pull.run === 'function') {
                            bot.events.set(pull.event, pull);
                            console.log('\x1b[36m%s\x1b[0m',`Loaded event module [${pull.event}] from "./events/${subFolder}/${files}"`);
                        } else {
                            eventIssue.push(files);
                            console.log('\x1b[31m%s\x1b[0m',`Event module [${files}] has incomplete parameters. Ignoring this error may result in fatal crash.`);
                        }
                    } catch(e) {
                        componentIssue.push(files);
                        console.error('\x1b[31m%s\x1b[0m',e);
                    }
                });
            }
        });
    }

    if(eventIssue.length > 0)
    Promise.reject(`The following event modules failed to load:\n${eventIssue.join('\n')}\nWARNING! Ignoring this error may result in fatal crash.`);
    return;
}