import express from 'express';
import {
  obtenerEmpresas,
  filtrarEmpresas,
  obtenerEmpresaPorId,
  obtenerDetalleEmpresa
} from '../controllers/EmpresasListadoController.js';

const router = express.Router();

router.get('/empresas/listado', obtenerEmpresas);
router.get('/empresas/listado/filtrar', filtrarEmpresas);
router.get('/empresas/listado/:id/detalle', obtenerDetalleEmpresa);
router.get('/empresas/listado/:id', obtenerEmpresaPorId);

export default router;