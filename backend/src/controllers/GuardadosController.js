import { pool } from '../config/db.js';

export const guardarEmpleo = async (req, res) => {
  try {
    const { id_usuario, id_oferta } = req.body;

    if (!id_usuario || !id_oferta) {
      return res.status(400).json({
        mensaje: 'El id_usuario y el id_oferta son obligatorios'
      });
    }

    const result = await pool.query(
      `INSERT INTO empleos_guardados (id_usuario, id_oferta)
       VALUES ($1, $2)
       RETURNING *`,
      [id_usuario, id_oferta]
    );

    res.status(201).json({
      mensaje: 'Empleo guardado correctamente',
      guardado: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Este empleo ya está guardado'
      });
    }

    res.status(500).json({
      mensaje: 'Error al guardar el empleo',
      error: error.message
    });
  }
};

export const obtenerGuardadosPorUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        g.id_guardado,
        g.id_usuario,
        g.id_oferta,
        g.fecha_guardado,

        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.estado,
        o.fecha_publicacion,

        e.id_empresa,
        e.nombre_empresa,
        e.rubro,
        e.sitio_web
      FROM empleos_guardados g
      INNER JOIN ofertas o
        ON g.id_oferta = o.id_oferta
      INNER JOIN empresas e
        ON o.id_empresa = e.id_empresa
      WHERE g.id_usuario = $1
      ORDER BY g.fecha_guardado DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener empleos guardados',
      error: error.message
    });
  }
};

export const verificarEmpleoGuardado = async (req, res) => {
  try {
    const { idUsuario, idOferta } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM empleos_guardados
       WHERE id_usuario = $1
       AND id_oferta = $2`,
      [idUsuario, idOferta]
    );

    res.json({
      guardado: result.rows.length > 0,
      empleo_guardado: result.rows[0] || null
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al verificar empleo guardado',
      error: error.message
    });
  }
};

export const eliminarGuardado = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM empleos_guardados
       WHERE id_guardado = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Empleo guardado no encontrado'
      });
    }

    res.json({
      mensaje: 'Empleo eliminado de guardados correctamente',
      guardado: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar empleo guardado',
      error: error.message
    });
  }
};

export const eliminarGuardadoPorUsuarioYOferta = async (req, res) => {
  try {
    const { idUsuario, idOferta } = req.params;

    const result = await pool.query(
      `DELETE FROM empleos_guardados
       WHERE id_usuario = $1
       AND id_oferta = $2
       RETURNING *`,
      [idUsuario, idOferta]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Empleo guardado no encontrado'
      });
    }

    res.json({
      mensaje: 'Empleo eliminado de guardados correctamente',
      guardado: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar empleo guardado',
      error: error.message
    });
  }
};