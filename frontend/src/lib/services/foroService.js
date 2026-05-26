const API_URL = 'http://localhost:3000/api';

export async function obtenerPublicaciones({ busqueda = '', tipo = 'todos' } = {}) {
  const params = new URLSearchParams();

  if (busqueda) {
    params.append('busqueda', busqueda);
  }

  if (tipo && tipo !== 'todos') {
    params.append('tipo', tipo);
  }

  const url = `${API_URL}/foro/publicaciones${params.toString() ? `?${params.toString()}` : ''}`;

  const respuesta = await fetch(url);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al cargar publicaciones');
  }

  return data;
}

export async function obtenerPublicacionPorId(id) {
  const respuesta = await fetch(`${API_URL}/foro/publicaciones/${id}`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al cargar la publicación');
  }

  return data;
}

export async function crearPublicacion(datosPublicacion) {
  const respuesta = await fetch(`${API_URL}/foro/publicaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosPublicacion)
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al crear publicación');
  }

  return data;
}

export async function crearComentario(idPublicacion, datosComentario) {
  const respuesta = await fetch(`${API_URL}/foro/publicaciones/${idPublicacion}/comentarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosComentario)
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al crear comentario');
  }

  return data;
}