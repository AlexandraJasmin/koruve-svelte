<script>
  let password = $state('');
  let confirmarPassword = $state('');
  let mostrarPassword = $state(false);
  let mostrarConfirmar = $state(false);
  let error = $state('');
  let mensaje = $state('');

  function actualizarContrasena(event) {
    event.preventDefault();

    error = '';
    mensaje = '';

    if (!password || !confirmarPassword) {
      error = 'Debes completar ambos campos';
      return;
    }

    if (password !== confirmarPassword) {
      error = 'Las contraseñas no coinciden';
      return;
    }

    mensaje = 'Contraseña actualizada correctamente. Pendiente conectar endpoint.';
  }
</script>

<section class="auth-section password-section">
  <div class="auth-heading">
    <h1>Crea una nueva contraseña</h1>
    <p>Ingresa una nueva contraseña para acceder a tu cuenta</p>
  </div>

  <form class="auth-card password-card" onsubmit={actualizarContrasena}>
    <label for="password">Nueva contraseña</label>
    <div class="password-wrapper">
      <input
        id="password"
        type={mostrarPassword ? 'text' : 'password'}
        bind:value={password}
        placeholder="Crea una nueva contraseña"
        required
      />

      <button type="button" onclick={() => (mostrarPassword = !mostrarPassword)}>
        👁
      </button>
    </div>

    <label for="confirmarPassword">Confirmar contraseña</label>
    <div class="password-wrapper">
      <input
        id="confirmarPassword"
        type={mostrarConfirmar ? 'text' : 'password'}
        bind:value={confirmarPassword}
        placeholder="Repite la contraseña"
        required
      />

      <button type="button" onclick={() => (mostrarConfirmar = !mostrarConfirmar)}>
        👁
      </button>
    </div>

    {#if error}
      <p class="error-message">{error}</p>
    {/if}

    {#if mensaje}
      <p class="success-message">{mensaje}</p>
    {/if}

    <button class="submit-button" type="submit">
      Actualizar contraseña
    </button>
  </form>
</section>