import { pool } from '../config/db.js';

export const obtenerTodasLasOfertas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        o.id_oferta,
        o.id_empresa,
        e.nombre_empresa,
        e.rubro,
        e.sitio_web,
        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.estado,
        o.fecha_publicacion
      FROM ofertas o
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      WHERE o.estado = 'activa'
      ORDER BY o.fecha_publicacion DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener las ofertas',
      error: error.message
    });
  }
};

export const filtrarOfertas = async (req, res) => {
  try {
    const { busqueda, ciudad, categoria, salarioMax, fecha } = req.query;
    let tipos = req.query.tipo;

    let query = `
      SELECT 
        o.id_oferta,
        o.id_empresa,
        e.nombre_empresa,
        e.rubro,
        e.sitio_web,
        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.estado,
        o.fecha_publicacion
      FROM ofertas o
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      WHERE o.estado = 'activa'
    `;

    const values = [];
    let index = 1;

    if (busqueda) {
      query += ` AND (
        LOWER(o.titulo) LIKE LOWER($${index})
        OR LOWER(o.descripcion) LIKE LOWER($${index})
        OR LOWER(e.nombre_empresa) LIKE LOWER($${index})
        OR LOWER(e.rubro) LIKE LOWER($${index})
      )`;
      values.push(`%${busqueda}%`);
      index++;
    }

    if (ciudad) {
      query += ` AND LOWER(o.ubicacion) LIKE LOWER($${index})`;
      values.push(`%${ciudad}%`);
      index++;
    }

    if (categoria) {
      query += ` AND LOWER(e.rubro) LIKE LOWER($${index})`;
      values.push(`%${categoria}%`);
      index++;
    }

    if (salarioMax) {
      query += ` AND o.salario <= $${index}`;
      values.push(Number(salarioMax));
      index++;
    }

    if (tipos) {
      if (!Array.isArray(tipos)) {
        tipos = [tipos];
      }

      query += ` AND (`;

      for (let i = 0; i < tipos.length; i++) {
        query += `LOWER(o.tipo_contrato) = LOWER($${index})`;
        values.push(tipos[i]);
        index++;

        if (i < tipos.length - 1) {
          query += ` OR `;
        }
      }

      query += `)`;
    }

    if (fecha && fecha !== 'todas') {
      if (fecha === '1h') query += ` AND o.fecha_publicacion >= NOW() - INTERVAL '1 hour'`;
      if (fecha === '24h') query += ` AND o.fecha_publicacion >= NOW() - INTERVAL '24 hours'`;
      if (fecha === '7d') query += ` AND o.fecha_publicacion >= NOW() - INTERVAL '7 days'`;
      if (fecha === '14d') query += ` AND o.fecha_publicacion >= NOW() - INTERVAL '14 days'`;
      if (fecha === '30d') query += ` AND o.fecha_publicacion >= NOW() - INTERVAL '30 days'`;
    }

    query += ` ORDER BY o.fecha_publicacion DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al filtrar ofertas:', error);
    res.status(500).json({
      mensaje: 'Error al filtrar ofertas',
      error: error.message
    });
  }
};

export const crearOferta = async (req, res) => {
  try {
    const {
      id_empresa,
      titulo,
      descripcion,
      requisitos,
      salario,
      modalidad,
      ubicacion,
      tipo_contrato
    } = req.body;

    if (!id_empresa || !titulo || !descripcion) {
      return res.status(400).json({
        mensaje: 'El id de empresa, título y descripción son obligatorios'
      });
    }

    const result = await pool.query(
      `INSERT INTO ofertas 
      (id_empresa, titulo, descripcion, requisitos, salario, modalidad, ubicacion, tipo_contrato)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        id_empresa,
        titulo,
        descripcion,
        requisitos,
        salario,
        modalidad,
        ubicacion,
        tipo_contrato
      ]
    );

    res.status(201).json({
      mensaje: 'Oferta creada correctamente',
      oferta: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear la oferta',
      error: error.message
    });
  }
};

export const obtenerOfertasPorEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        id_oferta,
        id_empresa,
        titulo,
        descripcion,
        requisitos,
        salario,
        modalidad,
        ubicacion,
        tipo_contrato,
        estado,
        fecha_publicacion
      FROM ofertas
      WHERE id_empresa = $1
      ORDER BY fecha_publicacion DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener las ofertas de la empresa',
      error: error.message
    });
  }
};

export const obtenerDetalleOferta = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        o.id_oferta,
        o.id_empresa,
        e.nombre_empresa,
        e.rubro,
        e.descripcion AS descripcion_empresa,
        e.telefono,
        e.correo,
        e.sitio_web,
        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.estado,
        o.fecha_publicacion
      FROM ofertas o
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      WHERE o.id_oferta = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Oferta no encontrada'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener el detalle de la oferta',
      error: error.message
    });
  }
};

export const cambiarEstadoOferta = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ['activa', 'inactiva', 'cancelada', 'eliminada'];

    if (!estado || !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: 'Estado no válido. Debe ser: activa, inactiva, cancelada o eliminada'
      });
    }

    const result = await pool.query(
      `UPDATE ofertas
      SET estado = $1
      WHERE id_oferta = $2
      RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensaje: 'Oferta no encontrada'
      });
    }

    res.json({
      mensaje: 'Estado de la oferta actualizado correctamente',
      oferta: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al cambiar el estado de la oferta',
      error: error.message
    });
  }
};