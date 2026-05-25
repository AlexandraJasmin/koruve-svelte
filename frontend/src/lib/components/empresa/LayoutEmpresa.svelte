<script>
  import SidebarEmpresa from './SidebarEmpresa.svelte';
  import NavbarEmpresa from './NavbarEmpresa.svelte';

  let {
    active = 'dashboard',
    empresa = {
      nombre: 'Empresa',
      logo: ''
    },
    children
  } = $props();
</script>

<div class="empresa-page">
  <SidebarEmpresa {active} />

  <main class="content">
    <NavbarEmpresa {empresa} />
    {@render children()}
  </main>
</div>

<style>
  .empresa-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    background: #f5f7fc;
    color: #273044;
    font-family: Arial, sans-serif;
  }

  .content {
    flex: 1;
    width: calc(100vw - 300px);
    padding: 34px 52px 54px;
    overflow-x: hidden;
  }
</style>