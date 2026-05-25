<script>
  import '../app.css';
  import { page } from '$app/state';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();

  const rutaActual = $derived(page.url.pathname);

  const esDashboard = $derived(
    rutaActual.startsWith('/empresa/dashboard') ||
      rutaActual.startsWith('/usuario/dashboard')
  );

  const mostrarNavbarFooter = $derived(!esDashboard);
</script>

{#if mostrarNavbarFooter}
  <Navbar />
{/if}

<main>
  {@render children()}
</main>

{#if mostrarNavbarFooter}
  <Footer />
{/if}