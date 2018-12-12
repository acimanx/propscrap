const Apify = require('apify');
const sql = require('mysql');

const MYSQL_CREDENTIALS = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
};

const connect = async () => {
    const connection = await mysql.createConnection(MYSQL_CREDENTIALS);
    const queryPromised = await connection.query, { context: connection }
    return await connection.connect, { context: connection }();

}

Apify.main(async () => {
    await connect();

    // get settings from input
    const input = await Apify.getValue('INPUT');

    console.log(input);

    mysqlTable = input.data.table;

    // log statistics when everything is finished
    console.log('Executions total:');
    console.log(totalExecs);
    console.log('Lines total:');
    console.log(totalItems);
});
