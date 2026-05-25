import pool from '../config/db.js';

export const crearEmpresaModel = async (empresa) => {
  const {
    nombre_empresa,
    correo,
    password,
    telefono,
    rubro,
    descripcion,
    ubicacion,
    sitio_web
  } = empresa;

  const query = `
    INSERT INTO empresas (
      nombre_empresa,
      correo,
      password,
      telefono,
      rubro,
      descripcion,
      ubicacion,
      sitio_web
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      id_empresa,
      nombre_empresa,
      correo,
      telefono,
      rubro,
      descripcion,
      ubicacion,
      sitio_web,
      fecha_registro,
      estado
  `;

  const values = [
    nombre_empresa,
    correo,
    password,
    telefono,
    rubro,
    descripcion,
    ubicacion,
    sitio_web
  ];

  const resultado = await pool.query(query, values);
  return resultado.rows[0];
};

export const buscarEmpresaPorCorreoModel = async (correo) => {
  const query = `
    SELECT *
    FROM empresas
    WHERE correo = $1
  `;

  const resultado = await pool.query(query, [correo]);
  return resultado.rows[0];
};