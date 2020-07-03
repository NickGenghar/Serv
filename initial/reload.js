const Discord = require('discord.js');
const fs = require('fs');

/**
 * @param {Object} bot The Discord Client object.
 * @returns {void}
 */
module.exports = (bot) => {
    if(typeof bot.timeout === 'object' && bot.timeout.length > 0) bot.timeout.forEach(a => {bot.clearTimeout(a);});
    if(typeof bot.immediate === 'object' && bot.immediate.length > 0) bot.immediate.forEach(a => {bot.clearImmediate(a);});
    if(typeof bot.interval === 'object' && bot.interval.length > 0) bot.interval.forEach(a => {bot.clearInterval(a);});
    bot.timeout = new Object;
    bot.immediate = new Object;
    bot.interval = new Object;

    bot.commands = new Discord.Collection();
    bot.sideload = new Discord.Collection();

    const sideloads = fs.readdirSync('./sideload').filter(file => {if(file.indexOf('.js') > -1) return file;});
    if(sideloads.length <= 0) {
        console.error('\x1b[31m%s\x1b[0m','Required directory is empty! Cannot proceed without any command modules installed. Exiting...');
        return process.exit(-1);
    } else {
        sideloads.forEach(sides => {
            delete require.cache[require.resolve(`../sideload/${sides}`)];
            let pull = require(`../sideload/${sides}`);
            bot.sideload.set(pull.task, pull);
        });
    }

    let componentIssue = [];
    let commandFolder = fs.readdirSync('./commands').filter(folder => {if(folder.indexOf('.') < 0) return folder});
    if(commandFolder.length <= 0) {
        console.error('\x1b[31m%s\x1b[0m','Command modules are empty! Cannot proceed if no commands are present. Exiting...');
        return process.exit(-1);
    } else {
        commandFolder.forEach(subFolder => {
            let commandFiles = fs.readdirSync(`./commands/${subFolder}`).filter(files => {if(files.indexOf('.js') > -1) return files});
            if(commandFiles.length <= 0) {
                console.error('\x1b[33m%s\x1b[0m',`Folder "${subFolder}" is empty. Ignoring...`);
            } else {
                let command = [];
                let index = 0;
                commandFiles.forEach(files => {
                    try {
                        delete require.cache[require.resolve(`../commands/${subFolder}/${files}`)];
                        let pull = require(`../commands/${subFolder}/${files}`);
                        if(pull.name != '' && pull.alias.length >= 1 && typeof pull.run === 'function') {
                            command[index] = {
                                name: pull.name,
                                alias: pull.alias,
                                desc: pull.desc,
                                usage: pull.usage,
                                run: pull.run,
                                type: subFolder
                            }
                            bot.commands.set(command[index].name, command[index++]);
                            console.log('\x1b[36m%s\x1b[0m',`Loaded command [${pull.name}] from "./commands/${subFolder}/${files}"`);
                        } else {
                            componentIssue.push(files);
                            console.log('\x1b[33m%s\x1b[0m',`Command module [${files}] has incomplete parameters. Ignoring...`);
                        }
                    } catch(e) {
                        componentIssue.push(files);
                        console.error('\x1b[31m%s\x1b[0m',e);
                    }
                })
            }
        })
    }

    if(componentIssue.length > 0)
    Promise.reject(`The following modules failed to load:\n${componentIssue.join('\n')}`);
    return;
}