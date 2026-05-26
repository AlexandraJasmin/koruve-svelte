const API_URL = 'http://localhost:3001/api';

export async function obtenerDashboardUsuario(idUsuario) {
  const respuesta = await fetch(`${API_URL}/dashboard/usuario/${idUsuario}`);

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo cargar el dashboard de usuario');
  }

  return data;
}