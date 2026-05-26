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

  let passwordActual = $state('');
  let passwordNueva = $state('');
  let passwordConfirmar = $state('');

  let mensaje = $state('');
  let error = $state('');
  let mostrarPasswordActual = $state(false);
  let mostrarPasswordNueva = $state(false);
  let mostrarPasswordConfirmar = $state(false);

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

  function actualizarPassword() {
    mensaje = '';
    error = '';

    if (!passwordActual.trim() || !passwordNueva.trim() || !passwordConfirmar.trim()) {
      error = 'Completa todos los campos.';
      return;
    }

    if (passwordNueva.length < 6) {
      error = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (passwordNueva !== passwordConfirmar) {
      error = 'La nueva contraseña y la confirmación no coinciden.';
      return;
    }

    localStorage.setItem(
      'passwordUsuarioLocal',
      JSON.stringify({
        correo: usuario.correo,
        fecha_actualizacion: new Date().toISOString()
      })
    );

    passwordActual = '';
    passwordNueva = '';
    passwordConfirmar = '';

    mensaje = 'Contraseña actualizada correctamente.';
  }

  function cerrarSesion() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    goto('/iniciar-sesion');
  }

  function eliminarPerfil() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    goto('/');
  }

  onMount(() => {
    cargarSesion();
  });
</script>

<svelte:head>
  <title>Cambiar Contraseña | Koruve</title>
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

        <a href="/usuario/guardados" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-bookmark me-2"></i>
          Guardados
        </a>

        <a href="/usuario/password" class="list-group-item list-group-item-action border-0 rounded mb-2 panel-activo">
          <i class="bi bi-key me-2 texto-panel"></i>
          <span class="texto-panel">Cambiar Contraseña</span>
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
        <h3 class="fw-bold">Cambiar Contraseña</h3>
        <p class="text-muted small mb-0">¿Listo para la carga?</p>
      </section>

      <section class="card border-0 shadow-sm password-card">
        <div class="card-body p-5">
          <h4 class="fw-bold mb-5">Cambiar contraseña</h4>

          <div class="row">
            <div class="col-lg-8">
              <div class="mb-4">
                <label class="form-label fw-semibold">Contraseña actual</label>

                <div class="input-group">
                  <input
                    type={mostrarPasswordActual ? 'text' : 'password'}
                    class="form-control bg-body-tertiary border-0 py-3"
                    bind:value={passwordActual}
                  >

                  <button
                    class="btn bg-body-tertiary border-0"
                    type="button"
                    onclick={() => (mostrarPasswordActual = !mostrarPasswordActual)}
                  >
                    <i class={mostrarPasswordActual ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                  </button>
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold">Nueva contraseña</label>

                <div class="input-group">
                  <input
                    type={mostrarPasswordNueva ? 'text' : 'password'}
                    class="form-control bg-body-tertiary border-0 py-3"
                    bind:value={passwordNueva}
                  >

                  <button
                    class="btn bg-body-tertiary border-0"
                    type="button"
                    onclick={() => (mostrarPasswordNueva = !mostrarPasswordNueva)}
                  >
                    <i class={mostrarPasswordNueva ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                  </button>
                </div>
              </div>

              <div class="mb-5">
                <label class="form-label fw-semibold">Confirmar contraseña</label>

                <div class="input-group">
                  <input
                    type={mostrarPasswordConfirmar ? 'text' : 'password'}
                    class="form-control bg-body-tertiary border-0 py-3"
                    bind:value={passwordConfirmar}
                  >

                  <button
                    class="btn bg-body-tertiary border-0"
                    type="button"
                    onclick={() => (mostrarPasswordConfirmar = !mostrarPasswordConfirmar)}
                  >
                    <i class={mostrarPasswordConfirmar ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                  </button>
                </div>
              </div>

              {#if error}
                <div class="alert alert-danger py-2">
                  {error}
                </div>
              {/if}

              {#if mensaje}
                <div class="alert alert-info py-2">
                  {mensaje}
                </div>
              {/if}

              <button class="btn boton-naranja px-4 py-2" type="button" onclick={actualizarPassword}>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</div>

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

  .password-card {
    border-radius: 10px;
    min-height: 560px;
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
    font-size: 14px;
  }

  .input-group .form-control:focus {
    box-shadow: none;
    background-color: #f8f9fa;
  }

  .input-group .btn:focus {
    box-shadow: none;
  }

  .list-group-item {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .list-group-item:hover {
    background-color: #f8f9fb;
  }

  @media (max-width: 768px) {
    aside {
      min-height: auto !important;
    }
  }
</style>