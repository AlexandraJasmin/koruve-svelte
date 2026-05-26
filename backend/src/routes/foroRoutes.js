import express from 'express';

import {
  obtenerPublicaciones,
  obtenerPublicacionPorId,
  crearPublicacion,
  crearComentario
} from '../controllers/foroController.js';

const router = express.Router();

router.get('/foro/publicaciones', obtenerPublicaciones);
router.get('/foro/publicaciones/:id', obtenerPublicacionPorId);
router.post('/foro/publicaciones', crearPublicacion);
router.post('/foro/publicaciones/:id/comentarios', crearComentario);

export default router;