import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

import ofertasRoutes from './routes/OfertasRoutes.js';
import aplicacionesRoutes from './routes/AplicacionesRoutes.js';
import dashboardRoutes from './routes/DashboardRoutes.js';
import usuariosRoutes from './routes/UsuariosRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', ofertasRoutes);
app.use('/api', aplicacionesRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', usuariosRoutes);

app.get('/', (req, res) => {
  res.send('API de Koruve funcionando correctamente');
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});