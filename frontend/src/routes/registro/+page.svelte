<script>
 import { goto } from '$app/navigation';
 import { registrarUsuario } from '$lib/services/usuariosService.js';
 import { registrarEmpresa } from '$lib/services/empresasService.js';
 import { loginUsuario, loginEmpresa } from '$lib/services/authService.js';
 import { guardarSesion } from '$lib/stores/authStore.js';
  let tipoCuenta = $state('usuario');

  let nombre_completo = $state('');
  let nombre_empresa = $state('');
  let correo = $state('');
  let password = $state('');
  let confirmarPassword = $state('');
  let aceptaTerminos = $state(false);

  let mostrarPassword = $state(false);
  let mostrarConfirmar = $state(false);
  let cargando = $state(false);
  let error = $state('');
  let mensaje = $state('');

  async function registrar(event) {
    event.preventDefault();

    error = '';
    mensaje = '';

    if (password !== confirmarPassword) {
      error = 'Las contraseñas no coinciden';
      return;
    }

    if (!aceptaTerminos) {
      error = 'Debes aceptar la política de privacidad y términos de uso';
      return;
    }

    cargando = true;

    try {
     if (tipoCuenta === 'usuario') {
  await registrarUsuario({
    nombre_completo,
    correo,
    password,
    telefono: '',
    profesion: '',
    experiencia: '',
    nivel_educativo: '',
    habilidades: '',
    ubicacion: ''
  });

  const sesion = await loginUsuario({
    correo,
    password
  });

  guardarSesion(sesion);

  mensaje = 'Registro de candidato realizado correctamente';

  setTimeout(() => {
    goto('/usuario/dashboard');
  }, 700);
}

if (tipoCuenta === 'empresa') {
  await registrarEmpresa({
    nombre_empresa,
    correo,
    password,
    telefono: '',
    rubro: '',
    descripcion: '',
    ubicacion: '',
    sitio_web: ''
  });

  const sesion = await loginEmpresa({
    correo,
    password
  });

  guardarSesion(sesion);

  mensaje = 'Registro de empresa realizado correctamente';

  setTimeout(() => {
    goto('/empresa/dashboard');
  }, 700);
}
 } catch (err) {
    error = err.message;
  } finally {
    cargando = false;
  }
}
</script>

<section class="auth-section">
  <div class="auth-heading">
    <h1>Registra tu cuenta</h1>

    {#if tipoCuenta === 'usuario'}
      <p>Crea tu cuenta para encontrar empleo y aplicar a las mejores oportunidades disponibles</p>
    {:else}
      <p>Crea tu cuenta para gestionar ofertas de empleo y contratar candidatos calificados</p>
    {/if}
  </div>

  <form class="auth-card register-card" onsubmit={registrar}>
    <a href="/" class="close-button">×</a>

    <div class="account-tabs">
      <button
        type="button"
        class:active={tipoCuenta === 'usuario'}
        onclick={() => (tipoCuenta = 'usuario')}
      >
        Candidato
      </button>

      <button
        type="button"
        class:active={tipoCuenta === 'empresa'}
        onclick={() => (tipoCuenta = 'empresa')}
      >
        Empresa
      </button>
    </div>

    {#if tipoCuenta === 'usuario'}
      <label for="nombre_completo">Nombre Completo</label>
      <input
        id="nombre_completo"
        type="text"
        bind:value={nombre_completo}
        placeholder="Ingresa tu nombre completo"
        required
      />
    {:else}
      <label for="nombre_empresa">Nombre de la empresa</label>
      <input
        id="nombre_empresa"
        type="text"
        bind:value={nombre_empresa}
        placeholder="Ingresa el nombre de la empresa"
        required
      />
    {/if}

    <label for="correo">Correo</label>
    <input
      id="correo"
      type="email"
      bind:value={correo}
      placeholder="Ingresa tu correo electrónico"
      required
    />

    <label for="password">Contraseña</label>
    <div class="password-wrapper">
      <input
        id="password"
        type={mostrarPassword ? 'text' : 'password'}
        bind:value={password}
        placeholder="Crea una contraseña"
        required
      />

      <button type="button" onclick={() => (mostrarPassword = !mostrarPassword)}>
        👁
      </button>
    </div>

    <label for="confirmarPassword">Confirmar contraseña</label>
    <div class="password-wrapper">
      <input
        id="confirmarPassword"
        type={mostrarConfirmar ? 'text' : 'password'}
        bind:value={confirmarPassword}
        placeholder="Repite la contraseña"
        required
      />

      <button type="button" onclick={() => (mostrarConfirmar = !mostrarConfirmar)}>
        👁
      </button>
    </div>

    <label class="checkbox-label terms">
      <input type="checkbox" bind:checked={aceptaTerminos} />
      Acepto la política de privacidad y términos de uso
    </label>

    {#if error}
      <p class="error-message">{error}</p>
    {/if}

    {#if mensaje}
      <p class="success-message">{mensaje}</p>
    {/if}

    <button class="submit-button" type="submit" disabled={cargando}>
      {cargando ? 'Registrando...' : 'Registrarse'}
    </button>

    <div class="divider">
      <span></span>
      <p>o regístrate con</p>
      <span></span>
    </div>

    <button class="google-button" type="button">
      <strong>G</strong>
      Continuar con Google
    </button>

    <p class="bottom-text">
      ¿Ya tienes una cuenta?
      <a href="/iniciar-sesion">Iniciar sesión</a>
    </p>
  </form>
</section>