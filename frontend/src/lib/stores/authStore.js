import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const sesionBase = {
  autenticado: false,
  tipoCuenta: null,
  token: null,
  datos: null
};

function obtenerSesionInicial() {
  if (!browser) return sesionBase;

  const sesion = localStorage.getItem('koruveSesion');

  if (!sesion) return sesionBase;

  try {
    return JSON.parse(sesion);
  } catch {
    return sesionBase;
  }
}

export const authStore = writable(obtenerSesionInicial());

export function guardarSesion(data) {
  let sesion = sesionBase;

  if (data.tipoCuenta === 'usuario') {
    sesion = {
      autenticado: true,
      tipoCuenta: 'usuario',
      token: data.token,
      datos: data.usuario
    };
  }

  if (data.tipoCuenta === 'empresa') {
    sesion = {
      autenticado: true,
      tipoCuenta: 'empresa',
      token: data.token,
      datos: data.empresa
    };
  }

  if (browser) {
    localStorage.setItem('koruveSesion', JSON.stringify(sesion));
  }

  authStore.set(sesion);
}

export function cerrarSesion() {
  if (browser) {
    localStorage.removeItem('koruveSesion');
  }

  authStore.set(sesionBase);
}