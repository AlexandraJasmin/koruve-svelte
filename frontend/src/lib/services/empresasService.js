const API_URL = 'http://localhost:3000/api';

export async function registrarEmpresa(datosEmpresa) {
  const respuesta = await fetch(`${API_URL}/empresas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosEmpresa)
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error al registrar empresa');
  }

  return data;
}