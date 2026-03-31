import { Pool }  from 'pg';
import dotenv from 'dotenv';

dotenv.config();


const pool = new Pool({
  connectionString: process.env.PG_SUPABASE_STRING,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export const connect_db = async () => {
  try {
    await pool.connect();
    console.log('Connected to the database successfully!');
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
};


export const query = (text, params) => pool.query(text, params);