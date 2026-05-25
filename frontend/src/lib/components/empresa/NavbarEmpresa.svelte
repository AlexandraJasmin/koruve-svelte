<script>
  let {
    empresa = {
      nombre: 'Empresa',
      logo: ''
    }
  } = $props();

  const obtenerInicial = (nombre) => {
    return nombre ? nombre.charAt(0).toUpperCase() : 'E';
  };
</script>

<header class="topbar">
  <nav class="topnav">
    <a href="/empleos">Trabajos</a>
    <a href="/empresas">Empresas</a>
    <a href="/recursos">Recursos</a>
    <a href="/foro">Foro</a>
    <a href="/valoraciones">Valoraciones</a>
    <a href="/nosotros">Nosotros</a>
  </nav>

  <div class="account">
    <div class="company-avatar">
      {#if empresa.logo}
        <img src={empresa.logo} alt={empresa.nombre} />
      {:else}
        <span>{obtenerInicial(empresa.nombre)}</span>
      {/if}
    </div>
    <span>Mi Cuenta</span>
  </div>
</header>

<style>
  .topbar {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 54px;
  }

  .topnav {
    grid-column: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 46px;
  }

  .topnav a {
    text-decoration: none;
    color: #111827;
    font-weight: 700;
    font-size: 15px;
    white-space: nowrap;
  }

  .account {
    grid-column: 3;
    justify-self: end;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    color: #111827;
    font-size: 15px;
    white-space: nowrap;
  }

  .company-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #dfb9b0;
    color: #7c2d12;
    font-weight: 700;
    overflow: hidden;
    flex-shrink: 0;
  }

  .company-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 1100px) {
    .topbar {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .topnav {
      grid-column: 1;
      flex-wrap: wrap;
      gap: 22px;
      justify-content: flex-start;
    }

    .account {
      grid-column: 1;
      justify-self: start;
    }
  }
</style>