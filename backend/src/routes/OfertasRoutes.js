import express from 'express';
import {
  crearOferta,
  obtenerOfertasPorEmpresa,
  cambiarEstadoOferta,
  obtenerDetalleOferta
} from '../controllers/OfertasController.js';

const router = express.Router();

router.post('/ofertas', crearOferta);
router.get('/empresas/:id/ofertas', obtenerOfertasPorEmpresa);
router.get('/ofertas/:id', obtenerDetalleOferta);
router.put('/ofertas/:id/estado', cambiarEstadoOferta);

export default router;