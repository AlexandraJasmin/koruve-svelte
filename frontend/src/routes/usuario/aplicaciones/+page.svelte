<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ModalesUsuario from '$lib/components/ModalesUsuario.svelte';
  import {
    obtenerAplicacionesUsuario,
    eliminarAplicacion
  } from '$lib/services/aplicacionesService.js';

  const ID_USUARIO_PRUEBA = 1;

  let mostrarModalCerrarSesion = $state(false);
  let mostrarModalEliminarCuenta = $state(false);

  let usuario = $state({
    nombre_completo: 'Ana Lopez',
    correo: 'ana@example.com'
  });

  let postulaciones = $state([]);
  let cargando = $state(false);
  let error = $state('');
  let mensaje = $state('');

  let mostrarModalEliminar = $state(false);
  let postulacionSeleccionada = $state(null);

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

  function obtenerIdUsuario() {
    const sesionGuardada = localStorage.getItem('koruveSesion');
    const sesionAnterior = localStorage.getItem('sesionActiva');

    let sesion = null;

    if (sesionGuardada) {
      sesion = JSON.parse(sesionGuardada);
    } else if (sesionAnterior) {
      sesion = JSON.parse(sesionAnterior);
    }

    const datos = sesion?.datos || sesion?.usuario || sesion;

    return datos?.id_usuario || datos?.id || ID_USUARIO_PRUEBA;
  }

  async function cargarPostulaciones() {
    cargando = true;
    error = '';
    mensaje = '';

    try {
      const idUsuario = obtenerIdUsuario();
      const data = await obtenerAplicacionesUsuario(idUsuario);

      postulaciones = data.map((item) => ({
        id_aplicacion: item.id_aplicacion,
        id_oferta: item.id_oferta,
        titulo: item.titulo || item.oferta || 'Oferta no disponible',
        nombre_empresa: item.nombre_empresa || 'Empresa no disponible',
        ubicacion: item.ubicacion || 'Ubicación no disponible',
        fecha_aplicacion: item.fecha_aplicacion,
        estado: item.estado || 'pendiente'
      }));
    } catch (err) {
      console.error('Error al cargar postulaciones:', err);
      error = 'Error al cargar las postulaciones.';
      postulaciones = [];
    } finally {
      cargando = false;
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';

    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatearEstado(estado) {
    const mapa = {
      pendiente: 'Pendiente',
      en_revision: 'En revisión',
      aceptada: 'Aceptada',
      aceptado: 'Aceptado',
      denegada: 'Denegada',
      rechazada: 'Rechazada',
      rechazado: 'Rechazado'
    };

    return mapa[estado] || estado;
  }

  function obtenerClaseEstado(estado) {
    if (estado === 'aceptada' || estado === 'aceptado') {
      return 'estado estado-aceptado';
    }

    if (estado === 'denegada' || estado === 'rechazada' || estado === 'rechazado') {
      return 'estado estado-rechazado';
    }

    if (estado === 'en_revision') {
      return 'estado estado-revision';
    }

    return 'estado estado-pendiente';
  }

  function verDetalle(idOferta) {
    goto(`/empleos/${idOferta}`);
  }

  function abrirModalEliminar(postulacion) {
    postulacionSeleccionada = postulacion;
    mostrarModalEliminar = true;
  }

  function cerrarModalEliminar() {
    postulacionSeleccionada = null;
    mostrarModalEliminar = false;
  }

  async function eliminarPostulacionSeleccionada() {
    if (!postulacionSeleccionada) return;

    mensaje = '';
    error = '';

    try {
      await eliminarAplicacion(postulacionSeleccionada.id_aplicacion);

      postulaciones = postulaciones.filter(
        (item) => item.id_aplicacion !== postulacionSeleccionada.id_aplicacion
      );

      mensaje = 'Postulación eliminada correctamente.';
      cerrarModalEliminar();
    } catch (err) {
      console.error('Error al eliminar postulación:', err);
      error = err.message;
    }
  }

  onMount(() => {
    cargarSesion();
    cargarPostulaciones();
  });
</script>

<svelte:head>
  <title>Mis Postulaciones | Koruve</title>
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

        <a href="/usuario/aplicaciones" class="list-group-item list-group-item-action border-0 rounded mb-2 panel-activo">
          <i class="bi bi-briefcase me-2 texto-panel"></i>
          <span class="texto-panel">Empleos Solicitados</span>
        </a>

        <a href="/usuario/alertas" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-bell me-2"></i>
          Alertas de Empleo
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
        <h3 class="fw-bold">Mis Postulaciones</h3>
        <p class="text-muted small mb-0">¿Listo para la carga?</p>
      </section>

      <section class="card border-0 shadow-sm mb-4 postulaciones-card">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-4">Mis solicitudes de empleo</h6>

          {#if mensaje}
            <div class="alert alert-info py-2">
              {mensaje}
            </div>
          {/if}

          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr class="small text-muted">
                  <th>Título Profesional</th>
                  <th>Fecha de Aplicación</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {#if cargando}
                  <tr>
                    <td colspan="4" class="text-muted">
                      Cargando postulaciones...
                    </td>
                  </tr>
                {:else if postulaciones.length === 0}
                  <tr>
                    <td colspan="4" class="text-muted">
                      No tienes postulaciones registradas.
                    </td>
                  </tr>
                {:else}
                  {#each postulaciones as post}
                    <tr>
                      <td>
                        <div class="fw-semibold">
                          {post.titulo}
                        </div>

                        <small class="text-muted">
                          {post.nombre_empresa} · {post.ubicacion}
                        </small>
                      </td>

                      <td>
                        <small>{formatearFecha(post.fecha_aplicacion)}</small>
                      </td>

                      <td>
                        <span class={obtenerClaseEstado(post.estado)}>
                          {formatearEstado(post.estado)}
                        </span>
                      </td>

                      <td>
                        <button
                          class="btn btn-sm btn-light me-1"
                          type="button"
                          title="Ver detalle"
                          onclick={() => verDetalle(post.id_oferta)}
                        >
                          <i class="bi bi-eye"></i>
                        </button>

                        <button
                          class="btn btn-sm btn-light"
                          type="button"
                          title="Eliminar postulación"
                          onclick={() => abrirModalEliminar(post)}
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

          {#if error}
            <p class="text-danger mb-0 mt-2">
              {error}
            </p>
          {/if}
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
          ¿Estás seguro de que deseas eliminar esta postulación?
        </h6>

        <button class="btn-close" type="button" onclick={cerrarModalEliminar}></button>
      </div>

      <p class="small text-muted mb-4">
        La postulación se eliminará del sistema.
      </p>

      {#if postulacionSeleccionada}
        <div class="alert alert-light border mb-4">
          <strong>{postulacionSeleccionada.titulo}</strong><br>
          <small>{postulacionSeleccionada.nombre_empresa}</small>
        </div>
      {/if}

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-danger" type="button" onclick={eliminarPostulacionSeleccionada}>
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

  .postulaciones-card {
    border-radius: 10px;
  }

  .estado {
    font-size: 13px;
    font-weight: 600;
  }

  .estado-pendiente {
    color: #2f73d9;
  }

  .estado-revision {
    color: #f4a62a;
  }

  .estado-aceptado {
    color: #22a06b;
  }

  .estado-rechazado {
    color: #dc3545;
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