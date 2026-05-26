import { pool } from '../config/db.js';

export const obtenerValoracionesModel = async ({
  busqueda,
  calificacion,
  fecha,
  tipo_experiencia,
  orden
}) => {
  let query = `
    SELECT
      v.id_valoracion,
      v.id_usuario,
      v.id_empresa,
      v.puesto,
      v.tipo_experiencia,
      v.calificacion,
      v.resena,
      v.fecha_valoracion,
      v.estado,

      u.nombre_completo AS usuario_nombre,
      e.nombre_empresa AS empresa_nombre,
      e.rubro AS empresa_rubro,
      e.ubicacion AS empresa_ubicacion

    FROM valoraciones v
    INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
    INNER JOIN empresas e ON v.id_empresa = e.id_empresa
    WHERE v.estado = 'activo'
  `;

  const values = [];

  if (busqueda) {
    values.push(`%${busqueda}%`);
    query += `
      AND (
        e.nombre_empresa ILIKE $${values.length}
        OR v.puesto ILIKE $${values.length}
        OR v.resena ILIKE $${values.length}
      )
    `;
  }

  if (calificacion) {
    values.push(Number(calificacion));
    query += ` AND v.calificacion >= $${values.length}`;
  }

  if (tipo_experiencia && tipo_experiencia !== 'todos') {
    values.push(tipo_experiencia);
    query += ` AND v.tipo_experiencia = $${values.length}`;
  }

  if (fecha === 'semana') {
    query += ` AND v.fecha_valoracion >= NOW() - INTERVAL '7 days'`;
  }

  if (fecha === 'mes') {
    query += ` AND v.fecha_valoracion >= NOW() - INTERVAL '1 month'`;
  }

  if (fecha === 'tres_meses') {
    query += ` AND v.fecha_valoracion >= NOW() - INTERVAL '3 months'`;
  }

  if (orden === 'mejor_calificadas') {
    query += ` ORDER BY v.calificacion DESC, v.fecha_valoracion DESC`;
  } else if (orden === 'menor_calificadas') {
    query += ` ORDER BY v.calificacion ASC, v.fecha_valoracion DESC`;
  } else {
    query += ` ORDER BY v.fecha_valoracion DESC`;
  }

  const resultado = await pool.query(query, values);
  return resultado.rows;
};

export const obtenerValoracionPorIdModel = async (id_valoracion) => {
  const query = `
    SELECT
      v.id_valoracion,
      v.id_usuario,
      v.id_empresa,
      v.puesto,
      v.tipo_experiencia,
      v.calificacion,
      v.resena,
      v.fecha_valoracion,
      v.estado,

      u.nombre_completo AS usuario_nombre,
      e.nombre_empresa AS empresa_nombre,
      e.rubro AS empresa_rubro,
      e.ubicacion AS empresa_ubicacion

    FROM valoraciones v
    INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
    INNER JOIN empresas e ON v.id_empresa = e.id_empresa
    WHERE v.id_valoracion = $1
      AND v.estado = 'activo'
  `;

  const resultado = await pool.query(query, [id_valoracion]);
  return resultado.rows[0];
};

export const crearValoracionModel = async (valoracion) => {
  const {
    id_usuario,
    id_empresa,
    puesto,
    tipo_experiencia,
    calificacion,
    resena
  } = valoracion;

  const query = `
    INSERT INTO valoraciones (
      id_usuario,
      id_empresa,
      puesto,
      tipo_experiencia,
      calificacion,
      resena
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    id_usuario,
    id_empresa,
    puesto,
    tipo_experiencia,
    calificacion,
    resena
  ];

  const resultado = await pool.query(query, values);
  return resultado.rows[0];
};

export const obtenerResumenValoracionesModel = async () => {
  const query = `
    SELECT
      COUNT(*)::INT AS total_valoraciones,
      COALESCE(ROUND(AVG(calificacion), 1), 0) AS promedio_calificacion,
      COUNT(*) FILTER (WHERE tipo_experiencia = 'positiva')::INT AS positivas,
      COUNT(*) FILTER (WHERE tipo_experiencia = 'neutral')::INT AS neutrales,
      COUNT(*) FILTER (WHERE tipo_experiencia = 'negativa')::INT AS negativas
    FROM valoraciones
    WHERE estado = 'activo'
  `;

  const resultado = await pool.query(query);
  return resultado.rows[0];
};