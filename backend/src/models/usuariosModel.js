import pool from '../config/db.js';

export const crearUsuarioModel = async (usuario) => {
  const {
    nombre_completo,
    correo,
    password,
    telefono,
    profesion,
    experiencia,
    nivel_educativo,
    habilidades,
    ubicacion
  } = usuario;

  const query = `
    INSERT INTO usuarios (
      nombre_completo,
      correo,
      password,
      telefono,
      profesion,
      experiencia,
      nivel_educativo,
      habilidades,
      ubicacion
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING 
      id_usuario,
      nombre_completo,
      correo,
      telefono,
      profesion,
      experiencia,
      nivel_educativo,
      habilidades,
      ubicacion,
      fecha_registro,
      estado
  `;

  const values = [
    nombre_completo,
    correo,
    password,
    telefono,
    profesion,
    experiencia,
    nivel_educativo,
    habilidades,
    ubicacion
  ];

  const resultado = await pool.query(query, values);
  return resultado.rows[0];
};

export const buscarUsuarioPorCorreoModel = async (correo) => {
  const query = `
    SELECT *
    FROM usuarios
    WHERE correo = $1
  `;

  const resultado = await pool.query(query, [correo]);
  return resultado.rows[0];
};