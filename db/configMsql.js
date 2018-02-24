var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'w15910443208',
    database: 'ele_db',
    insecureAuth: true
});
connection.connect(err => {
    if(err) { 
        throw err;
    }
});
console.log('aaa')

module.exports = connection
