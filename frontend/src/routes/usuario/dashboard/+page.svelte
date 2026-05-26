<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const API_URL = 'http://localhost:3001/api';
  const ID_USUARIO_PRUEBA = 1;

  let usuario = $state({
    id_usuario: 1,
    nombre_completo: 'Ana Lopez',
    profesion: 'Desarrolladora Web',
    ubicacion: 'San Salvador'
  });

  let ofertasRecientes = $state([]);
  let aplicaciones = $state([]);
  let cargando = $state(false);
  let error = $state('');

  let totalPostulaciones = $state(0);
  let totalAlertas = $state(0);
  let totalMensajes = $state(0);
  let totalEmpresasContactadas = $state(0);
  let perfilCompletado = $state(70);

  let estadoPostulaciones = $state({
    pendiente: 0,
    aceptada: 0,
    denegada: 0
  });

  function primerNombre(nombre) {
    if (!nombre) return 'Usuario';
    return nombre.trim().split(' ')[0];
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

  function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';

    return new Date(fechaISO).toLocaleDateString('es-SV', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  async function cargarOfertasRecientes() {
    const respuesta = await fetch(`${API_URL}/ofertas`);

    if (!respuesta.ok) {
      throw new Error('No se pudieron cargar las ofertas recientes');
    }

    const data = await respuesta.json();
    ofertasRecientes = data.slice(0, 5);
  }

  async function cargarAplicacionesUsuario() {
    try {
      const respuesta = await fetch(`${API_URL}/usuarios/${ID_USUARIO_PRUEBA}/aplicaciones`);

      if (!respuesta.ok) {
        aplicaciones = [];
        return;
      }

      aplicaciones = await respuesta.json();
    } catch (err) {
      aplicaciones = [];
    }
  }

  function calcularResumen() {
    totalPostulaciones = aplicaciones.length;
    totalAlertas = 0;
    totalMensajes = 0;

    const empresas = new Set();

    estadoPostulaciones = {
      pendiente: 0,
      aceptada: 0,
      denegada: 0
    };

    aplicaciones.forEach((item) => {
      if (item.id_empresa) {
        empresas.add(item.id_empresa);
      }

      if (item.estado === 'pendiente') {
        estadoPostulaciones.pendiente += 1;
      }

      if (item.estado === 'aceptada') {
        estadoPostulaciones.aceptada += 1;
      }

      if (item.estado === 'denegada') {
        estadoPostulaciones.denegada += 1;
      }
    });

    totalEmpresasContactadas = empresas.size;

    let completado = 0;

    if (usuario.nombre_completo) completado += 20;
    if (usuario.profesion) completado += 20;
    if (usuario.ubicacion) completado += 20;
    if (usuario.correo) completado += 20;
    if (usuario.telefono) completado += 20;

    perfilCompletado = completado || 70;
  }

  async function cargarDashboard() {
    cargando = true;
    error = '';

    try {
      await cargarOfertasRecientes();
      await cargarAplicacionesUsuario();
      calcularResumen();
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      error = 'No se pudieron cargar los datos del dashboard.';
    } finally {
      cargando = false;
    }
  }

  function irDetalleOferta(idOferta) {
    goto(`/empleos/${idOferta}`);
  }

  function irEmpleos() {
    goto('/empleos');
  }

  onMount(() => {
    cargarDashboard();
  });
</script>

<svelte:head>
  <title>Dashboard Usuario | Koruve</title>
</svelte:head>

<div class="container">
  <nav class="navbar navbar-expand-lg py-3">
    <div class="container-fluid">
      <a href="/">
        <img src="/img/logo.png" alt="Logo" style="height: 80px; width: 200px;">
      </a>

      <div class="collapse navbar-collapse">
        <ul class="navbar-nav mx-auto fs-6">
          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/empleos">Empleos</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/">Empresas</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/">Recursos</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/">Foro</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/">Valoraciones</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/">Nosotros</a>
          </li>
        </ul>

        <div class="dropdown">
          <button class="btn border-0 d-flex align-items-center gap-2" type="button">
            <span class="fw-semibold">{primerNombre(usuario.nombre_completo)} Lopez</span>
            <i class="bi bi-chevron-down small text-primary"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</div>

<div class="container-fluid dashboard-bg">
  <div class="row">
    <aside class="col-md-3 col-lg-2 bg-white border-end min-vh-100 p-3">
      <div class="list-group list-group-flush small">
        <a href="/usuario/dashboard" class="list-group-item list-group-item-action border-0 rounded mb-2 panel-activo">
          <i class="bi bi-person me-2 texto-panel"></i>
          <span class="texto-panel">Panel</span>
        </a>

        <a href="/usuario/perfil" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-briefcase me-2"></i>
          Mi Perfil
        </a>

        <a href="/usuario/curriculum" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-file-earmark-text me-2"></i>
          Mi Currículum
        </a>

        <a href="/usuario/aplicaciones" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-briefcase me-2"></i>
          Empleos Solicitados
        </a>

        <a href="/" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-bell me-2"></i>
          Alertas de Empleo
        </a>

        <a href="/" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-bookmark me-2"></i>
          Guardados
        </a>

        <a href="/" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-chat me-2"></i>
          Mensajes
        </a>

        <a href="/" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-key me-2"></i>
          Cambiar Contraseña
        </a>

        <a href="/" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-box-arrow-right me-2"></i>
          Cerrar Sesión
        </a>

        <a href="/" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-trash me-2"></i>
          Eliminar Perfil
        </a>
      </div>
    </aside>

    <main class="col-md-9 col-lg-10 p-4">
      <section class="mb-4">
        <h3 class="fw-bold">
          ¡Hola, {usuario.nombre_completo}!
        </h3>

        <p class="text-muted small mb-0">
          ¿Lista para la carga?
        </p>
      </section>

      <section class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card shadow-sm border-0 h-100 dashboard-card">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div class="bg-light p-3 rounded">
                <i class="bi bi-briefcase fs-4"></i>
              </div>

              <div class="text-end">
                <h4 class="fw-bold">{totalPostulaciones}</h4>
                <small>Empleos Solicitados</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0 h-100 dashboard-card">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div class="bg-light p-3 rounded">
                <i class="bi bi-file-earmark-text fs-4"></i>
              </div>

              <div class="text-end">
                <h4 class="fw-bold">{totalAlertas}</h4>
                <small>Alertas</small>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0 h-100 dashboard-card">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div class="bg-light p-3 rounded">
                <i class="bi bi-chat-square-text fs-4"></i>
              </div>

              <div class="text-end">
                <h4 class="fw-bold">{totalMensajes}</h4>
                <small>Mensajes</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="row g-3 mb-4">
        <div class="col-lg-7">
          <div class="card shadow-sm border-0 h-100 dashboard-card">
            <div class="card-body">
              <h6 class="fw-bold mb-4">Estado de tus postulaciones</h6>

              {#if totalPostulaciones === 0}
                <div class="text-muted">
                  Todavía no tienes postulaciones registradas.
                </div>
              {:else}
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span>Pendientes</span>
                    <strong>{estadoPostulaciones.pendiente}</strong>
                  </div>
                  <div class="progress barra-fondo">
                    <div
                      class="progress-bar barra-azul"
                      style={`width:${totalPostulaciones ? (estadoPostulaciones.pendiente / totalPostulaciones) * 100 : 0}%`}
                    ></div>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span>Aceptadas</span>
                    <strong>{estadoPostulaciones.aceptada}</strong>
                  </div>
                  <div class="progress barra-fondo">
                    <div
                      class="progress-bar bg-success"
                      style={`width:${totalPostulaciones ? (estadoPostulaciones.aceptada / totalPostulaciones) * 100 : 0}%`}
                    ></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-content-between mb-1">
                    <span>Denegadas</span>
                    <strong>{estadoPostulaciones.denegada}</strong>
                  </div>
                  <div class="progress barra-fondo">
                    <div
                      class="progress-bar bg-danger"
                      style={`width:${totalPostulaciones ? (estadoPostulaciones.denegada / totalPostulaciones) * 100 : 0}%`}
                    ></div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card shadow-sm border-0 mb-3 dashboard-card">
            <div class="card-body">
              <small>Total empresas contactadas</small>
              <h2 class="fw-bold">{totalEmpresasContactadas}</h2>

              <div class="progress barra-fondo">
                <div
                  class="progress-bar barra-azul"
                  style={`width:${Math.min(totalEmpresasContactadas * 20, 100)}%`}
                ></div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm border-0 dashboard-card">
            <div class="card-body">
              <small>Perfil completado</small>
              <h2 class="fw-bold">{perfilCompletado}%</h2>

              <div class="progress barra-fondo">
                <div
                  class="progress-bar barra-azul"
                  style={`width:${perfilCompletado}%`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold mb-0">Empleos más recientes</h5>

          <button class="btn btn-sm btn-main" type="button" onclick={irEmpleos}>
            Ver todos
          </button>
        </div>

        {#if cargando}
          <div class="alert alert-light border-0 shadow-sm">
            Cargando dashboard...
          </div>
        {:else if error}
          <div class="alert alert-danger border-0 shadow-sm">
            {error}
          </div>
        {:else if ofertasRecientes.length === 0}
          <div class="alert alert-light border-0 shadow-sm">
            No hay empleos recientes.
          </div>
        {:else}
          {#each ofertasRecientes as oferta, index}
            <div
              class="card border-0 shadow-sm mb-3 empleo-reciente-card"
              role="button"
              tabindex="0"
              onclick={() => irDetalleOferta(oferta.id_oferta)}
              onkeydown={(event) => event.key === 'Enter' && irDetalleOferta(oferta.id_oferta)}
            >
              <div class="card-body d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div class="d-flex gap-3 flex-grow-1">
                  <div class={`avatar-empresa avatar-${index % 5}`}>
                    {(oferta.nombre_empresa || 'E').charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h6 class="mb-1 fw-bold">{oferta.titulo || 'Sin título'}</h6>

                    <p class="small text-muted mb-2">
                      {oferta.nombre_empresa || 'Empresa'} ·
                      {oferta.ubicacion || 'Ubicación no disponible'} ·
                      {formatearFecha(oferta.fecha_publicacion)} ·
                      {formatearSalario(oferta.salario)}
                    </p>

                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge text-bg-primary-subtle">
                        {oferta.tipo_contrato || 'Tiempo completo'}
                      </span>

                      <span class="badge text-bg-success-subtle">
                        {oferta.estado || 'activa'}
                      </span>

                      {#if oferta.modalidad}
                        <span class="badge text-bg-warning-subtle">
                          {oferta.modalidad}
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>

                <div>
                  <i class="bi bi-chevron-right text-muted fs-5"></i>
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </section>
    </main>
  </div>
</div>

<style>
  :global(body) {
    background-color: #f8f9fb;
    color: #1f2937;
    font-size: 14px;
  }

  .dashboard-bg {
    background-color: #f8f9fb;
  }

  .panel-activo {
    background-color: #f1d5ce;
  }

  .texto-panel {
    color: #a35139;
  }

  .texto-azul {
    color: #2c3b4e;
  }

  .barra-fondo {
    background-color: #e6ecf1;
    height: 12px;
    border-radius: 30px;
  }

  .barra-azul {
    background-color: #2c3b4e;
  }

  .dashboard-card {
    border-radius: 10px;
  }

  .btn-main {
    background-color: #2c3b4e;
    color: #fff;
    border: none;
  }

  .btn-main:hover {
    background-color: #233244;
    color: #fff;
  }

  .empleo-reciente-card {
    border-radius: 14px;
    transition: all 0.25s ease;
    cursor: pointer;
  }

  .empleo-reciente-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06) !important;
  }

  .avatar-empresa {
    width: 46px;
    height: 46px;
    min-width: 46px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-0 {
    background-color: #2c3b4e;
  }

  .avatar-1 {
    background-color: #2f73d9;
  }

  .avatar-2 {
    background-color: #a35139;
  }

  .avatar-3 {
    background-color: #5cbf7a;
  }

  .avatar-4 {
    background-color: #6b7280;
  }

  .list-group-item {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .list-group-item:hover {
    background-color: #f8f9fb;
  }
</style>