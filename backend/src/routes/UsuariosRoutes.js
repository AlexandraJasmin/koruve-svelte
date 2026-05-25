import express from 'express';
import {
  obtenerPerfilUsuario
} from '../controllers/UsuariosController.js';

const router = express.Router();

router.get('/usuarios/:id/perfil', obtenerPerfilUsuario);

export default router;