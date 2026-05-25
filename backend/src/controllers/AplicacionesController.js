import { pool } from '../config/db.js';

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
        u.foto_perfil,
        u.titulo_profesional,
        u.experiencia,
        u.nivel_educativo,
        u.descripcion,
        u.idiomas
      FROM aplicaciones a
      INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
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