<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  import {
    obtenerOfertas,
    filtrarOfertas
  } from '$lib/services/ofertasService.js';

  let ofertas = $state([]);
  let cargando = $state(false);
  let error = $state('');

  let busqueda = $state('');
  let ciudad = $state('');
  let categoria = $state('');
  let salarioMax = $state(15000);
  let fecha = $state('todas');
  let tiposSeleccionados = $state([]);

  const categorias = [
    'Tecnología',
    'Diseño y Marketing',
    'Análisis de Datos',
    'Soporte Técnico',
    'Desarrollo de Software',
    'Diseño Gráfico'
  ];

  const tipos = [
    'Tiempo completo',
    'Medio tiempo',
    'Temporal',
    'Freelance'
  ];

  function formatearSalario(salario) {
    if (salario === null || salario === undefined || salario === '') {
      return 'No especificado';
    }

    return '$' + Number(salario).toLocaleString('en-US');
  }

  function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';

    const hoy = new Date();
    const fechaPublicacion = new Date(fechaISO);
    const diferenciaMs = hoy - fechaPublicacion;
    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));

    if (horas < 1) return 'Hace unos minutos';
    if (horas < 24) return `Hace ${horas} horas`;

    const dias = Math.floor(horas / 24);

    if (dias === 1) return 'Hace 1 día';

    return `Hace ${dias} días`;
  }

  function cargarFiltrosDesdeURL() {
    const paginaActual = get(page);
    const params = paginaActual.url.searchParams;

    busqueda = params.get('busqueda') || '';
    ciudad = params.get('ciudad') || '';
    categoria = params.get('categoria') || '';
    salarioMax = Number(params.get('salarioMax') || 15000);
    fecha = params.get('fecha') || 'todas';
    tiposSeleccionados = params.getAll('tipo');
  }

  function crearParametros() {
    const params = new URLSearchParams();

    if (busqueda.trim() !== '') {
      params.set('busqueda', busqueda.trim());
    }

    if (ciudad.trim() !== '') {
      params.set('ciudad', ciudad.trim());
    }

    if (categoria.trim() !== '') {
      params.set('categoria', categoria.trim());
    }

    if (Number(salarioMax) !== 15000) {
      params.set('salarioMax', salarioMax);
    }

    if (fecha !== 'todas') {
      params.set('fecha', fecha);
    }

    tiposSeleccionados.forEach((tipo) => {
      params.append('tipo', tipo);
    });

    return params;
  }

  async function cargarOfertas() {
    cargando = true;
    error = '';

    try {
      ofertas = await obtenerOfertas();
    } catch (err) {
      console.error('Error al cargar ofertas:', err);
      error = err.message || 'No se pudieron cargar los empleos.';
    } finally {
      cargando = false;
    }
  }

  async function buscarOfertas(event) {
    if (event) {
      event.preventDefault();
    }

    cargando = true;
    error = '';

    try {
      const params = crearParametros();
      const query = params.toString();

      ofertas = await filtrarOfertas(params);

      if (query) {
        await goto(`/empleos?${query}`, {
          replaceState: true,
          noScroll: true
        });
      } else {
        await goto('/empleos', {
          replaceState: true,
          noScroll: true
        });
      }
    } catch (err) {
      console.error('Error al buscar ofertas:', err);
      error = err.message || 'No se pudieron filtrar los empleos.';
    } finally {
      cargando = false;
    }
  }

  function toggleTipo(tipo) {
    if (tiposSeleccionados.includes(tipo)) {
      tiposSeleccionados = tiposSeleccionados.filter((item) => item !== tipo);
    } else {
      tiposSeleccionados = [...tiposSeleccionados, tipo];
    }
  }

  async function aplicarFiltros() {
    await buscarOfertas();
  }

  function irDetalle(idOferta) {
    goto(`/empleos/${idOferta}`);
  }

  onMount(async () => {
    cargarFiltrosDesdeURL();

    if (
      busqueda ||
      ciudad ||
      categoria ||
      tiposSeleccionados.length > 0 ||
      fecha !== 'todas' ||
      Number(salarioMax) !== 15000
    ) {
      await buscarOfertas();
    } else {
      await cargarOfertas();
    }
  });
</script>

<svelte:head>
  <title>Empleos | Koruve</title>
