import bcrypt from 'bcrypt';
import {
  crearEmpresaModel,
  buscarEmpresaPorCorreoModel
} from '../models/empresasModel.js';

export const crearEmpresa = async (req, res) => {
  try {
    const {
      nombre_empresa,
      correo,
      password,
      telefono,
      rubro,
      descripcion,
      ubicacion,
      sitio_web
    } = req.body;

    if (!nombre_empresa || !correo || !password) {
      return res.status(400).json({
        mensaje: 'Nombre de empresa, correo y contraseña son obligatorios'
      });
    }

    const empresaExistente = await buscarEmpresaPorCorreoModel(correo);

    if (empresaExistente) {
      return res.status(409).json({
        mensaje: 'Ya existe una empresa registrada con ese correo'
      });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevaEmpresa = await crearEmpresaModel({
      nombre_empresa,
      correo,
      password: passwordEncriptada,
      telefono,
      rubro,
      descripcion,
      ubicacion,
      sitio_web
    });

    return res.status(201).json({
      mensaje: 'Empresa registrada correctamente',
      empresa: nuevaEmpresa
    });
  } catch (error) {
    console.error('Error al crear empresa:', error);

    return res.status(500).json({
      mensaje: 'Error interno al registrar empresa',
      error: error.message
    });
  }
};