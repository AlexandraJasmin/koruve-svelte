<script>
  import SidebarEmpresa from './SidebarEmpresa.svelte';

  let { active = '' } = $props();
</script>

<div class="dashboard-page">
  <SidebarEmpresa {active} />

  <main class="content">
    <slot />
  </main>
</div>

<style>
  .dashboard-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    background: #f5f7fc;
    color: #273044;
    font-family: Arial, sans-serif;
  }

  .content {
    flex: 1;
    width: calc(100vw - 280px);
    padding: 42px 52px 54px;
    overflow-x: hidden;
  }

  @media (max-width: 900px) {
    .dashboard-page {
      flex-direction: column;
    }

    .content {
      width: 100%;
      padding: 28px 22px 40px;
    }
  }
</style>