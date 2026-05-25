import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

import ofertasRoutes from './routes/OfertasRoutes.js';
import aplicacionesRoutes from './routes/AplicacionesRoutes.js';
import dashboardRoutes from './routes/DashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', ofertasRoutes);
app.use('/api', aplicacionesRoutes);
app.use('/api', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('API de Koruve funcionando correctamente');
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
      mensaje: 'Conexión exitosa a PostgreSQL',
      fecha: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

app.get('/api/debug-db', async (req, res) => {
  try {
    const base = await pool.query('SELECT current_database() AS base_actual');
    const totalOfertas = await pool.query('SELECT COUNT(*) AS total FROM ofertas');
    const ofertasActivas = await pool.query("SELECT COUNT(*) AS total FROM ofertas WHERE estado = 'activa'");
    const primerasOfertas = await pool.query(`
      SELECT id_oferta, titulo, estado, ubicacion
      FROM ofertas
      ORDER BY id_oferta
      LIMIT 5
    `);

    res.json({
      base_actual: base.rows[0].base_actual,
      total_ofertas: Number(totalOfertas.rows[0].total),
      ofertas_activas: Number(ofertasActivas.rows[0].total),
      primeras_ofertas: primerasOfertas.rows
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error en debug-db',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});