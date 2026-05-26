import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

import usuariosRoutes from './routes/usuariosRoutes.js';
import empresasRoutes from './routes/empresasRoutes.js';
import authRoutes from './routes/authRoutes.js';

import ofertasRoutes from './routes/OfertasRoutes.js';
import aplicacionesRoutes from './routes/AplicacionesRoutes.js';
import dashboardRoutes from './routes/DashboardRoutes.js';
import foroRoutes from './routes/foroRoutes.js';
import valoracionesRoutes from './routes/valoracionesRoutes.js';

import guardadosRoutes from './routes/GuardadosRoutes.js';
import empresasListadoRoutes from './routes/EmpresasListadoRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Koruve funcionando correctamente'
  });
});

app.get('/api/hola', (req, res) => {
  res.json({
    mensaje: 'Backend funcionando'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      mensaje: 'Conexión exitosa con PostgreSQL',
      fecha: result.rows[0]
    });
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);

    res.status(500).json({
      mensaje: 'Error al conectar con PostgreSQL',
      error: error.message
    });
  }
});

app.get('/api/debug-db', async (req, res) => {
  try {
    const base = await pool.query('SELECT current_database() AS base_actual');
    const schema = await pool.query('SELECT current_schema() AS schema_actual');

    const tablas = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

    res.json({
      db_name_env: process.env.DB_NAME,
      base_actual: base.rows[0].base_actual,
      schema_actual: schema.rows[0].schema_actual,
      tablas: tablas.rows
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error en debug-db',
      error: error.message
    });
  }
});

// Rutas de autenticación y perfiles
app.use('/api', usuariosRoutes);
app.use('/api', empresasRoutes);
app.use('/api', authRoutes);

// Rutas de ofertas, aplicaciones y dashboard
app.use('/api', ofertasRoutes);
app.use('/api', aplicacionesRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', guardadosRoutes);
app.use('/api', empresasListadoRoutes);
app.use('/api', foroRoutes);
app.use('/api', valoracionesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});