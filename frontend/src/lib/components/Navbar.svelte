<script>
  import { page } from '$app/state';

  const rutaActual = $derived(page.url.pathname);

  const estaEnRegistro = $derived(rutaActual === '/registro');
</script>

<header class="auth-navbar">
  <a class="brand" href="/">
    <div class="brand-icon">
      <span>Q</span>
    </div>

    <div class="brand-text">
      <h1>Koruve</h1>
      <p>TALENT NETWORKS</p>
    </div>
  </a>

  <nav class="nav-links">
    <a href="/empleos">Trabajos</a>
    <a href="/empresas">Empresas</a>
    <a href="/recursos">Recursos</a>
    <a href="/foro">Foro</a>
    <a href="/valoraciones">Valoraciones</a>
    <a href="/nosotros">Nosotros</a>
  </nav>

  {#if estaEnRegistro}
    <a class="nav-button" href="/iniciar-sesion">↪ Iniciar sesión</a>
  {:else}
    <a class="nav-button" href="/registro">↪ Regístrate</a>
  {/if}
</header>