import { pool } from '../config/db.js';

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