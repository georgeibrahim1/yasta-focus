import { Pool } from 'pg';
import env from 'dotenv';

env.config({path: './config.env'})

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});


// only uncomment when in need to not exceed the free tier in supabpase

// pool.connect((err) => {
//   if (err) {
//     console.error('❌ Database connection error:', err.stack);
//     process.exit(1);
//   }
//   console.log('Database connected successfully');
// });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client 💥', err);
  process.exit(-1);
});


export default {
  query: (text, params) => pool.query(text, params),
  pool
};