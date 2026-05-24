<script>
  import logoKoruve from '$lib/assets/logo-koruve.png';

  let { active = 'dashboard' } = $props();
</script>

<aside class="sidebar">
  <div class="brand">
    <img class="brand-logo-img" src={logoKoruve} alt="Koruve" />
  </div>

  <nav class="menu">
    <a class:active={active === 'dashboard'} href="/empresa/dashboard">Panel</a>
    <a class:active={active === 'crear'} href="/empresa/ofertas/crear">Publicar un Nuevo Empleo</a>
    <a class:active={active === 'ofertas'} href="/empresa/ofertas">Gestionar Empleos</a>
    <a class:active={active === 'aplicantes'} href="/empresa/ofertas">Todos los Solicitantes</a>
    <a href="/iniciar-sesion">Cerrar Sesión</a>
  </nav>
</aside>

<style>
  .sidebar {
    width: 300px;
    min-height: 100vh;
    background: #ffffff;
    padding: 34px 30px;
    box-shadow: 0 8px 30px rgba(20, 31, 56, 0.06);
    flex-shrink: 0;
  }

  .brand {
    margin-bottom: 46px;
  }

  .brand-logo-img {
    width: 205px;
    height: auto;
    display: block;
  }

  .menu {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .menu a {
    text-decoration: none;
    color: #667085;
    padding: 16px 18px;
    border-radius: 8px;
    font-size: 15px;
    text-align: center;
    transition: 0.2s ease;
  }

  .menu a.active,
  .menu a:hover {
    background: #dfb9b0;
    color: #9b5144;
  }
</style>