import bcrypt from 'bcrypt';
import {
  crearUsuarioModel,
  buscarUsuarioPorCorreoModel
} from '../models/usuariosModel.js';

export const crearUsuario = async (req, res) => {
  try {
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
    } = req.body;

    if (!nombre_completo || !correo || !password) {
      return res.status(400).json({
        mensaje: 'Nombre completo, correo y contraseña son obligatorios'
      });
    }

    const usuarioExistente = await buscarUsuarioPorCorreoModel(correo);

    if (usuarioExistente) {
      return res.status(409).json({
        mensaje: 'Ya existe un usuario registrado con ese correo'
      });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevoUsuario = await crearUsuarioModel({
      nombre_completo,
      correo,
      password: passwordEncriptada,
      telefono,
      profesion,
      experiencia,
      nivel_educativo,
      habilidades,
      ubicacion
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: nuevoUsuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);

    return res.status(500).json({
      mensaje: 'Error interno al registrar usuario',
      error: error.message
    });
  }
};