import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME
});

pool.connect()
  .then(() => {
    console.log('Conectado a PostgreSQL');
    console.log('Base configurada:', process.env.DB_NAME);
  })
  .catch((error) => {
    console.error('Error al conectar a PostgreSQL:', error);
  });

export default pool;