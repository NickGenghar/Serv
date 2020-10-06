const fs = require('fs');
const defaults = require('./configurations/defaults.json').configs;

class Initializer {
    constructor(path, source) {
        this.path = path;
        this.source = source;
    }

    #keyCompare(obj1, obj2) {
        for(let i of Object.keys(obj1)) {
            if(typeof obj2[i] === 'object') this.#keyCompare(obj1[i], obj2[i]);
            if(typeof obj2[i] === 'undefined') return false;
        }
        return true;
    }

    get mainCompare() {
        fs.access(this.path, (e) => {
            if(e) {
                console.log('\x1b[31m%s\x1b[0m',`Encountered error while trying to access [${this.path}]. Assume file not exist...\n${e}`);
                fs.writeFile(this.path, JSON.stringify(this.source, null, '\t'), (e) => {
                    if(e) {
                        console.log('\x1b[31m%s\x1b[0m',`Encountered error while creating [${this.path}].\n${e}`);
                        return process.exit(1);
                    }
                    console.log('\x1b[32m%s\x1b[0m',`Config data [${this.path}] created. Please populate the values in this file with the correct data.`);
                    return process.exit(0);
                })
            }
            fs.readFile(this.path, (e, d) => {
                if(e) {
                    console.log('\x1b[31m%s\x1b[0m',`Encountered error while reading [${this.path}].\n${e}`);
                    return process.exit(1);
                }
                let data = JSON.parse(d.toString());
                if(this.#keyCompare(this.source, data)) {
                    console.log('\x1b[36m%s\x1b[0m',`Config data [${this.path}] okay.`);
                } else {
                    fs.writeFile(this.path, JSON.stringify(this.source, null, '\t'), (e) => {
                        if(e) {
                            console.log('\x1b[31m%s\x1b[0m',`Encountered error while creating [${this.path}].\n${e}`);
                            return process.exit(1);
                        }
                        console.log('\x1b[32m%s\x1b[0m',`Config data [${this.path}] created. Please populate the values in this file with the correct data.`);
                        return process.exit(0);
                    })
                }
            })
        })
    }
}

(() => {
    new Initializer('./configurations/master.json', defaults.master).mainCompare;
    new Initializer('./configurations/token.json', defaults.token).mainCompare;
})();