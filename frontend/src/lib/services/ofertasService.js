const API_URL = 'http://localhost:3001/api';

export async function obtenerOfertas() {
  const respuesta = await fetch(`${API_URL}/ofertas`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudieron cargar las ofertas');
  }

  return data;
}

export async function filtrarOfertas(params) {
  const query = params.toString();

  const url = query
    ? `${API_URL}/ofertas/filtrar?${query}`
    : `${API_URL}/ofertas`;

  const respuesta = await fetch(url);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudieron filtrar las ofertas');
  }

  return data;
}

export async function obtenerDetalleOferta(idOferta) {
  const respuesta = await fetch(`${API_URL}/ofertas/${idOferta}`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo cargar el detalle de la oferta');
  }

  return data;
}