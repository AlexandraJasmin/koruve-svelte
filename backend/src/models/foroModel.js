import { pool } from '../config/db.js';

export const obtenerPublicacionesModel = async ({ busqueda, tipo }) => {
  let query = `
    SELECT
      fp.id_publicacion,
      fp.titulo,
      fp.contenido,
      fp.tipo,
      fp.imagen_url,
      fp.autor_tipo,
      fp.id_usuario,
      fp.id_empresa,
      fp.fecha_publicacion,
      fp.estado,

      CASE
        WHEN fp.autor_tipo = 'usuario' THEN u.nombre_completo
        WHEN fp.autor_tipo = 'empresa' THEN e.nombre_empresa
      END AS autor_nombre,

      (
        SELECT COUNT(*)
        FROM foro_comentarios fc
        WHERE fc.id_publicacion = fp.id_publicacion
          AND fc.estado = 'activo'
      ) AS total_comentarios

    FROM foro_publicaciones fp
    LEFT JOIN usuarios u ON fp.id_usuario = u.id_usuario
    LEFT JOIN empresas e ON fp.id_empresa = e.id_empresa
    WHERE fp.estado = 'activo'
  `;

  const values = [];

  if (busqueda) {
    values.push(`%${busqueda}%`);
    query += `
      AND (
        fp.titulo ILIKE $${values.length}
        OR fp.contenido ILIKE $${values.length}
      )
    `;
  }

  if (tipo && tipo !== 'todos') {
    values.push(tipo);
    query += ` AND fp.tipo = $${values.length}`;
  }

  query += ` ORDER BY fp.fecha_publicacion DESC`;

  const resultado = await pool.query(query, values);
  return resultado.rows;
};

export const obtenerPublicacionPorIdModel = async (id_publicacion) => {
  const query = `
    SELECT
      fp.id_publicacion,
      fp.titulo,
      fp.contenido,
      fp.tipo,
      fp.imagen_url,
      fp.autor_tipo,
      fp.id_usuario,
      fp.id_empresa,
      fp.fecha_publicacion,
      fp.estado,

      CASE
        WHEN fp.autor_tipo = 'usuario' THEN u.nombre_completo
        WHEN fp.autor_tipo = 'empresa' THEN e.nombre_empresa
      END AS autor_nombre

    FROM foro_publicaciones fp
    LEFT JOIN usuarios u ON fp.id_usuario = u.id_usuario
    LEFT JOIN empresas e ON fp.id_empresa = e.id_empresa
    WHERE fp.id_publicacion = $1
      AND fp.estado = 'activo'
  `;

  const resultado = await pool.query(query, [id_publicacion]);
  return resultado.rows[0];
};

export const crearPublicacionModel = async (publicacion) => {
  const {
    titulo,
    contenido,
    tipo,
    imagen_url,
    autor_tipo,
    id_usuario,
    id_empresa
  } = publicacion;

  const query = `
    INSERT INTO foro_publicaciones (
      titulo,
      contenido,
      tipo,
      imagen_url,
      autor_tipo,
      id_usuario,
      id_empresa
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    titulo,
    contenido,
    tipo,
    imagen_url || null,
    autor_tipo,
    id_usuario || null,
    id_empresa || null
  ];

  const resultado = await pool.query(query, values);
  return resultado.rows[0];
};

export const obtenerComentariosPorPublicacionModel = async (id_publicacion) => {
  const query = `
    SELECT
      fc.id_comentario,
      fc.id_publicacion,
      fc.comentario,
      fc.autor_tipo,
      fc.id_usuario,
      fc.id_empresa,
      fc.fecha_comentario,
      fc.estado,

      CASE
        WHEN fc.autor_tipo = 'usuario' THEN u.nombre_completo
        WHEN fc.autor_tipo = 'empresa' THEN e.nombre_empresa
      END AS autor_nombre

    FROM foro_comentarios fc
    LEFT JOIN usuarios u ON fc.id_usuario = u.id_usuario
    LEFT JOIN empresas e ON fc.id_empresa = e.id_empresa
    WHERE fc.id_publicacion = $1
      AND fc.estado = 'activo'
    ORDER BY fc.fecha_comentario ASC
  `;

  const resultado = await pool.query(query, [id_publicacion]);
  return resultado.rows;
};

export const crearComentarioModel = async (comentarioData) => {
  const {
    id_publicacion,
    comentario,
    autor_tipo,
    id_usuario,
    id_empresa
  } = comentarioData;

  const query = `
    INSERT INTO foro_comentarios (
      id_publicacion,
      comentario,
      autor_tipo,
      id_usuario,
      id_empresa
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    id_publicacion,
    comentario,
    autor_tipo,
    id_usuario || null,
    id_empresa || null
  ];

  const resultado = await pool.query(query, values);
  return resultado.rows[0];
};