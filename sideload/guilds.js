const mysql = require('mysql');
const cert = require.main.require('./configurations/token.json').mysql;

const db = mysql.createConnection({
    host: 'localhost',
    user: cert.user,
    password: cert.password
});

module.exports = {
    task: 'guilds',
    run: data => {
        db.connect();
        return new String('data');
    }
}