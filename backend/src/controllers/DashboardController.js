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

export const obtenerDashboardUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await pool.query(
      `SELECT
        id_usuario,
        nombre_completo,
        correo,
        telefono,
        profesion,
        experiencia,
        nivel_educativo,
        habilidades,
        ubicacion,
        estado,
        fecha_registro
      FROM usuarios
      WHERE id_usuario = $1`,
      [id]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const resumenAplicaciones = await pool.query(
      `SELECT
        COUNT(*) AS total_postulaciones,
        COUNT(*) FILTER (WHERE estado = 'pendiente') AS pendientes,
        COUNT(*) FILTER (WHERE estado = 'aceptada') AS aceptadas,
        COUNT(*) FILTER (WHERE estado = 'denegada') AS denegadas
      FROM aplicaciones
      WHERE id_usuario = $1`,
      [id]
    );

    const empresasContactadas = await pool.query(
      `SELECT COUNT(DISTINCT e.id_empresa) AS total
      FROM aplicaciones a
      INNER JOIN ofertas o ON a.id_oferta = o.id_oferta
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      WHERE a.id_usuario = $1`,
      [id]
    );

    const ultimasAplicaciones = await pool.query(
      `SELECT
        a.id_aplicacion,
        a.estado,
        a.fecha_aplicacion,
        o.id_oferta,
        o.titulo,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        e.id_empresa,
        e.nombre_empresa,
        e.rubro
      FROM aplicaciones a
      INNER JOIN ofertas o ON a.id_oferta = o.id_oferta
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      WHERE a.id_usuario = $1
      ORDER BY a.fecha_aplicacion DESC
      LIMIT 5`,
      [id]
    );

    const empleosRecientes = await pool.query(
      `SELECT
        o.id_oferta,
        o.titulo,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.estado,
        o.fecha_publicacion,
        e.id_empresa,
        e.nombre_empresa,
        e.rubro
      FROM ofertas o
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      WHERE o.estado = 'activa'
      ORDER BY o.fecha_publicacion DESC
      LIMIT 5`
    );

    const u = usuario.rows[0];

    let perfilCompletado = 0;

    if (u.nombre_completo) perfilCompletado += 15;
    if (u.correo) perfilCompletado += 15;
    if (u.telefono) perfilCompletado += 15;
    if (u.profesion) perfilCompletado += 15;
    if (u.experiencia) perfilCompletado += 15;
    if (u.nivel_educativo) perfilCompletado += 10;
    if (u.habilidades) perfilCompletado += 10;
    if (u.ubicacion) perfilCompletado += 5;

    res.json({
      usuario: u,
      resumen: {
        total_postulaciones: Number(resumenAplicaciones.rows[0].total_postulaciones),
        pendientes: Number(resumenAplicaciones.rows[0].pendientes),
        aceptadas: Number(resumenAplicaciones.rows[0].aceptadas),
        denegadas: Number(resumenAplicaciones.rows[0].denegadas),
        empresas_contactadas: Number(empresasContactadas.rows[0].total),
        alertas: 0,
        mensajes: 0,
        perfil_completado: perfilCompletado
      },
      ultimas_aplicaciones: ultimasAplicaciones.rows,
      empleos_recientes: empleosRecientes.rows
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener el dashboard de usuario',
      error: error.message
    });
  }
};