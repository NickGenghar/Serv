const mysql = require('mysql');
const cert = {};
if(process.env.sqlu && process.env.sqlu.length > 0 && process.env.sqlp && process.env.sqlp.length > 0) {
    cert['user'] = process.env.sqlu;
    cert['password'] = process.env.sqlp;
}
else return;

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