const API_URL = 'http://localhost:3001/api';

export async function obtenerGuardadosUsuario(idUsuario) {
  const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}/guardados`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudieron cargar los empleos guardados');
  }

  return data;
}

export async function verificarGuardado(idUsuario, idOferta) {
  const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}/guardados/${idOferta}`);
  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo verificar el empleo guardado');
  }

  return data;
}

export async function guardarEmpleo(idUsuario, idOferta) {
  const respuesta = await fetch(`${API_URL}/guardados`, {
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
    throw new Error(data.mensaje || 'No se pudo guardar el empleo');
  }

  return data;
}

export async function eliminarGuardado(idGuardado) {
  const respuesta = await fetch(`${API_URL}/guardados/${idGuardado}`, {
    method: 'DELETE'
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo eliminar el empleo guardado');
  }

  return data;
}

export async function eliminarGuardadoPorUsuarioYOferta(idUsuario, idOferta) {
  const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}/guardados/${idOferta}`, {
    method: 'DELETE'
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'No se pudo eliminar el empleo guardado');
  }

  return data;
}