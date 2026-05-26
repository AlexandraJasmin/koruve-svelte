<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ModalesUsuario from '$lib/components/ModalesUsuario.svelte';

  import {
    obtenerGuardadosUsuario,
    eliminarGuardado
  } from '$lib/services/guardadosService.js';

  const ID_USUARIO_PRUEBA = 1;

  let mostrarModalCerrarSesion = $state(false);
  let mostrarModalEliminarCuenta = $state(false);

  let usuario = $state({
    nombre_completo: 'Ana Lopez',
    correo: 'ana@example.com'
  });

  let guardados = $state([]);
  let cargando = $state(false);
  let error = $state('');
  let mensaje = $state('');

  let mostrarModalEliminar = $state(false);
  let guardadoSeleccionado = $state(null);

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

  async function cargarGuardados() {
    cargando = true;
    error = '';
    mensaje = '';

    try {
      const idUsuario = obtenerIdUsuario();
      guardados = await obtenerGuardadosUsuario(idUsuario);
    } catch (err) {
      console.error('Error al cargar guardados:', err);
      error = err.message || 'No se pudieron cargar los empleos guardados.';
      guardados = [];
    } finally {
      cargando = false;
    }
  }

  function obtenerInicial(nombreEmpresa) {
    if (!nombreEmpresa) return 'E';
    return nombreEmpresa.charAt(0).toUpperCase();
  }

  function obtenerClaseAvatar(index) {
    const clases = ['avatar-dark', 'avatar-blue', 'avatar-red', 'avatar-green', 'avatar-black'];
    return clases[index % clases.length];
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';

    return new Date(fecha).toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatearSalario(salario) {
    if (!salario) return 'No especificado';

    return '$' + Number(salario).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function verDetalle(idOferta) {
    goto(`/empleos/${idOferta}`);
  }

  function abrirModalEliminar(guardado) {
    guardadoSeleccionado = guardado;
    mostrarModalEliminar = true;
  }

  function cerrarModalEliminar() {
    guardadoSeleccionado = null;
    mostrarModalEliminar = false;
  }

  async function eliminarGuardadoSeleccionado() {
    if (!guardadoSeleccionado) return;

    mensaje = '';
    error = '';

    try {
      await eliminarGuardado(guardadoSeleccionado.id_guardado);

      guardados = guardados.filter(
        (item) => item.id_guardado !== guardadoSeleccionado.id_guardado
      );

      mensaje = 'Empleo eliminado de guardados correctamente.';
      cerrarModalEliminar();
    } catch (err) {
      console.error('Error al eliminar guardado:', err);
      error = err.message || 'No se pudo eliminar el empleo guardado.';
    }
  }

  onMount(() => {
    cargarSesion();
    cargarGuardados();
  });
</script>

<svelte:head>
  <title>Mis Guardados | Koruve</title>
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

        <a href="/usuario/alertas" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-bell me-2"></i>
          Alertas de Empleo
        </a>

        <a href="/usuario/guardados" class="list-group-item list-group-item-action border-0 rounded mb-2 panel-activo">
          <i class="bi bi-bookmark me-2 texto-panel"></i>
          <span class="texto-panel">Guardados</span>
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
        <h3 class="fw-bold">Mis Guardados</h3>
        <p class="text-muted small mb-0">Empleos que has guardado para revisar después.</p>
      </section>

      {#if mensaje}
        <div class="alert alert-info border-0 shadow-sm py-2">
          {mensaje}
        </div>
      {/if}

      {#if error}
        <div class="alert alert-danger border-0 shadow-sm py-2">
          {error}
        </div>
      {/if}

      {#if cargando}
        <div class="alert alert-light border-0 shadow-sm">
          Cargando empleos guardados...
        </div>
      {:else if guardados.length === 0}
        <div class="alert alert-light border-0 shadow-sm">
          No tienes empleos guardados.
        </div>
      {:else}
        <section>
          {#each guardados as guardado, index}
            <div class="card border-0 shadow-sm mb-3 guardado-card">
              <div class="card-body d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div class="d-flex gap-3 flex-grow-1">
                  <div class={`avatar-empresa ${obtenerClaseAvatar(index)}`}>
                    {obtenerInicial(guardado.nombre_empresa)}
                  </div>

                  <div>
                    <h6 class="mb-1 fw-bold">
                      {guardado.titulo}
                    </h6>

                    <p class="small text-muted mb-2">
                      {guardado.nombre_empresa}
                      · {guardado.ubicacion}
                      · {formatearFecha(guardado.fecha_guardado)}
                      · {formatearSalario(guardado.salario)}
                    </p>

                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge text-bg-primary-subtle">
                        {guardado.tipo_contrato || 'Tiempo completo'}
                      </span>

                      <span class="badge text-bg-success-subtle">
                        {guardado.estado || 'activa'}
                      </span>

                      {#if guardado.modalidad}
                        <span class="badge text-bg-secondary-subtle">
                          {guardado.modalidad}
                        </span>
                      {/if}

                      {#if guardado.rubro}
                        <span class="badge text-bg-warning-subtle">
                          {guardado.rubro}
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button
                    class="btn btn-sm btn-light"
                    type="button"
                    title="Ver detalle"
                    onclick={() => verDetalle(guardado.id_oferta)}
                  >
                    <i class="bi bi-eye"></i>
                  </button>

                  <button
                    class="btn btn-sm btn-light"
                    type="button"
                    title="Eliminar de guardados"
                    onclick={() => abrirModalEliminar(guardado)}
                  >
                    <i class="bi bi-bookmark-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </section>
      {/if}
    </main>
  </div>
</div>

{#if mostrarModalEliminar}
  <div class="modal-backdrop-custom">
    <div class="modal-card-custom">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="fw-bold mb-0">
          ¿Está seguro de que deseas eliminar el empleo guardado?
        </h6>

        <button class="btn-close" type="button" onclick={cerrarModalEliminar}></button>
      </div>

      {#if guardadoSeleccionado}
        <p class="small text-muted mb-4">
          Se eliminará de tus guardados:
          <strong>{guardadoSeleccionado.titulo}</strong>
        </p>
      {:else}
        <p class="small text-muted mb-4">
          El empleo guardado se eliminará de la lista.
        </p>
      {/if}

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-danger" type="button" onclick={eliminarGuardadoSeleccionado}>
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

  .guardado-card {
    border-radius: 14px;
    transition: all 0.25s ease;
  }

  .guardado-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06) !important;
  }

  .avatar-empresa {
    width: 45px;
    height: 45px;
    min-width: 45px;
    color: white;
    border-radius: 8px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-dark {
    background-color: #2c3b4e;
  }

  .avatar-blue {
    background-color: #2f73d9;
  }

  .avatar-red {
    background-color: #a35139;
  }

  .avatar-green {
    background-color: #5cbf7a;
  }

  .avatar-black {
    background-color: #111827;
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