</svelte:head>


<section class="container-fluid py-5 hero-search-section">
  <div class="container">
    <div class="container mb-3">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb small mb-2">
          <li class="breadcrumb-item">
            <a href="/" class="text-decoration-none text-muted">Inicio</a>
          </li>

          <li class="breadcrumb-item active text-dark fw-semibold">
            Empleos
          </li>
        </ol>
      </nav>
    </div>

    <form class="bg-white hero-search-box shadow-sm p-4" onsubmit={buscarOfertas}>
      <div class="row align-items-center g-0">
        <div class="col-md-4 border-end">
          <div class="d-flex align-items-center px-3">
            <i class="bi bi-search text-muted me-3"></i>

            <input
              type="text"
              class="form-control border-0 shadow-none search-input"
              placeholder="Puesto, palabra clave o empresa"
              bind:value={busqueda}
            >
          </div>
        </div>

        <div class="col-md-3 border-end">
          <div class="d-flex align-items-center px-3">
            <i class="bi bi-geo-alt text-muted me-3"></i>

            <input
              type="text"
              class="form-control border-0 shadow-none search-input"
              placeholder="Ciudad"
              bind:value={ciudad}
            >
          </div>
        </div>

        <div class="col-md-3 border-end">
          <div class="px-3">
            <div class="input-group">
              <span class="input-group-text bg-white border-0">
                <i class="bi bi-briefcase text-muted"></i>
              </span>

              <select class="form-select border-0 shadow-none text-muted" bind:value={categoria}>
                <option value="">Todas las categorías</option>

                {#each categorias as item}
                  <option value={item}>{item}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="col-md-2">
          <div class="px-3">
            <button class="btn text-white w-100 py-3 fw-semibold rounded-3 search-btn" type="submit">
              Buscar empleos
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</section>

<section class="container my-5">
  <div class="row g-4">
    <div class="col-lg-4">
      <div class="filter-panel p-4 h-100">
        <div class="mb-5">
          <h5 class="fw-bold mb-4 filter-title">Tipo de empleo</h5>

          {#each tipos as tipo, index}
            <div class="form-check form-switch mb-3">
              <input
                id={`tipo-${index}`}
                class="form-check-input"
                type="checkbox"
                checked={tiposSeleccionados.includes(tipo)}
                onchange={() => toggleTipo(tipo)}
              >

              <label class="form-check-label" for={`tipo-${index}`}>
                {tipo}
              </label>
            </div>
          {/each}
        </div>

        <div class="mb-5">
          <h5 class="fw-bold mb-4 filter-title">Fecha de publicación</h5>

          <div class="form-check mb-3">
            <input id="fecha-todas" class="form-check-input" type="radio" name="fecha" value="todas" bind:group={fecha}>
            <label class="form-check-label" for="fecha-todas">Todas</label>
          </div>

          <div class="form-check mb-3">
            <input id="fecha-1h" class="form-check-input" type="radio" name="fecha" value="1h" bind:group={fecha}>
            <label class="form-check-label" for="fecha-1h">Última hora</label>
          </div>

          <div class="form-check mb-3">
            <input id="fecha-24h" class="form-check-input" type="radio" name="fecha" value="24h" bind:group={fecha}>
            <label class="form-check-label" for="fecha-24h">Últimas 24 horas</label>
          </div>

          <div class="form-check mb-3">
            <input id="fecha-7d" class="form-check-input" type="radio" name="fecha" value="7d" bind:group={fecha}>
            <label class="form-check-label" for="fecha-7d">Últimos 7 días</label>
          </div>

          <div class="form-check mb-3">
            <input id="fecha-14d" class="form-check-input" type="radio" name="fecha" value="14d" bind:group={fecha}>
            <label class="form-check-label" for="fecha-14d">Últimos 14 días</label>
          </div>

          <div class="form-check">
            <input id="fecha-30d" class="form-check-input" type="radio" name="fecha" value="30d" bind:group={fecha}>
            <label class="form-check-label" for="fecha-30d">Últimos 30 días</label>
          </div>
        </div>

        <div class="mb-5">
          <h5 class="fw-bold mb-4 filter-title">Salario</h5>

          <input
            id="salarioMax"
            type="range"
            class="form-range"
            min="0"
            max="15000"
            step="500"
            bind:value={salarioMax}
          >

          <div class="text-center mt-3">
            <span class="badge rounded-pill px-3 py-2 salary-badge">
              Hasta {formatearSalario(salarioMax)}
            </span>
          </div>
        </div>

        <button class="btn w-100 text-white fw-semibold py-3 rounded-3 search-btn" type="button" onclick={aplicarFiltros}>
          Aplicar filtros
        </button>
      </div>
    </div>

    <div class="col-lg-8">
      {#if cargando}
        <div class="alert alert-light border rounded-4">
          Cargando empleos...
        </div>
      {:else if error}
        <div class="alert alert-danger rounded-4">
          {error}
        </div>
      {:else if ofertas.length === 0}
        <div class="alert alert-light border rounded-4">
          No se encontraron empleos con esos filtros.
        </div>
      {:else}
        {#each ofertas as oferta}
          <div
            class="card border rounded-4 p-4 mb-4 job-card"
            role="button"
            tabindex="0"
            onclick={() => irDetalle(oferta.id_oferta)}
            onkeydown={(event) => event.key === 'Enter' && irDetalle(oferta.id_oferta)}
          >
            <div class="d-flex gap-3 align-items-start">
              <img
                src="/img/logo.png"
                alt={oferta.nombre_empresa || 'Empresa'}
                class="rounded"
                style="width:55px; height:55px; object-fit:cover;"
              >

              <div class="w-100">
                <h5 class="fw-bold mb-2 job-title">
                  {oferta.titulo || 'Sin título'}
                </h5>

                <div class="d-flex flex-wrap gap-3 job-meta mb-3">
                  <span>
                    <i class="bi bi-briefcase me-1"></i>
                    {oferta.nombre_empresa || 'Empresa no disponible'}
                  </span>

                  <span>
                    <i class="bi bi-geo-alt me-1"></i>
                    {oferta.ubicacion || 'Sin ubicación'}
                  </span>

                  <span>
                    <i class="bi bi-clock me-1"></i>
                    {formatearFecha(oferta.fecha_publicacion)}
                  </span>

                  <span>
                    <i class="bi bi-cash-stack me-1"></i>
                    {formatearSalario(oferta.salario)}
                  </span>
                </div>

                <p class="text-muted mb-3">
                  {oferta.descripcion}
                </p>

                <div class="d-flex gap-2 flex-wrap">
                  <span class="badge rounded-pill fw-normal px-3 py-2 type-badge">
                    {oferta.tipo_contrato || 'Tiempo completo'}
                  </span>

                  <span class="badge rounded-pill fw-normal px-3 py-2 mode-badge">
                    {oferta.modalidad || 'Modalidad no especificada'}
                  </span>

                  {#if oferta.rubro}
                    <span class="badge rounded-pill fw-normal px-3 py-2 category-badge">
                      {oferta.rubro}
                    </span>
                  {/if}
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
    background-color: #ffffff;
    font-size: 14px;
  }

  .hero-search-section {
    background: linear-gradient(90deg, #eef1f7 0%, #eaf0fb 100%);
  }

  .hero-search-box {
    border-radius: 22px;
  }

  .search-input::placeholder {
    color: #4b5563;
  }

  .search-btn {
    background-color: #2c3b4e;
  }

  .search-btn:hover {
    background-color: #1f2937;
  }

  .filter-panel {
    background-color: #eef4fb;
    border-radius: 22px;
  }

  .filter-title {
    font-size: 15px;
  }

  .salary-badge {
    background-color: #d9e8ff;
    color: #3b82f6;
  }

  .job-card {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .job-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.08);
  }

  .job-card:focus {
    outline: 3px solid #d9e8ff;
  }

  .job-title {
    color: #111827;
  }

  .job-meta {
    color: #64748b;
    font-size: 13px;
  }

  .type-badge {
    background: #ddebff;
    color: #5095ff;
    font-size: 11px;
  }

  .mode-badge {
    background: #fff0d7;
    color: #f4a62a;
    font-size: 11px;
  }

  .category-badge {
    background: #f3e8ff;
    color: #7e22ce;
    font-size: 11px;
  }

  .footer {
    background-color: #2c3b4e;
  }

  @media (max-width: 768px) {
    .border-end {
      border-right: none !important;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
  }
</style>