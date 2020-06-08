const fs = require('fs');
const defaults = require.main.require('./configurations/defaults.json');
const remove = require.main.require('./functions/removeArray.js');

module.exports = () => {
    let checks = fs.readdirSync('./data/guilds', {encoding: 'utf8'});
    let keyCheck = Object.keys(defaults.server_config);

    checks.forEach(i => {
        let data;
        try {
            data = JSON.parse(fs.readFileSync(`./data/guilds/${i}`));
        } catch(e) {
            if(e) {
                console.log('\x1b[31m%s\x1b[0m',`Guild data [${i}] faulty. Reverting to default configurations.`);
                fs.writeFileSync(`./data/guilds/${i}`, JSON.stringify(defaults.server_config));
            }
            return;
        }

        let key1 = Object.keys(data);
        let test = remove(keyCheck, key1);

        if(test.length > 0) {
            for(const v of test)
            data[v] = defaults.server_config[v];
            fs.writeFileSync(`./data/guilds/${i}`, JSON.stringify(data));
            console.log('\x1b[33m%s\x1b[0m',`Guild data [${i}] corrected.`);
        } else {
            console.log('\x1b[36m%s\x1b[0m',`Guild data [${i}] okay.`)
        }
    });
}