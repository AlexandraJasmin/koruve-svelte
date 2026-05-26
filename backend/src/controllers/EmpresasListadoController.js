import { pool } from '../config/db.js';

export const obtenerEmpresas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro AS categoria,
        e.descripcion,
        e.ubicacion AS ciudad,
        'El Salvador' AS pais,
        e.sitio_web,
        e.fecha_registro,
        e.estado,
        NULL AS logo,
        NULL AS portada,
        NULL AS fecha_fundacion,
        NULL AS tamano_equipo,
        e.ubicacion AS direccion_completa,
        FALSE AS emp_destacada,
        COUNT(o.id_oferta) FILTER (WHERE o.estado = 'activa') AS vacantes_abiertas
      FROM empresas e
      LEFT JOIN ofertas o
        ON e.id_empresa = o.id_empresa
      WHERE e.estado = 'activo'
      GROUP BY
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro,
        e.descripcion,
        e.ubicacion,
        e.sitio_web,
        e.fecha_registro,
        e.estado
      ORDER BY e.fecha_registro DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener las empresas',
      error: error.message
    });
  }
};

export const filtrarEmpresas = async (req, res) => {
  try {
    const { busqueda, ciudad, categoria, orden, limite } = req.query;

    let query = `
      SELECT
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro AS categoria,
        e.descripcion,
        e.ubicacion AS ciudad,
        'El Salvador' AS pais,
        e.sitio_web,
        e.fecha_registro,
        e.estado,
        NULL AS logo,
        NULL AS portada,
        NULL AS fecha_fundacion,
        NULL AS tamano_equipo,
        e.ubicacion AS direccion_completa,
        FALSE AS emp_destacada,
        COUNT(o.id_oferta) FILTER (WHERE o.estado = 'activa') AS vacantes_abiertas
      FROM empresas e
      LEFT JOIN ofertas o
        ON e.id_empresa = o.id_empresa
      WHERE e.estado = 'activo'
    `;

    const values = [];
    let index = 1;

    if (busqueda) {
      query += `
        AND (
          LOWER(e.nombre_empresa) LIKE LOWER($${index})
          OR LOWER(e.descripcion) LIKE LOWER($${index})
          OR LOWER(e.rubro) LIKE LOWER($${index})
        )
      `;
      values.push(`%${busqueda}%`);
      index++;
    }

    if (ciudad) {
      query += ` AND LOWER(e.ubicacion) LIKE LOWER($${index})`;
      values.push(`%${ciudad}%`);
      index++;
    }

    if (categoria) {
      query += ` AND LOWER(e.rubro) = LOWER($${index})`;
      values.push(categoria);
      index++;
    }

    query += `
      GROUP BY
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro,
        e.descripcion,
        e.ubicacion,
        e.sitio_web,
        e.fecha_registro,
        e.estado
    `;

    if (orden === 'antiguas') {
      query += ` ORDER BY e.fecha_registro ASC`;
    } else if (orden === 'az') {
      query += ` ORDER BY e.nombre_empresa ASC`;
    } else {
      query += ` ORDER BY e.fecha_registro DESC`;
    }

    if (limite) {
      query += ` LIMIT $${index}`;
      values.push(Number(limite));
    }

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al filtrar empresas',
      error: error.message
    });
  }
};

export const obtenerEmpresaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro AS categoria,
        e.descripcion,
        e.ubicacion AS ciudad,
        'El Salvador' AS pais,
        e.sitio_web,
        e.fecha_registro,
        e.estado,
        NULL AS logo,
        NULL AS portada,
        NULL AS fecha_fundacion,
        NULL AS tamano_equipo,
        e.ubicacion AS direccion_completa,
        FALSE AS emp_destacada,
        COUNT(o.id_oferta) FILTER (WHERE o.estado = 'activa') AS vacantes_abiertas
      FROM empresas e
      LEFT JOIN ofertas o
        ON e.id_empresa = o.id_empresa
      WHERE e.id_empresa = $1
      GROUP BY
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro,
        e.descripcion,
        e.ubicacion,
        e.sitio_web,
        e.fecha_registro,
        e.estado`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Empresa no encontrada'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener la empresa',
      error: error.message
    });
  }
};

export const obtenerDetalleEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const empresaResult = await pool.query(
      `SELECT
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro AS categoria,
        e.descripcion,
        e.ubicacion AS ciudad,
        'El Salvador' AS pais,
        e.sitio_web,
        e.fecha_registro,
        e.estado,
        NULL AS logo,
        NULL AS portada,
        NULL AS fecha_fundacion,
        NULL AS tamano_equipo,
        e.ubicacion AS direccion_completa,
        FALSE AS emp_destacada,
        COUNT(o.id_oferta) FILTER (WHERE o.estado = 'activa') AS vacantes_abiertas
      FROM empresas e
      LEFT JOIN ofertas o
        ON e.id_empresa = o.id_empresa
      WHERE e.id_empresa = $1
      GROUP BY
        e.id_empresa,
        e.nombre_empresa,
        e.correo,
        e.telefono,
        e.rubro,
        e.descripcion,
        e.ubicacion,
        e.sitio_web,
        e.fecha_registro,
        e.estado`,
      [id]
    );

    if (empresaResult.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Empresa no encontrada'
      });
    }

    const empleosResult = await pool.query(
      `SELECT
        o.id_oferta,
        o.id_empresa,
        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion AS ciudad,
        'El Salvador' AS pais,
        o.tipo_contrato,
        o.estado,
        o.fecha_publicacion
      FROM ofertas o
      WHERE o.id_empresa = $1
        AND o.estado = 'activa'
      ORDER BY o.fecha_publicacion DESC`,
      [id]
    );

    res.json({
      empresa: empresaResult.rows[0],
      redes: [],
      empleos: empleosResult.rows,
      resumen_valoraciones: {
        promedio: 0,
        total_resenas: 0
      },
      resenas: []
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener el detalle de la empresa',
      error: error.message
    });
  }
};