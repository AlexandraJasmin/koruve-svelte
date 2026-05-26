import express from 'express';
import {
  obtenerDashboardEmpresa,
  obtenerDashboardUsuario
} from '../controllers/DashboardController.js';

const router = express.Router();

router.get('/dashboard/empresa/:id', obtenerDashboardEmpresa);
router.get('/dashboard/usuario/:id', obtenerDashboardUsuario);

export default router;