const fs = require('fs');

//Clear temp folder at startup
module.exports = () => {
    fs.access('./temp', (e) => {
        if(e) {
            fs.mkdir('./temp', (e) => {
                if(e) throw e;
            });
        } else {
            fs.readdir('./temp', (e, f) => {
                if(e) throw e;
                let files = f.filter(e => {if(e.indexOf('.') > -1) return e});
                files.forEach(g => {
                    fs.unlink(`./temp/${g}`, e => {
                        if(e) throw e;
                    });
                });
            });
        }
    });
}