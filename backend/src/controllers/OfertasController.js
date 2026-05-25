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
      tipo_contrato,
      responsabilidades,
      habilidades_experiencia,
      horario_laboral,
      tipo_salario,
      nivel_estudios,
      experiencia_requerida,
      tipo_empleo,
      certificaciones,
      idiomas_requeridos,
      fecha_limite,
      pais,
      ciudad,
      direccion,
      referencia_mapa,
      latitud,
      longitud,
      categoria_empleo,
      urgente
    } = req.body;

    if (
      !id_empresa ||
      !titulo ||
      !descripcion ||
      !requisitos ||
      !salario ||
      !modalidad ||
      !ubicacion ||
      !tipo_contrato
    ) {
      return res.status(400).json({
        mensaje: 'Los campos principales de la oferta son obligatorios'
      });
    }

    const result = await pool.query(
      `INSERT INTO ofertas (
        id_empresa,
        titulo,
        descripcion,
        requisitos,
        salario,
        modalidad,
        ubicacion,
        tipo_contrato,
        responsabilidades,
        habilidades_experiencia,
        horario_laboral,
        tipo_salario,
        nivel_estudios,
        experiencia_requerida,
        tipo_empleo,
        certificaciones,
        idiomas_requeridos,
        fecha_limite,
        pais,
        ciudad,
        direccion,
        referencia_mapa,
        latitud,
        longitud,
        categoria_empleo,
        urgente,
        estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24,
        $25, $26, 'activa'
      )
      RETURNING *`,
      [
        id_empresa,
        titulo,
        descripcion,
        requisitos,
        salario,
        modalidad,
        ubicacion,
        tipo_contrato,
        responsabilidades || null,
        habilidades_experiencia || null,
        horario_laboral || null,
        tipo_salario || null,
        nivel_estudios || null,
        experiencia_requerida || null,
        tipo_empleo || null,
        certificaciones || null,
        idiomas_requeridos || null,
        fecha_limite || null,
        pais || null,
        ciudad || null,
        direccion || null,
        referencia_mapa || null,
        latitud || null,
        longitud || null,
        categoria_empleo || null,
        urgente ?? false
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
        o.id_oferta,
        o.id_empresa,
        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.responsabilidades,
        o.habilidades_experiencia,
        o.horario_laboral,
        o.tipo_salario,
        o.nivel_estudios,
        o.experiencia_requerida,
        o.tipo_empleo,
        o.certificaciones,
        o.idiomas_requeridos,
        o.fecha_limite,
        o.pais,
        o.ciudad,
        o.direccion,
        o.referencia_mapa,
        o.latitud,
        o.longitud,
        o.categoria_empleo,
        o.urgente,
        o.estado,
        o.fecha_publicacion,
        COUNT(a.id_aplicacion) AS total_aplicaciones
      FROM ofertas o
      LEFT JOIN aplicaciones a ON o.id_oferta = a.id_oferta
      WHERE o.id_empresa = $1
      GROUP BY o.id_oferta
      ORDER BY o.fecha_publicacion DESC`,
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
        e.logo,
        e.portada,
        e.telefono,
        e.correo,
        e.sitio_web,
        e.fecha_fundacion,
        e.tamano_equipo,
        e.categoria AS categoria_empresa,
        e.descripcion AS descripcion_empresa,
        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.responsabilidades,
        o.habilidades_experiencia,
        o.horario_laboral,
        o.tipo_salario,
        o.nivel_estudios,
        o.experiencia_requerida,
        o.tipo_empleo,
        o.certificaciones,
        o.idiomas_requeridos,
        o.fecha_limite,
        o.pais,
        o.ciudad,
        o.direccion,
        o.referencia_mapa,
        o.latitud,
        o.longitud,
        o.categoria_empleo,
        o.urgente,
        o.estado,
        o.fecha_publicacion,
        COUNT(a.id_aplicacion) AS total_aplicaciones
      FROM ofertas o
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      LEFT JOIN aplicaciones a ON o.id_oferta = a.id_oferta
      WHERE o.id_oferta = $1
      GROUP BY o.id_oferta, e.id_empresa`,
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

export const obtenerOfertaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        o.id_oferta,
        o.id_empresa,
        o.titulo,
        o.descripcion,
        o.requisitos,
        o.salario,
        o.modalidad,
        o.ubicacion,
        o.tipo_contrato,
        o.responsabilidades,
        o.habilidades_experiencia,
        o.horario_laboral,
        o.tipo_salario,
        o.nivel_estudios,
        o.experiencia_requerida,
        o.tipo_empleo,
        o.certificaciones,
        o.idiomas_requeridos,
        o.fecha_limite,
        o.pais,
        o.ciudad,
        o.direccion,
        o.referencia_mapa,
        o.latitud,
        o.longitud,
        o.categoria_empleo,
        o.urgente,
        o.estado,
        o.fecha_publicacion,
        e.nombre_empresa,
        e.logo,
        e.telefono,
        e.correo,
        COUNT(a.id_aplicacion) AS total_aplicaciones
      FROM ofertas o
      INNER JOIN empresas e ON o.id_empresa = e.id_empresa
      LEFT JOIN aplicaciones a ON o.id_oferta = a.id_oferta
      WHERE o.id_oferta = $1
      GROUP BY o.id_oferta, e.id_empresa`,
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