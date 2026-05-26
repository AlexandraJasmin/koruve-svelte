const API_URL = 'http://localhost:3001/api';

export async function obtenerAplicacionesUsuario(idUsuario) {
  const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}/aplicaciones`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudieron cargar las postulaciones');
  }

  return data;
}

export async function crearAplicacion(idUsuario, idOferta) {
  const respuesta = await fetch(`${API_URL}/aplicaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_usuario: idUsuario,
      id_oferta: idOferta
    })
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo enviar la postulación');
  }

  return data;
}

export async function eliminarAplicacion(idAplicacion) {
  const respuesta = await fetch(`${API_URL}/aplicaciones/${idAplicacion}`, {
    method: 'DELETE'
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo eliminar la postulación');
  }

  return data;
}