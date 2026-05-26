<script>
  import { goto } from '$app/navigation';

  let {
    mostrarCerrarSesion = false,
    mostrarEliminarCuenta = false,
    onCerrarModalCerrarSesion = () => {},
    onCerrarModalEliminarCuenta = () => {}
  } = $props();

  function confirmarCerrarSesion() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');

    onCerrarModalCerrarSesion();
    goto('/iniciar-sesion');
  }

  function confirmarEliminarCuenta() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('perfilUsuarioLocal');
    localStorage.removeItem('curriculumUsuarioLocal');
    localStorage.removeItem('alertasUsuarioLocal');
    localStorage.removeItem('guardadosUsuarioLocal');
    localStorage.removeItem('passwordUsuarioLocal');

    onCerrarModalEliminarCuenta();
    goto('/');
  }
</script>

{#if mostrarCerrarSesion}
  <div class="modal-backdrop-custom">
    <div class="modal-confirmacion">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="fw-bold mb-0">
          ¿Está seguro de que quiere cerrar la sesión?
        </h5>

        <button
          class="btn-close"
          type="button"
          onclick={onCerrarModalCerrarSesion}
        ></button>
      </div>

      <p class="text-muted small mb-4">
        Al cerrar la sesión, esta dirección de correo electrónico dejará de estar asociada a su perfil.
      </p>

      <div class="d-flex justify-content-end gap-2">
        <button
          class="btn btn-outline-danger btn-sm"
          type="button"
          onclick={confirmarCerrarSesion}
        >
          Cerrar sesión
        </button>

        <button
          class="btn btn-secondary btn-sm"
          type="button"
          onclick={onCerrarModalCerrarSesion}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
{/if}

{#if mostrarEliminarCuenta}
  <div class="modal-backdrop-custom">
    <div class="modal-confirmacion">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="fw-bold mb-0">
          ¿Está seguro de que desea eliminar la cuenta?
        </h5>

        <button
          class="btn-close"
          type="button"
          onclick={onCerrarModalEliminarCuenta}
        ></button>
      </div>

      <p class="text-muted small mb-4">
        Al eliminar esta cuenta, se borrarán todos sus datos.
      </p>

      <div class="d-flex justify-content-end gap-2">
        <button
          class="btn btn-outline-danger btn-sm"
          type="button"
          onclick={confirmarEliminarCuenta}
        >
          Eliminar cuenta
        </button>

        <button
          class="btn btn-secondary btn-sm"
          type="button"
          onclick={onCerrarModalEliminarCuenta}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.48);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }

  .modal-confirmacion {
    width: 100%;
    max-width: 560px;
    background: #ffffff;
    border-radius: 8px;
    padding: 28px 32px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
  }
</style>