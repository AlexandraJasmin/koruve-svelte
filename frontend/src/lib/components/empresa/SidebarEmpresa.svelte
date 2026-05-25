<script>
  import logoKoruve from '$lib/assets/logo-koruve.png';
  import {
    House,
    FilePlus,
    BriefcaseBusiness,
    UsersRound,
    LogOut
  } from '@lucide/svelte';

  let { active = 'dashboard' } = $props();
</script>

<aside class="sidebar">
  <div class="brand">
    <img class="brand-logo-img" src={logoKoruve} alt="Koruve" />
  </div>

  <nav class="menu">
    <a class:active={active === 'dashboard'} href="/empresa/dashboard">
      <House size={20} strokeWidth={1.8} />
      <span>Panel</span>
    </a>

    <a class:active={active === 'crear'} href="/empresa/ofertas/crear">
      <FilePlus size={20} strokeWidth={1.8} />
      <span>Publicar Nuevo Empleo</span>
    </a>

    <a class:active={active === 'ofertas'} href="/empresa/ofertas">
      <BriefcaseBusiness size={20} strokeWidth={1.8} />
      <span>Gestionar Empleos</span>
    </a>

    <a class:active={active === 'aplicantes'} href="/empresa/aplicantes">
        <UsersRound size={20} strokeWidth={1.8} />
        <span>Todos los Solicitantes</span>
    </a>

    <a href="/iniciar-sesion">
      <LogOut size={20} strokeWidth={1.8} />
      <span>Cerrar Sesión</span>
    </a>
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
    display: flex;
    align-items: center;
    gap: 14px;
    transition: 0.2s ease;
  }

  .menu a :global(svg) {
    flex-shrink: 0;
  }

  .menu a span {
    line-height: 1.3;
  }

  .menu a.active,
  .menu a:hover {
    background: #dfb9b0;
    color: #9b5144;
  }
</style>