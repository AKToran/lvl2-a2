import {Pool} from 'pg';
import config from '../config/env';

const pool = new Pool({
  connectionString: config.connection_string
});

export const initDB = async () =>{
  try {
    await pool.query(`
      
      `)

    console.log("Connected to Database!");
  } catch (error) {
    console.log(error);
  }
}