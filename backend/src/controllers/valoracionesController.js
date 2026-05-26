import {
  obtenerValoracionesModel,
  obtenerValoracionPorIdModel,
  crearValoracionModel,
  obtenerResumenValoracionesModel
} from '../models/valoracionesModel.js';

export const obtenerValoraciones = async (req, res) => {
  try {
    const {
      busqueda,
      calificacion,
      fecha,
      tipo_experiencia,
      orden
    } = req.query;

    const valoraciones = await obtenerValoracionesModel({
      busqueda,
      calificacion,
      fecha,
      tipo_experiencia,
      orden
    });

    res.status(200).json({
      mensaje: 'Valoraciones obtenidas correctamente',
      total: valoraciones.length,
      valoraciones
    });
  } catch (error) {
    console.error('Error al obtener valoraciones:', error);

    res.status(500).json({
      mensaje: 'No se pudieron cargar las valoraciones.',
      error: error.message
    });
  }
};

export const obtenerValoracionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const valoracion = await obtenerValoracionPorIdModel(id);

    if (!valoracion) {
      return res.status(404).json({
        mensaje: 'No se encontró la valoración.'
      });
    }

    res.status(200).json({
      mensaje: 'Valoración obtenida correctamente',
      valoracion
    });
  } catch (error) {
    console.error('Error al obtener valoración:', error);

    res.status(500).json({
      mensaje: 'Error al cargar la valoración.',
      error: error.message
    });
  }
};

export const crearValoracion = async (req, res) => {
  try {
    const {
      id_usuario,
      id_empresa,
      puesto,
      tipo_experiencia,
      calificacion,
      resena
    } = req.body;

    if (
      !id_usuario ||
      !id_empresa ||
      !puesto ||
      !tipo_experiencia ||
      !calificacion ||
      !resena
    ) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    if (!['positiva', 'neutral', 'negativa'].includes(tipo_experiencia)) {
      return res.status(400).json({
        mensaje: 'El tipo de experiencia debe ser positiva, neutral o negativa'
      });
    }

    if (Number(calificacion) < 1 || Number(calificacion) > 5) {
      return res.status(400).json({
        mensaje: 'La calificación debe estar entre 1 y 5'
      });
    }

    const nuevaValoracion = await crearValoracionModel({
      id_usuario,
      id_empresa,
      puesto,
      tipo_experiencia,
      calificacion,
      resena
    });

    res.status(201).json({
      mensaje: 'Valoración creada correctamente',
      valoracion: nuevaValoracion
    });
  } catch (error) {
    console.error('Error al crear valoración:', error);

    res.status(500).json({
      mensaje: 'Error al crear valoración.',
      error: error.message
    });
  }
};

export const obtenerResumenValoraciones = async (req, res) => {
  try {
    const resumen = await obtenerResumenValoracionesModel();

    res.status(200).json({
      mensaje: 'Resumen de valoraciones obtenido correctamente',
      resumen
    });
  } catch (error) {
    console.error('Error al obtener resumen de valoraciones:', error);

    res.status(500).json({
      mensaje: 'Error al cargar resumen de valoraciones.',
      error: error.message
    });
  }
};