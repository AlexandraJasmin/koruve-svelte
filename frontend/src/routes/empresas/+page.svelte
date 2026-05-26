<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import {
    obtenerEmpresas,
    filtrarEmpresas
  } from '$lib/services/empresasNavService.js';

  let empresas = $state([]);
  let cargando = $state(false);
  let error = $state('');

  let busqueda = $state('');
  let ciudad = $state('');
  let categoria = $state('');
  let orden = $state('recientes');
  let limite = $state('10');

  const categorias = [
    'Tecnología',
    'Diseño y Marketing',
    'Finanzas',
    'Comercio',
    'Telecomunicaciones',
    'Restaurante',
    'Software'
  ];

  function formatearFechaRegistro(fecha) {
    if (!fecha) return 'Fecha no disponible';

    const hoy = new Date();
    const registrada = new Date(fecha);
    const diferenciaMs = hoy - registrada;
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

    if (dias < 1) return 'Hoy';
    if (dias === 1) return 'Hace 1 día';
    if (dias < 7) return `Hace ${dias} días`;

    const semanas = Math.floor(dias / 7);

    if (semanas === 1) return 'Hace 1 semana';
    if (semanas < 5) return `Hace ${semanas} semanas`;

    const meses = Math.floor(dias / 30);

    if (meses === 1) return 'Hace 1 mes';

    return `Hace ${meses} meses`;
  }

  function crearParametros() {
    const params = new URLSearchParams();

    if (busqueda.trim()) params.set('busqueda', busqueda.trim());
    if (ciudad.trim()) params.set('ciudad', ciudad.trim());
    if (categoria.trim()) params.set('categoria', categoria.trim());
    if (orden.trim()) params.set('orden', orden.trim());
    if (limite.trim()) params.set('limite', limite.trim());

    return params;
  }

  async function cargarEmpresas() {
    cargando = true;
    error = '';

    try {
      empresas = await obtenerEmpresas();
    } catch (err) {
      console.error('Error al cargar empresas:', err);
      error = err.message || 'No se pudieron cargar las empresas.';
      empresas = [];
    } finally {
      cargando = false;
    }
  }

  async function buscarEmpresas() {
    cargando = true;
    error = '';

    try {
      const params = crearParametros();
      empresas = await filtrarEmpresas(params);
    } catch (err) {
      console.error('Error al buscar empresas:', err);
      error = err.message || 'No se pudieron filtrar las empresas.';
      empresas = [];
    } finally {
      cargando = false;
    }
  }

  function irDetalleEmpresa(idEmpresa) {
    goto(`/empresas/${idEmpresa}`);
  }

  onMount(() => {
    cargarEmpresas();
  });
</script>

<svelte:head>
  <title>Empresas | Koruve</title>
</svelte:head>

<section class="container-fluid py-5 hero-empresas">
  <div class="container text-center py-4">
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb justify-content-center mb-0">
        <li class="breadcrumb-item">
          <a href="/" class="text-decoration-none text-muted">Home</a>
        </li>

        <li class="breadcrumb-item active text-dark fw-semibold" aria-current="page">
          Empresas
        </li>
      </ol>
    </nav>

    <h1 class="mb-2 fw-bold">Empresas</h1>
    <p class="text-muted mb-0">
      Explora empresas destacadas y conoce sus vacantes disponibles.
    </p>
  </div>
</section>

