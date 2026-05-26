import express from 'express';
import {
  crearAplicacion,
  obtenerAplicacionesPorUsuario,
  eliminarAplicacion,
  obtenerAplicantesPorOferta,
  cambiarEstadoAplicacion
} from '../controllers/AplicacionesController.js';

const router = express.Router();

router.post('/aplicaciones', crearAplicacion);

router.get('/usuarios/:id/aplicaciones', obtenerAplicacionesPorUsuario);

router.delete('/aplicaciones/:id', eliminarAplicacion);

router.get('/ofertas/:id/aplicantes', obtenerAplicantesPorOferta);

router.put('/aplicaciones/:id/estado', cambiarEstadoAplicacion);

export default router;