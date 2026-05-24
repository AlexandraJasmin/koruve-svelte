import { pool } from '../config/db.js';

export const obtenerDashboardEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const resumenOfertas = await pool.query(
      `SELECT
        COUNT(*) AS total_ofertas,
        COUNT(*) FILTER (WHERE estado = 'activa') AS ofertas_activas,
        COUNT(*) FILTER (WHERE estado = 'inactiva') AS ofertas_inactivas,
        COUNT(*) FILTER (WHERE estado = 'cancelada') AS ofertas_canceladas,
        COUNT(*) FILTER (WHERE estado = 'eliminada') AS ofertas_eliminadas
      FROM ofertas
      WHERE id_empresa = $1`,
      [id]
    );

    const resumenAplicaciones = await pool.query(
      `SELECT
        COUNT(a.*) AS total_aplicantes,
        COUNT(a.*) FILTER (WHERE a.estado = 'pendiente') AS aplicantes_pendientes,
        COUNT(a.*) FILTER (WHERE a.estado = 'aceptada') AS aplicantes_aceptados,
        COUNT(a.*) FILTER (WHERE a.estado = 'denegada') AS aplicantes_denegados
      FROM aplicaciones a
      INNER JOIN ofertas o ON a.id_oferta = o.id_oferta
      WHERE o.id_empresa = $1`,
      [id]
    );

    const ultimasAplicaciones = await pool.query(
      `SELECT
        a.id_aplicacion,
        a.estado,
        a.fecha_aplicacion,
        u.nombre_completo,
        u.profesion,
        o.titulo AS oferta
      FROM aplicaciones a
      INNER JOIN usuarios u ON a.id_usuario = u.id_usuario
      INNER JOIN ofertas o ON a.id_oferta = o.id_oferta
      WHERE o.id_empresa = $1
      ORDER BY a.fecha_aplicacion DESC
      LIMIT 5`,
      [id]
    );

    res.json({
      ofertas: resumenOfertas.rows[0],
      aplicaciones: resumenAplicaciones.rows[0],
      ultimas_aplicaciones: ultimasAplicaciones.rows
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener el dashboard de empresa',
      error: error.message
    });
  }
};