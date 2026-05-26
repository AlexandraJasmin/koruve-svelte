import { pool } from '../config/db.js';

export const crearAplicacion = async (req, res) => {
  try {
    const { id_usuario, id_oferta } = req.body;

    if (!id_usuario || !id_oferta) {
      return res.status(400).json({
        mensaje: 'El id_usuario y el id_oferta son obligatorios'
      });
    }

    const oferta = await pool.query(
      `SELECT id_oferta, estado
       FROM ofertas
       WHERE id_oferta = $1`,
      [id_oferta]
    );

    if (oferta.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'La oferta no existe'
      });
    }

    if (oferta.rows[0].estado !== 'activa') {
      return res.status(400).json({
        mensaje: 'No puedes aplicar a una oferta que no está activa'
      });
    }

    const result = await pool.query(
      `INSERT INTO aplicaciones (
        id_usuario,
        id_oferta,
        estado
      )
      VALUES ($1, $2, 'pendiente')
      RETURNING *`,
      [id_usuario, id_oferta]
    );

    res.status(201).json({
      mensaje: 'Solicitud enviada correctamente',
      aplicacion: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Ya aplicaste a esta oferta'
      });
    }

    res.status(500).json({
      mensaje: 'Error al crear la aplicación',
      error: error.message
    });
  }
};

export const obtenerAplicacionesPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        a.id_aplicacion,
        a.id_usuario,
        a.id_oferta,
        a.estado,
        a.fecha_aplicacion,

        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.estado AS estado_oferta,
        o.fecha_publicacion,

        e.id_empresa,
        e.nombre_empresa,
        e.rubro,
        e.sitio_web
      FROM aplicaciones a
      INNER JOIN ofertas o 
        ON a.id_oferta = o.id_oferta
      INNER JOIN empresas e 
        ON o.id_empresa = e.id_empresa
      WHERE a.id_usuario = $1
      ORDER BY a.fecha_aplicacion DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener las aplicaciones del usuario',
      error: error.message
    });
  }
};

export const eliminarAplicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM aplicaciones
       WHERE id_aplicacion = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Aplicación no encontrada'
      });
    }

    res.json({
      mensaje: 'Aplicación eliminada correctamente',
      aplicacion: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar la aplicación',
      error: error.message
    });
  }
};

export const obtenerAplicantesPorOferta = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        a.id_aplicacion,
        a.id_usuario,
        a.id_oferta,
        a.estado,
        a.fecha_aplicacion,
        u.nombre_completo,
        u.correo,
        u.telefono,
        u.profesion,
        u.experiencia,
        u.nivel_educativo,
        u.habilidades,
        u.ubicacion
      FROM aplicaciones a
      INNER JOIN usuarios u 
        ON a.id_usuario = u.id_usuario
      WHERE a.id_oferta = $1
      ORDER BY a.fecha_aplicacion DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener los aplicantes de la oferta',
      error: error.message
    });
  }
};

export const cambiarEstadoAplicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ['pendiente', 'aceptada', 'denegada'];

    if (!estado || !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: 'Estado no válido. Debe ser: pendiente, aceptada o denegada'
      });
    }

    const result = await pool.query(
      `UPDATE aplicaciones
       SET estado = $1
       WHERE id_aplicacion = $2
       RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Aplicación no encontrada'
      });
    }

    res.json({
      mensaje: 'Estado de la aplicación actualizado correctamente',
      aplicacion: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al cambiar el estado de la aplicación',
      error: error.message
    });
  }
};