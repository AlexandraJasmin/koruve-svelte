import express from 'express';
import { crearEmpresa } from '../controllers/empresasController.js';
import { validarRegistroEmpresa } from '../middlewares/validators.js';

const router = express.Router();

router.post('/empresas', validarRegistroEmpresa, crearEmpresa);

export default router;