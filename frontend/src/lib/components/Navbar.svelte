<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { authStore, cerrarSesion } from '$lib/stores/authStore.js';
  import logoKoruve from '$lib/assets/logo-koruve.png';

  const rutaActual = $derived(page.url.pathname);

  const estaEnRegistro = $derived(rutaActual === '/registro');
  const sesionActiva = $derived($authStore.autenticado === true);

  const nombreCuenta = $derived(
    $authStore.tipoCuenta === 'empresa'
      ? $authStore.datos?.nombre_empresa
      : $authStore.datos?.nombre_completo
  );

  const inicialCuenta = $derived(
    nombreCuenta ? nombreCuenta.charAt(0).toUpperCase() : 'K'
  );

  let menuAbierto = $state(false);

  function toggleMenu() {
    menuAbierto = !menuAbierto;
  }

  function irPanel() {
    menuAbierto = false;

    if ($authStore.tipoCuenta === 'empresa') {
      goto('/empresa/dashboard');
      return;
    }

    if ($authStore.tipoCuenta === 'usuario') {
      goto('/usuario/dashboard');
      return;
    }

    goto('/');
  }

  function irInicio() {
    menuAbierto = false;
    goto('/');
  }

  function salir() {
    menuAbierto = false;
    cerrarSesion();
    goto('/iniciar-sesion');
  }
</script>

<header class="main-navbar">
  <a class="navbar-brand" href="/">
    <img class="navbar-logo" src={logoKoruve} alt="Koruve" />
  </a>

  <nav class="navbar-links">
    <a href="/empleos">Empleos</a>
    <a href="/empresas">Empresas</a>
    <a href="/recursos">Recursos</a>
    <a href="/foro">Foro</a>
    <a href="/valoraciones">Valoraciones</a>
    <a href="/nosotros">Nosotros</a>
  </nav>

  <div class="navbar-action">
    {#if sesionActiva}
      <div class="profile-menu">
        <button class="profile-button" type="button" onclick={toggleMenu}>
          <span class="profile-avatar">{inicialCuenta}</span>
          <span class="profile-name">{nombreCuenta || 'Mi Cuenta'}</span>
          <span class="profile-arrow">⌄</span>
        </button>

        {#if menuAbierto}
          <div class="profile-dropdown">
            <button type="button" onclick={irInicio}>Ir al inicio</button>
            <button type="button" onclick={irPanel}>Ir al panel</button>
            <button type="button" onclick={salir}>Cerrar sesión</button>
          </div>
        {/if}
      </div>
    {:else if estaEnRegistro}
      <a class="nav-button" href="/iniciar-sesion">↪ Iniciar sesión</a>
    {:else}
      <a class="nav-button" href="/registro">↪ Regístrate</a>
    {/if}
  </div>
</header>