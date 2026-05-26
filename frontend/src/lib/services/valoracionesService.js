const API_URL = 'http://localhost:3000/api';

export async function obtenerValoraciones({
  busqueda = '',
  calificacion = '',
  fecha = '',
  tipo_experiencia = '',
  orden = 'recientes'
} = {}) {
  const params = new URLSearchParams();

  if (busqueda) params.append('busqueda', busqueda);
  if (calificacion) params.append('calificacion', calificacion);
  if (fecha) params.append('fecha', fecha);
  if (tipo_experiencia && tipo_experiencia !== 'todos') {
    params.append('tipo_experiencia', tipo_experiencia);
  }
  if (orden) params.append('orden', orden);

  const url = `${API_URL}/valoraciones${params.toString() ? `?${params.toString()}` : ''}`;

  const respuesta = await fetch(url);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al cargar valoraciones');
  }

  return data;
}

export async function obtenerResumenValoraciones() {
  const respuesta = await fetch(`${API_URL}/valoraciones/resumen`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al cargar resumen');
  }

  return data;
}

export async function crearValoracion(datosValoracion) {
  const respuesta = await fetch(`${API_URL}/valoraciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosValoracion)
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al crear valoración');
  }

  return data;
}