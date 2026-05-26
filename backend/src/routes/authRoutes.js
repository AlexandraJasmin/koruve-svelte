import express from 'express';
import {
  loginUsuario,
  loginEmpresa
} from '../controllers/authController.js';
import { validarLogin } from '../middlewares/validators.js';

const router = express.Router();

router.post('/iniciar-sesion/usuario', validarLogin, loginUsuario);
router.post('/iniciar-sesion/empresa', validarLogin, loginEmpresa);

export default router;