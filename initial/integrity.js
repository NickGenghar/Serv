const fs = require('fs');
const defaults = require('../configurations/defaults.json');

//Create directory tree for data storage at first launch from clone.
//Also determine the status of each subfolders.
module.exports = () => {
    fs.access('./data', (e) => {
        if(e) {
            console.log('\x1b[33m%s\x1b[0m','Directory doesn\'t exist. Creating...');
            fs.mkdir('./data', (e) => {
                if(e) return console.log('\x1b[31m%s\x1b[0m\n%s','Encountered error while creating data stores.\nYou might not have the required permission to do so', e);
            });
        }

        fs.readdir('./data', (e,f) => {
            if(e) throw e;
            f = f.filter(v => {return v.indexOf('.') < 0;});
            defaults.datastore.forEach(d => {
                fs.mkdir(`./data/${d}`, e => {
                    if(e) console.log('\x1b[36m%s\x1b[0m',`Directory [${d}] available.`);
                    else console.log('\x1b[33m%s\x1b[0m',`Directory [${d}] doesn\'t exist. Creating...`);
                });
            });
        });
    });
}