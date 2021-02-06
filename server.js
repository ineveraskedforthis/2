const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

client.query('CREATE TABLE IF NOT EXISTS version (version int)');
let res = client.query('SELECT * FROM version');
if (res.rows.length == 0) {
    client.query('INSERT INTO version (version) VALUES ($1)', [0]);
    return {version: 0};
}

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
