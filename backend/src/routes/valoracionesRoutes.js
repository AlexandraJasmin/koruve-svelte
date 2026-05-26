import express from 'express';

import {
  obtenerValoraciones,
  obtenerValoracionPorId,
  crearValoracion,
  obtenerResumenValoraciones
} from '../controllers/valoracionesController.js';

const router = express.Router();

router.get('/valoraciones', obtenerValoraciones);
router.get('/valoraciones/resumen', obtenerResumenValoraciones);
router.get('/valoraciones/:id', obtenerValoracionPorId);
router.post('/valoraciones', crearValoracion);

export default router;