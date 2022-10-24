 import {connect} from '../database/database';

 export async function getUsers(){
      const conn = await connect();
      const [rows] = await conn.query('SELECT * FROM users');
      return rows;

 }

