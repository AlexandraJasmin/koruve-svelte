import express from 'express';
import { crearUsuario } from '../controllers/usuariosController.js';
import { validarRegistroUsuario } from '../middlewares/validators.js';

const router = express.Router();

router.post('/usuarios', validarRegistroUsuario, crearUsuario);

export default router;