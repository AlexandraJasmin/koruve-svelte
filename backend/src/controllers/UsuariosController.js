import { pool } from '../config/db.js';

export const obtenerPerfilUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        u.id_usuario,
        u.nombre_completo,
        u.correo,
        u.telefono,
        u.profesion,
        u.experiencia,
        u.nivel_educativo,
        u.habilidades,
        u.ubicacion,
        u.fecha_registro,
        u.estado,
        u.foto_perfil,
        u.titulo_profesional,
        u.descripcion,
        u.idiomas,

        c.id_curriculum,
        c.archivo_cv,
        c.titulo_profesional AS cv_titulo_profesional,
        c.anios_experiencia,
        c.idiomas AS cv_idiomas,
        c.nivel_educativo AS cv_nivel_educativo,
        c.salario_actual,
        c.salario_esperado,
        c.perfil_profesional,
        c.formacion_academica,
        c.experiencia_laboral,
        c.fecha_actualizacion,

        d.pais,
        d.ciudad,
        d.direccion_completa
      FROM usuarios u
      LEFT JOIN curriculum_usuario c ON u.id_usuario = c.id_usuario
      LEFT JOIN direccion_usuario d ON u.id_usuario = d.id_usuario
      WHERE u.id_usuario = $1
      LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener el perfil del usuario',
      error: error.message
    });
  }
};