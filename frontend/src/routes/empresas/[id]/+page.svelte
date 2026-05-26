<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  import { obtenerDetalleEmpresa } from '$lib/services/empresasNavService.js';

  let empresa = $state(null);
  let empleos = $state([]);
  let redes = $state([]);
  let resenas = $state([]);
  let resumenValoraciones = $state({
    promedio: 0,
    total_resenas: 0
  });

  let cargando = $state(false);
  let error = $state('');

  function formatearFechaRelativa(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';

    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diffMs = ahora - fecha;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) return 'Hace unos minutos';
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
    if (diffDias === 1) return 'Hace 1 día';

    return `Hace ${diffDias} días`;
  }

  function formatearSalario(salario) {
    if (salario === null || salario === undefined || salario === '') {
      return 'No especificado';
    }

    return '$' + Number(salario).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function anioFundacion(fecha) {
    if (!fecha) return 'No especificado';
    return new Date(fecha).getFullYear();
  }

  function obtenerMapaURL() {
    const ubicacion = `${empresa?.direccion_completa || empresa?.ciudad || 'San Salvador'} ${empresa?.pais || 'El Salvador'}`;

    return `https://maps.google.com/maps?q=${encodeURIComponent(ubicacion)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }

  function obtenerMapaLink() {
    const ubicacion = `${empresa?.direccion_completa || empresa?.ciudad || 'San Salvador'} ${empresa?.pais || 'El Salvador'}`;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`;
  }

  function renderizarEstrellas(calificacion) {
    const valor = Math.round(Number(calificacion || 0));
    return Array.from({ length: 5 }, (_, index) => index < valor);
  }

  async function cargarDetalleEmpresa() {
    cargando = true;
    error = '';

    try {
      const paginaActual = get(page);
      const idEmpresa = paginaActual.params.id;

      const data = await obtenerDetalleEmpresa(idEmpresa);

      empresa = data.empresa;
      empleos = data.empleos || [];
      redes = data.redes || [];
      resenas = data.resenas || [];
      resumenValoraciones = data.resumen_valoraciones || {
        promedio: 0,
        total_resenas: 0
      };
    } catch (err) {
      console.error('Error al cargar detalle de empresa:', err);
      error = err.message || 'No se pudo cargar el detalle de la empresa.';
    } finally {
      cargando = false;
    }
  }

  function irDetalleEmpleo(idOferta) {
    goto(`/empleos/${idOferta}`);
  }

  function volverEmpresas() {
    goto('/empresas');
  }

  onMount(() => {
    cargarDetalleEmpresa();
  });
</script>

<svelte:head>
  <title>{empresa ? `${empresa.nombre_empresa} | Koruve` : 'Detalle de empresa | Koruve'}</title>
</svelte:head>

{#if cargando}
  <section class="container py-5">
    <div class="alert alert-light border rounded-4">
      Cargando detalle de empresa...
    </div>
  </section>
{:else if error}
  <section class="container py-5">
    <div class="alert alert-danger rounded-4">
      {error}
    </div>

    <button class="btn btn-outline-secondary mt-3" type="button" onclick={volverEmpresas}>
      Volver a empresas
    </button>
  </section>
{:else if empresa}
  <section class="container-fluid py-5 hero-detalle-empresa">
    <div class="container text-center py-4">
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb justify-content-center mb-0">
          <li class="breadcrumb-item">
            <a href="/" class="text-decoration-none text-muted">Home</a>
          </li>

          <li class="breadcrumb-item">
            <a href="/empresas" class="text-decoration-none text-muted">Empresas</a>
          </li>

          <li class="breadcrumb-item active text-dark fw-semibold" aria-current="page">
            {empresa.nombre_empresa}
          </li>
        </ol>
      </nav>

      <br>

      <img
        src={empresa.logo || '/img/logo.png'}
        alt={empresa.nombre_empresa || 'Empresa'}
        class="rounded-4 mb-3 empresa-logo-header"
      >

      <h2 class="fw-semibold mb-2">
        {empresa.nombre_empresa}
      </h2>

      <span class="badge rounded-pill px-3 py-2 fw-normal badge-vacantes">
        Vacantes abiertas — {empleos.length}
      </span>
    </div>
  </section>

  <section class="container py-5">
    <div class="row g-4 align-items-start">
      <div class="col-lg-4">
        <div class="card border-0 rounded-4 p-4 mb-4 sidebar-card">
          <div class="d-flex justify-content-between mb-3">
            <span class="fw-semibold">Tamaño de empresa:</span>
            <span class="text-muted text-end">{empresa.tamano_equipo || 'No especificado'}</span>
          </div>

          <div class="d-flex justify-content-between mb-3">
            <span class="fw-semibold">Fundada en:</span>
            <span class="text-muted text-end">{anioFundacion(empresa.fecha_fundacion)}</span>
          </div>

          <div class="d-flex justify-content-between mb-3">
            <span class="fw-semibold">Teléfono:</span>
            <span class="text-muted text-end">{empresa.telefono || 'No especificado'}</span>
          </div>

          <div class="d-flex justify-content-between mb-3">
            <span class="fw-semibold">Correo:</span>
            <span class="text-muted text-end">{empresa.correo || 'No especificado'}</span>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4">
            <span class="fw-semibold">Redes sociales:</span>

            <div class="d-flex gap-3">
              {#if redes.length === 0}
                <span class="text-muted">No disponible</span>
              {:else}
                {#each redes as red}
                  <a href={red.url_red} target="_blank" rel="noopener noreferrer" class="text-muted">
                    <i class="bi bi-globe"></i>
                  </a>
                {/each}
              {/if}
            </div>
          </div>

          {#if empresa.sitio_web}
            <a
              href={empresa.sitio_web}
              target="_blank"
              rel="noopener noreferrer"
              class="btn w-100 py-3 fw-semibold rounded-3 site-btn"
            >
              Sitio web
            </a>
          {:else}
            <button class="btn w-100 py-3 fw-semibold rounded-3 site-btn" type="button" disabled>
              Sitio no disponible
            </button>
          {/if}
        </div>

        <div class="card border-0 rounded-4 p-4 sidebar-card">
          <h5 class="fw-semibold mb-3">Ubicación de empresa</h5>

          <div class="mb-2 d-flex justify-content-between">
            <span class="fw-semibold">País:</span>
            <span class="text-muted text-end">{empresa.pais || 'No especificado'}</span>
          </div>

          <div class="mb-2 d-flex justify-content-between">
            <span class="fw-semibold">Ciudad:</span>
            <span class="text-muted text-end">{empresa.ciudad || 'No especificada'}</span>
          </div>

          <div class="mb-3">
            <span class="fw-semibold d-block mb-1">Dirección completa:</span>
            <span class="text-muted">{empresa.direccion_completa || 'No especificada'}</span>
          </div>

          <div class="rounded-4 overflow-hidden mb-3" style="height:190px;">
            <iframe
              src={obtenerMapaURL()}
              width="100%"
              height="100%"
              style="border:0;"
              title="Mapa de empresa"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>

          <div class="text-center">
            <a
              href={obtenerMapaLink()}
              target="_blank"
              rel="noopener noreferrer"
              class="text-decoration-none"
              style="color:#2F73D9;"
            >
              Ver mapa
            </a>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="mb-5">
          <h4 class="fw-semibold mb-3">Acerca de la empresa</h4>

          <p class="text-muted mb-0 descripcion-empresa">
            {empresa.descripcion || 'Sin descripción disponible.'}
          </p>
        </div>

        <div class="mb-5">
          <h4 class="fw-semibold mb-1">
            {empleos.length} empleos en {empresa.nombre_empresa}
          </h4>

          <p class="text-muted mb-4" style="font-size:13px;">
            {empleos.length} empleos activos
          </p>

          {#if empleos.length === 0}
            <div class="card border rounded-4 p-4">
              <p class="text-muted mb-0">
                No hay empleos activos en esta empresa.
              </p>
            </div>
          {:else}
            {#each empleos as empleo}
              <div
                class="card border rounded-4 p-4 mb-3 empleo-card"
                role="button"
                tabindex="0"
                onclick={() => irDetalleEmpleo(empleo.id_oferta)}
                onkeydown={(event) => event.key === 'Enter' && irDetalleEmpleo(empleo.id_oferta)}
              >
                <div class="d-flex gap-3">
                  <img
                    src={empresa.logo || '/img/logo.png'}
                    alt={empresa.nombre_empresa}
                    class="rounded"
                    style="width:42px; height:42px; object-fit:cover;"
                  >

                  <div class="w-100">
                    <h6 class="fw-semibold mb-2">
                      {empleo.titulo}
                    </h6>

                    <div class="d-flex flex-wrap gap-3 text-muted mb-2 empleo-meta">
                      <span>
                        <i class="bi bi-briefcase me-1"></i>
                        {empresa.nombre_empresa}
                      </span>

                      <span>
                        <i class="bi bi-geo-alt me-1"></i>
                        {empleo.ciudad || 'Sin ciudad'}, {empleo.pais || 'Sin país'}
                      </span>

                      <span>
                        <i class="bi bi-clock me-1"></i>
                        {formatearFechaRelativa(empleo.fecha_publicacion)}
                      </span>

                      <span>
                        <i class="bi bi-cash-stack me-1"></i>
                        {formatearSalario(empleo.salario)}
                      </span>
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                      <span class="badge rounded-pill fw-normal px-3 py-2 badge-tipo">
                        {empleo.tipo_contrato || 'No especificado'}
                      </span>

                      {#if empleo.modalidad}
                        <span class="badge rounded-pill fw-normal px-3 py-2 badge-modalidad">
                          {empleo.modalidad}
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>

        <div class="container py-4">
          <div class="text-center mb-4">
            <h4 class="fw-semibold mb-2 valoraciones-title">
              Valoraciones de empleados
            </h4>

            <p class="text-muted mb-0" style="font-size:14px;">
              Conoce la experiencia de quienes han trabajado en esta empresa
            </p>
          </div>

          <div class="card border rounded-4 p-4 mb-4 shadow-sm rating-card">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h4 class="fw-bold mb-2" style="font-size:22px;">
                  {resumenValoraciones.promedio || 0}/5
                </h4>

                <p class="text-muted mb-0" style="font-size:14px;">
                  Basado en {resumenValoraciones.total_resenas || 0} reseñas
                </p>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  class="btn btn-outline-secondary px-3 py-2"
                  style="font-size:13px;"
                >
                  Ver todas las reseñas
                </button>

                <button
                  type="button"
                  class="btn text-white px-3 py-2"
                  style="background-color:#2C3B4E; font-size:13px;"
                >
                  Escribir reseña
                </button>
              </div>
            </div>
          </div>

          {#if resenas.length === 0}
            <div class="card border-0 shadow-sm rounded-4 p-4">
              <p class="text-muted mb-0">
                Esta empresa aún no tiene valoraciones.
              </p>
            </div>
          {:else}
            {#each resenas as resena}
              <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
                  <div class="static-stars d-flex gap-1">
                    {#each renderizarEstrellas(resena.calificacion_general) as llena}
                      <i class={llena ? 'bi bi-star-fill' : 'bi bi-star'}></i>
                    {/each}
                  </div>

                  <span class="fw-semibold" style="font-size:14px; color:#F4B740">
                    {resena.calificacion_general}
                  </span>

                  <span class="badge rounded-pill px-3 py-2 badge-modalidad">
                    {resena.tipo_experiencia || 'Neutral'}
                  </span>
                </div>

                <h4 class="fw-semibold mb-3" style="font-size:18px;">
                  {resena.tipo_experiencia || 'Experiencia en la empresa'}
                </h4>

                <p class="text-muted mb-3 descripcion-empresa">
                  {resena.comentario || 'Sin comentario'}
                </p>

                <p class="text-muted mb-4" style="font-size:14px;">
                  {resena.puesto || 'Sin puesto'} · {formatearFechaRelativa(resena.fecha_valoracion)}
                </p>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  :global(body) {
    background-color: #f8f9fb;
    font-size: 14px;
    color: #1f2937;
  }

  .hero-detalle-empresa {
    background: linear-gradient(90deg, #eef2f8 0%, #eaf0fb 100%);
  }

  .empresa-logo-header {
    width: 76px;
    height: 76px;
    object-fit: cover;
  }

  .badge-vacantes {
    background-color: #ddebff;
    color: #5095ff;
    font-size: 12px;
  }

  .sidebar-card {
    background-color: #f1f5fb;
  }

  .site-btn {
    background-color: #ddebff;
    color: #2f73d9;
    font-size: 13px;
    border: none;
  }

  .site-btn:hover {
    background-color: #cfe1ff;
    color: #1f5fc0;
  }

  .descripcion-empresa {
    font-size: 13px;
    line-height: 1.8;
  }

  .empleo-card {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .empleo-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  }

  .empleo-meta {
    font-size: 12px;
  }

  .badge-tipo {
    background: #ddebff;
    color: #5095ff;
    font-size: 11px;
  }

  .badge-modalidad {
    background: #fff0d7;
    color: #f4a62a;
    font-size: 11px;
  }

  .valoraciones-title {
    font-size: 28px;
  }

  .rating-card {
    background: #d3d3d3;
  }

  .static-stars {
    color: #f4b740;
  }
</style>