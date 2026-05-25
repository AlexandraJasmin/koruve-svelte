import express from 'express';
import {
  obtenerAplicantesPorOferta,
  obtenerAplicantesPorEmpresa,
  cambiarEstadoAplicacion
} from '../controllers/AplicacionesController.js';

const router = express.Router();

router.get('/ofertas/:id/aplicantes', obtenerAplicantesPorOferta);
router.get('/empresas/:id/aplicantes', obtenerAplicantesPorEmpresa);
router.put('/aplicaciones/:id/estado', cambiarEstadoAplicacion);

export default router;