<section class="container py-5">
  <div class="row g-4">
    <div class="col-lg-4">
      <div class="rounded-4 p-4 filtros-box">
        <h5 class="fw-bold mb-4">Buscar por filtros</h5>

        <div class="mb-4">
          <label class="form-label fw-semibold" for="busquedaEmpresaInput">
            Buscar por palabras clave
          </label>

          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>

            <input
              id="busquedaEmpresaInput"
              type="text"
              class="form-control border-start-0"
              placeholder="Nombre de empresa, categoría o palabra clave"
              bind:value={busqueda}
            >
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold" for="ciudadEmpresaInput">
            Ubicación
          </label>

          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-geo-alt text-muted"></i>
            </span>

            <input
              id="ciudadEmpresaInput"
              type="text"
              class="form-control border-start-0"
              placeholder="Ciudad"
              bind:value={ciudad}
            >
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold" for="categoriaEmpresaSelect">
            Categoría
          </label>

          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-briefcase text-muted"></i>
            </span>

            <select
              id="categoriaEmpresaSelect"
              class="form-select border-start-0 text-muted"
              bind:value={categoria}
            >
              <option value="">Elige una categoría</option>

              {#each categorias as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="mt-4">
          <button
            class="btn text-white w-100 py-3 fw-semibold rounded-3"
            type="button"
            onclick={buscarEmpresas}
          >
            Buscar empresas
          </button>
        </div>
      </div>
    </div>

    <div class="col-lg-8">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 resumen-listado">
        <p class="mb-0 text-muted">
          {#if empresas.length === 0}
            Mostrando 0 empresas
          {:else}
            Mostrando 1 - {empresas.length} de {empresas.length} empresas
          {/if}
        </p>

        <div class="d-flex gap-3 flex-wrap">
          <select
            class="form-select text-muted"
            style="width:150px;"
            bind:value={orden}
            onchange={buscarEmpresas}
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguas">Más antiguas</option>
            <option value="az">A - Z</option>
          </select>

          <select
            class="form-select text-muted"
            style="width:120px;"
            bind:value={limite}
            onchange={buscarEmpresas}
          >
            <option value="10">Mostrar 10</option>
            <option value="20">Mostrar 20</option>
            <option value="30">Mostrar 30</option>
          </select>
        </div>
      </div>

      {#if cargando}
        <div class="alert alert-light border rounded-4">
          Cargando empresas...
        </div>
      {:else if error}
        <div class="alert alert-danger rounded-4">
          {error}
        </div>
      {:else if empresas.length === 0}
        <div class="alert alert-light border rounded-4">
          No se encontraron empresas con esos filtros.
        </div>
      {:else}
        {#each empresas as empresa}
          <div
            class="card empresa-card rounded-4 p-4 mb-4"
            role="button"
            tabindex="0"
            onclick={() => irDetalleEmpresa(empresa.id_empresa)}
            onkeydown={(event) => event.key === 'Enter' && irDetalleEmpresa(empresa.id_empresa)}
          >
            <div class="d-flex justify-content-between flex-wrap gap-3">
              <div class="d-flex gap-3">
                <img
                  src={empresa.logo || '/img/logo.png'}
                  alt={empresa.nombre_empresa || 'Empresa'}
                  class="rounded-circle"
                  style="width:55px; height:55px; object-fit:cover;"
                >

                <div>
                  <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h5 class="fw-bold mb-0">
                      {empresa.nombre_empresa || 'Empresa sin nombre'}
                    </h5>

                    {#if empresa.emp_destacada}
                      <span class="badge rounded-pill px-3 py-2 badge-custom badge-destacada">
                        Destacada
                      </span>
                    {/if}

                    <span class="badge rounded-pill px-3 py-2 badge-custom badge-vacantes">
                      Vacantes abiertas — {Number(empresa.vacantes_abiertas || 0)}
                    </span>
                  </div>

                  <p class="text-muted mb-3 empresa-meta">
                    {empresa.categoria || 'Sin categoría'}
                    · {empresa.ciudad || 'Sin ciudad'}{empresa.pais ? `, ${empresa.pais}` : ''}
                    · {formatearFechaRegistro(empresa.fecha_registro)}
                  </p>

                  <p class="text-muted mb-0 empresa-desc">
                    {empresa.descripcion || 'Sin descripción disponible.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</section>

<style>
  :global(body) {
    background-color: #f8f9fb;
    font-size: 14px;
    color: #1f2937;
  }

  .hero-empresas {
    background: linear-gradient(90deg, #eef2f8 0%, #eaf0fb 100%);
  }

  .hero-empresas h1 {
    font-size: 30px;
  }

  .hero-empresas p,
  .hero-empresas .breadcrumb,
  .hero-empresas .breadcrumb-item a,
  .hero-empresas .breadcrumb-item {
    font-size: 13px;
  }

  .filtros-box {
    background-color: #f1f5fb;
  }

  .filtros-box label,
  .filtros-box .form-control,
  .filtros-box .form-select,
  .filtros-box .input-group-text {
    font-size: 13px;
  }

  .filtros-box h5 {
    font-size: 18px;
  }

  .filtros-box button {
    background-color: #2c3b4e;
  }

  .filtros-box button:hover {
    background-color: #1f2937;
  }

  .resumen-listado,
  .resumen-listado .form-select {
    font-size: 13px;
  }

  .empresa-card {
    border: 1px solid #e6eaf0;
    transition: 0.2s ease;
    cursor: pointer;
  }

  .empresa-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .empresa-card h5 {
    font-size: 18px;
  }

  .empresa-card .empresa-meta {
    font-size: 12px;
  }

  .empresa-card .empresa-desc {
    font-size: 13px;
    line-height: 1.6;
  }

  .badge-custom {
    font-size: 12px;
    font-weight: 400;
  }

  .badge-destacada {
    background-color: #ddf6e6;
    color: #5cbf7a;
  }

  .badge-vacantes {
    background-color: #ddebff;
    color: #5095ff;
  }

  .empresa-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>