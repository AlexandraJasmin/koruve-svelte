import express from 'express';
import {
  guardarEmpleo,
  obtenerGuardadosPorUsuario,
  verificarEmpleoGuardado,
  eliminarGuardado,
  eliminarGuardadoPorUsuarioYOferta
} from '../controllers/GuardadosController.js';

const router = express.Router();

router.post('/guardados', guardarEmpleo);

router.get('/usuarios/:id/guardados', obtenerGuardadosPorUsuario);

router.get('/usuarios/:idUsuario/guardados/:idOferta', verificarEmpleoGuardado);

router.delete('/guardados/:id', eliminarGuardado);

router.delete('/usuarios/:idUsuario/guardados/:idOferta', eliminarGuardadoPorUsuarioYOferta);

export default router;