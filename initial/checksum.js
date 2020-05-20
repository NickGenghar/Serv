const fs = require('fs');
const defaults = require('../configurations/defaults.json');

/**
 * @param {Object} bot The Discord Client object.
 */
module.exports = (bot) => {
    const guilds = bot.guilds.cache.array().map(i => i.id);
    const available = fs.readdirSync('./data/guilds');
    guilds.forEach(a => {
        if(!available.includes(`${a}.json`)) {
            console.log('\x1b[36m%s\x1b[0m',`Creating default server data for the server [${a}].`);
            fs.writeFile(`./data/guilds/${a}.json`, JSON.stringify(defaults.server_config), (e) => {if(e) throw e;});
        } else {
            console.log('\x1b[36m%s\x1b[0m',`Server data for the server [${a}] available.`);
        }
    });
}