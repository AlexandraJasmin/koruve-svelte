import express from 'express';
import {
  obtenerAplicantesPorOferta,
  cambiarEstadoAplicacion
} from '../controllers/AplicacionesController.js';

const router = express.Router();

router.get('/ofertas/:id/aplicantes', obtenerAplicantesPorOferta);
router.put('/aplicaciones/:id/estado', cambiarEstadoAplicacion);

export default router;