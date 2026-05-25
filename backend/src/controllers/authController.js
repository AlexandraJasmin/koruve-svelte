import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { buscarUsuarioPorCorreoModel } from '../models/usuariosModel.js';
import { buscarEmpresaPorCorreoModel } from '../models/empresasModel.js';

export const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const usuario = await buscarUsuarioPorCorreoModel(correo);

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        correo: usuario.correo,
        tipoCuenta: 'usuario'
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      mensaje: 'Inicio de sesión de usuario exitoso',
      tipoCuenta: 'usuario',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        telefono: usuario.telefono,
        profesion: usuario.profesion,
        ubicacion: usuario.ubicacion,
        estado: usuario.estado
      }
    });
  } catch (error) {
    console.error('Error en login de usuario:', error);

    return res.status(500).json({
      mensaje: 'Error interno al iniciar sesión como usuario',
      error: error.message
    });
  }
};

export const loginEmpresa = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Correo y contraseña son obligatorios'
      });
    }

    const empresa = await buscarEmpresaPorCorreoModel(correo);

    if (!empresa) {
      return res.status(404).json({
        mensaje: 'Empresa no encontrada'
      });
    }

    const passwordValida = await bcrypt.compare(password, empresa.password);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      {
        id: empresa.id_empresa,
        correo: empresa.correo,
        tipoCuenta: 'empresa'
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      mensaje: 'Inicio de sesión de empresa exitoso',
      tipoCuenta: 'empresa',
      token,
      empresa: {
        id_empresa: empresa.id_empresa,
        nombre_empresa: empresa.nombre_empresa,
        correo: empresa.correo,
        telefono: empresa.telefono,
        rubro: empresa.rubro,
        ubicacion: empresa.ubicacion,
        sitio_web: empresa.sitio_web,
        estado: empresa.estado
      }
    });
  } catch (error) {
    console.error('Error en login de empresa:', error);

    return res.status(500).json({
      mensaje: 'Error interno al iniciar sesión como empresa',
      error: error.message
    });
  }
};