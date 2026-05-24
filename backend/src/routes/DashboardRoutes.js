import express from 'express';
import {
  obtenerDashboardEmpresa
} from '../controllers/DashboardController.js';

const router = express.Router();

router.get('/dashboard/empresa/:id', obtenerDashboardEmpresa);

export default router;