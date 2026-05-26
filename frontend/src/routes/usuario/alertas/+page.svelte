<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ModalesUsuario from '$lib/components/ModalesUsuario.svelte';

    let mostrarModalCerrarSesion = $state(false);
    let mostrarModalEliminarCuenta = $state(false);

  let usuario = $state({
    nombre_completo: 'Ana Lopez',
    correo: 'ana@example.com'
  });

  let alertas = $state([]);
  let tituloAlerta = $state('');
  let criterioAlerta = $state('');
  let mensaje = $state('');
  let error = $state('');

  let mostrarModalEliminar = $state(false);
  let alertaSeleccionada = $state(null);

  function cargarSesion() {
    const sesionGuardada = localStorage.getItem('koruveSesion');
    const sesionAnterior = localStorage.getItem('sesionActiva');

    let sesion = null;

    if (sesionGuardada) {
      sesion = JSON.parse(sesionGuardada);
    } else if (sesionAnterior) {
      sesion = JSON.parse(sesionAnterior);
    }

    if (!sesion) return;

    const datos = sesion.datos || sesion.usuario || sesion;

    usuario = {
      nombre_completo: datos.nombre_completo || datos.nombre || 'Ana Lopez',
      correo: datos.correo || 'ana@example.com'
    };
  }

  function cargarAlertasLocales() {
    const alertasGuardadas = localStorage.getItem('alertasUsuarioLocal');

    if (alertasGuardadas) {
      alertas = JSON.parse(alertasGuardadas);
      return;
    }

    alertas = [
      {
        id_alerta_empleo: 1,
        titulo_empleo: 'Desarrollador Frontend',
        criterio_alerta: 'Svelte, remoto, San Salvador',
        fecha_creacion: new Date().toISOString()
      },
      {
        id_alerta_empleo: 2,
        titulo_empleo: 'Diseñador UI',
        criterio_alerta: 'Figma, híbrido, Santa Ana',
        fecha_creacion: new Date().toISOString()
      }
    ];

    guardarAlertasLocales();
  }

  function guardarAlertasLocales() {
    localStorage.setItem('alertasUsuarioLocal', JSON.stringify(alertas));
  }

  function crearAlerta() {
    mensaje = '';
    error = '';

    if (!tituloAlerta.trim() || !criterioAlerta.trim()) {
      error = 'Completa el título y el criterio de la alerta.';
      return;
    }

    const nuevaAlerta = {
      id_alerta_empleo: Date.now(),
      titulo_empleo: tituloAlerta.trim(),
      criterio_alerta: criterioAlerta.trim(),
      fecha_creacion: new Date().toISOString()
    };

    alertas = [nuevaAlerta, ...alertas];

    guardarAlertasLocales();

    tituloAlerta = '';
    criterioAlerta = '';
    mensaje = 'Alerta creada correctamente.';
  }

  function abrirModalEliminar(alerta) {
    alertaSeleccionada = alerta;
    mostrarModalEliminar = true;
  }

  function cerrarModalEliminar() {
    alertaSeleccionada = null;
    mostrarModalEliminar = false;
  }

  function eliminarAlertaSeleccionada() {
    if (!alertaSeleccionada) return;

    alertas = alertas.filter(
      (item) => item.id_alerta_empleo !== alertaSeleccionada.id_alerta_empleo
    );

    guardarAlertasLocales();

    mensaje = 'Alerta eliminada correctamente.';
    cerrarModalEliminar();
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';

    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function cerrarSesion() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    goto('/iniciar-sesion');
  }

  function eliminarPerfil() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('alertasUsuarioLocal');
    goto('/');
  }

  onMount(() => {
    cargarSesion();
    cargarAlertasLocales();
  });
</script>

<svelte:head>
  <title>Alertas de Empleos | Koruve</title>
</svelte:head>

