import {
  obtenerPublicacionesModel,
  obtenerPublicacionPorIdModel,
  crearPublicacionModel,
  obtenerComentariosPorPublicacionModel,
  crearComentarioModel
} from '../models/foroModel.js';

export const obtenerPublicaciones = async (req, res) => {
  try {
    const { busqueda, tipo } = req.query;

    const publicaciones = await obtenerPublicacionesModel({
      busqueda,
      tipo
    });

    res.status(200).json({
      mensaje: 'Publicaciones obtenidas correctamente',
      publicaciones
    });
  } catch (error) {
    console.error('Error al obtener publicaciones del foro:', error);

    res.status(500).json({
      mensaje: 'Error al cargar publicaciones.',
      error: error.message
    });
  }
};

export const obtenerPublicacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const publicacion = await obtenerPublicacionPorIdModel(id);

    if (!publicacion) {
      return res.status(404).json({
        mensaje: 'No se encontró la publicación.'
      });
    }

    const comentarios = await obtenerComentariosPorPublicacionModel(id);

    res.status(200).json({
      mensaje: 'Publicación obtenida correctamente',
      publicacion,
      comentarios
    });
  } catch (error) {
    console.error('Error al obtener detalle de publicación:', error);

    res.status(500).json({
      mensaje: 'Error al cargar la publicación.',
      error: error.message
    });
  }
};

export const crearPublicacion = async (req, res) => {
  try {
    const {
      titulo,
      contenido,
      tipo,
      imagen_url,
      autor_tipo,
      id_usuario,
      id_empresa
    } = req.body;

    if (!titulo || !contenido || !tipo || !autor_tipo) {
      return res.status(400).json({
        mensaje: 'Título, contenido, tipo y autor_tipo son obligatorios'
      });
    }

    if (!['pregunta', 'debate', 'tutorial'].includes(tipo)) {
      return res.status(400).json({
        mensaje: 'El tipo debe ser pregunta, debate o tutorial'
      });
    }

    if (!['usuario', 'empresa'].includes(autor_tipo)) {
      return res.status(400).json({
        mensaje: 'El autor_tipo debe ser usuario o empresa'
      });
    }

    if (autor_tipo === 'usuario' && !id_usuario) {
      return res.status(400).json({
        mensaje: 'Para autor usuario debes enviar id_usuario'
      });
    }

    if (autor_tipo === 'empresa' && !id_empresa) {
      return res.status(400).json({
        mensaje: 'Para autor empresa debes enviar id_empresa'
      });
    }

    const nuevaPublicacion = await crearPublicacionModel({
      titulo,
      contenido,
      tipo,
      imagen_url,
      autor_tipo,
      id_usuario: autor_tipo === 'usuario' ? id_usuario : null,
      id_empresa: autor_tipo === 'empresa' ? id_empresa : null
    });

    res.status(201).json({
      mensaje: 'Publicación creada correctamente',
      publicacion: nuevaPublicacion
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);

    res.status(500).json({
      mensaje: 'Error al crear publicación.',
      error: error.message
    });
  }
};

export const crearComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      comentario,
      autor_tipo,
      id_usuario,
      id_empresa
    } = req.body;

    if (!comentario || !autor_tipo) {
      return res.status(400).json({
        mensaje: 'Comentario y autor_tipo son obligatorios'
      });
    }

    if (!['usuario', 'empresa'].includes(autor_tipo)) {
      return res.status(400).json({
        mensaje: 'El autor_tipo debe ser usuario o empresa'
      });
    }

    if (autor_tipo === 'usuario' && !id_usuario) {
      return res.status(400).json({
        mensaje: 'Para autor usuario debes enviar id_usuario'
      });
    }

    if (autor_tipo === 'empresa' && !id_empresa) {
      return res.status(400).json({
        mensaje: 'Para autor empresa debes enviar id_empresa'
      });
    }

    const publicacion = await obtenerPublicacionPorIdModel(id);

    if (!publicacion) {
      return res.status(404).json({
        mensaje: 'No se encontró la publicación.'
      });
    }

    const nuevoComentario = await crearComentarioModel({
      id_publicacion: id,
      comentario,
      autor_tipo,
      id_usuario: autor_tipo === 'usuario' ? id_usuario : null,
      id_empresa: autor_tipo === 'empresa' ? id_empresa : null
    });

    res.status(201).json({
      mensaje: 'Comentario agregado correctamente',
      comentario: nuevoComentario
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);

    res.status(500).json({
      mensaje: 'Error al crear comentario.',
      error: error.message
    });
  }
};