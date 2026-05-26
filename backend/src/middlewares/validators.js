export const validarRegistroUsuario = (req, res, next) => {
  const { nombre_completo, correo, password } = req.body;

  if (!nombre_completo || !correo || !password) {
    return res.status(400).json({
      mensaje: 'Nombre completo, correo y contraseña son obligatorios'
    });
  }

  next();
};

export const validarRegistroEmpresa = (req, res, next) => {
  const { nombre_empresa, correo, password } = req.body;

  if (!nombre_empresa || !correo || !password) {
    return res.status(400).json({
      mensaje: 'Nombre de empresa, correo y contraseña son obligatorios'
    });
  }

  next();
};

export const validarLogin = (req, res, next) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      mensaje: 'Correo y contraseña son obligatorios'
    });
  }

  next();
};