<div class="container-fluid dashboard-bg">
  <div class="row">
    <aside class="col-md-3 col-lg-2 bg-white border-end min-vh-100 p-3">
      <div class="list-group list-group-flush small">
        <a href="/usuario/dashboard" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-house me-2"></i>
          Panel
        </a>

        <a href="/usuario/perfil" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-person me-2"></i>
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

        <a href="/usuario/alertas" class="list-group-item list-group-item-action border-0 rounded mb-2 panel-activo">
          <i class="bi bi-bell me-2 texto-panel"></i>
          <span class="texto-panel">Alertas de Empleos</span>
        </a>

        <a href="/usuario/guardados" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-bookmark me-2"></i>
          Guardados
        </a>

        <a href="/usuario/password" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-key me-2"></i>
          Cambiar Contraseña
        </a>

        <button
        class="list-group-item list-group-item-action border-0 bg-white text-start"
        type="button"
        onclick={() => (mostrarModalCerrarSesion = true)}
        >
        <i class="bi bi-box-arrow-right me-2"></i>
        Cerrar Sesión
        </button>
        <button
        class="list-group-item list-group-item-action border-0 bg-white text-start"
        type="button"
        onclick={() => (mostrarModalEliminarCuenta = true)}
        >
        <i class="bi bi-trash me-2"></i>
        Eliminar Perfil
        </button>
      </div>
    </aside>

    <main class="col-md-9 col-lg-10 p-4">
      <section class="mb-4">
        <h3 class="fw-bold">Alertas de Empleos</h3>
        <p class="text-muted small mb-0">¿Listo para la carga?</p>
      </section>

      <section class="card border-0 shadow-sm mb-4 alertas-card">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-4">Crear nueva alerta</h6>

          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <input
                type="text"
                class="form-control"
                placeholder="Título del empleo"
                bind:value={tituloAlerta}
              >
            </div>

            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Criterio de alerta"
                bind:value={criterioAlerta}
              >
            </div>

            <div class="col-md-2 d-grid">
              <button class="btn boton-naranja" type="button" onclick={crearAlerta}>
                Crear
              </button>
            </div>
          </div>

          {#if mensaje}
            <div class="alert alert-info py-2">
              {mensaje}
            </div>
          {/if}

          {#if error}
            <div class="alert alert-danger py-2">
              {error}
            </div>
          {/if}

          <h6 class="fw-bold mb-4">Mis alertas de empleo</h6>

          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr class="small text-muted">
                  <th>Título</th>
                  <th>Criterios</th>
                  <th>Creado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {#if alertas.length === 0}
                  <tr>
                    <td colspan="4" class="text-muted">
                      No tienes alertas registradas.
                    </td>
                  </tr>
                {:else}
                  {#each alertas as alerta}
                    <tr>
                      <td>
                        <div class="fw-semibold">
                          {alerta.titulo_empleo}
                        </div>
                      </td>

                      <td>
                        <small class="text-muted">
                          {alerta.criterio_alerta}
                        </small>
                      </td>

                      <td>
                        <small class="text-muted">
                          {formatearFecha(alerta.fecha_creacion)}
                        </small>
                      </td>

                      <td>
                        <button
                          class="btn btn-sm btn-light"
                          type="button"
                          title="Eliminar alerta"
                          onclick={() => abrirModalEliminar(alerta)}
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>
</div>

{#if mostrarModalEliminar}
  <div class="modal-backdrop-custom">
    <div class="modal-card-custom">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="fw-bold mb-0">
          ¿Está seguro de que deseas eliminar esta alerta de empleo?
        </h6>

        <button class="btn-close" type="button" onclick={cerrarModalEliminar}></button>
      </div>

      <p class="small text-muted mb-4">
        La alerta se eliminará del sistema.
      </p>

      {#if alertaSeleccionada}
        <div class="alert alert-light border mb-4">
          <strong>{alertaSeleccionada.titulo_empleo}</strong><br>
          <small>{alertaSeleccionada.criterio_alerta}</small>
        </div>
      {/if}

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-danger" type="button" onclick={eliminarAlertaSeleccionada}>
          Eliminar
        </button>

        <button class="btn btn-sm btn-secondary" type="button" onclick={cerrarModalEliminar}>
          Cancelar
        </button>
      </div>
    </div>
  </div>
{/if}

<ModalesUsuario
  mostrarCerrarSesion={mostrarModalCerrarSesion}
  mostrarEliminarCuenta={mostrarModalEliminarCuenta}
  onCerrarModalCerrarSesion={() => (mostrarModalCerrarSesion = false)}
  onCerrarModalEliminarCuenta={() => (mostrarModalEliminarCuenta = false)}
/> 

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

  .alertas-card {
    border-radius: 10px;
  }

  .boton-naranja {
    background-color: #a35139;
    color: white;
    border: none;
  }

  .boton-naranja:hover {
    background-color: #8f422e;
    color: white;
  }

  .form-control {
    min-height: 46px;
    font-size: 14px;
  }

  .list-group-item {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .list-group-item:hover {
    background-color: #f8f9fb;
  }

  .modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }

  .modal-card-custom {
    width: 100%;
    max-width: 430px;
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  }

  @media (max-width: 768px) {
    aside {
      min-height: auto !important;
    }
  }
</style>