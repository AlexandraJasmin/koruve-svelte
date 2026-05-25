const API_URL = 'http://localhost:3000/api';

export async function loginUsuario(credenciales) {
  const respuesta = await fetch(`${API_URL}/iniciar-sesion/usuario`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credenciales)
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al iniciar sesión como usuario');
  }

  return data;
}

export async function loginEmpresa(credenciales) {
  const respuesta = await fetch(`${API_URL}/iniciar-sesion/empresa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credenciales)
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al iniciar sesión como empresa');
  }

  return data;
}