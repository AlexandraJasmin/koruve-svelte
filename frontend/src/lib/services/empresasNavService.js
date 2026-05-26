const API_URL = 'http://localhost:3001/api';

export async function obtenerEmpresas() {
  const respuesta = await fetch(`${API_URL}/empresas/listado`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudieron cargar las empresas');
  }

  return data;
}

export async function filtrarEmpresas(params) {
  const query = params.toString();

  const url = query
    ? `${API_URL}/empresas/listado/filtrar?${query}`
    : `${API_URL}/empresas/listado`;

  const respuesta = await fetch(url);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudieron filtrar las empresas');
  }

  return data;
}

export async function obtenerEmpresaPorId(idEmpresa) {
  const respuesta = await fetch(`${API_URL}/empresas/listado/${idEmpresa}`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo cargar la empresa');
  }

  return data;
}

export async function obtenerDetalleEmpresa(idEmpresa) {
  const respuesta = await fetch(`${API_URL}/empresas/listado/${idEmpresa}/detalle`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo cargar el detalle de la empresa');
  }

  return data;
}