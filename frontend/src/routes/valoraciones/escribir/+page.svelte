<script>
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore.js';
  import { crearValoracion } from '$lib/services/valoracionesService.js';

  let id_empresa = $state('');
  let puesto = $state('');
  let tipo_experiencia = $state('positiva');
  let calificacion = $state(0);
  let resena = $state('');

  let cargando = $state(false);
  let error = $state('');
  let mensaje = $state('');

  const sesionActiva = $derived($authStore.autenticado === true);
  const datosUsuario = $derived($authStore.datos);
  const tipoCuenta = $derived($authStore.tipoCuenta);

  function seleccionarExperiencia(tipo) {
    tipo_experiencia = tipo;
  }

  function seleccionarCalificacion(valor) {
    calificacion = valor;
  }

  async function publicarResena(event) {
    event.preventDefault();

    error = '';
    mensaje = '';

    if (!sesionActiva) {
      error = 'Debes iniciar sesión para escribir una reseña.';
      return;
    }

    if (tipoCuenta !== 'usuario') {
      error = 'Solo los usuarios candidatos pueden escribir reseñas.';
      return;
    }

    if (!id_empresa || !puesto || !tipo_experiencia || !calificacion || !resena) {
      error = 'Debes completar todos los campos.';
      return;
    }

    cargando = true;

    try {
      await crearValoracion({
        id_usuario: datosUsuario?.id_usuario,
        id_empresa: Number(id_empresa),
        puesto,
        tipo_experiencia,
        calificacion: Number(calificacion),
        resena
      });

      mensaje = 'Reseña publicada correctamente';

      setTimeout(() => {
        goto('/valoraciones');
      }, 800);
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }
</script>

<section class="valoraciones-form-hero">
  <div>
    <p>Inicio / Valoraciones / Escribir reseña</p>
    <h1>Escribir reseña</h1>
  </div>
</section>

<section class="resena-page">
  <form class="resena-card" onsubmit={publicarResena}>
    <a href="/valoraciones" class="resena-close">×</a>

    <label for="empresa">Empresa</label>
    <input
      id="empresa"
      type="number"
      bind:value={id_empresa}
      placeholder="Ingresa el ID de la empresa. Ej: 1"
      required
    />

    <label for="puesto">Puesto</label>
    <input
      id="puesto"
      type="text"
      bind:value={puesto}
      placeholder="Ej: Frontend Developer"
      required
    />

    <label>Tipo de experiencia</label>
    <div class="experiencia-options">
      <button
        type="button"
        class:active={tipo_experiencia === 'positiva'}
        class="positiva"
        onclick={() => seleccionarExperiencia('positiva')}
      >
        Positiva
      </button>

      <button
        type="button"
        class:active={tipo_experiencia === 'neutral'}
        class="neutral"
        onclick={() => seleccionarExperiencia('neutral')}
      >
        Neutral
      </button>

      <button
        type="button"
        class:active={tipo_experiencia === 'negativa'}
        class="negativa"
        onclick={() => seleccionarExperiencia('negativa')}
      >
        Negativa
      </button>
    </div>

    <label>Calificación</label>
    <div class="rating-stars">
      {#each [1, 2, 3, 4, 5] as estrella}
        <button
          type="button"
          class:active={calificacion >= estrella}
          onclick={() => seleccionarCalificacion(estrella)}
        >
          ★
        </button>
      {/each}
    </div>

    <label for="resena">Reseña</label>
    <textarea
      id="resena"
      bind:value={resena}
      placeholder="Describe tu experiencia..."
      required
    ></textarea>

    {#if error}
      <div class="valoraciones-error">{error}</div>
    {/if}

    {#if mensaje}
      <div class="valoraciones-success">{mensaje}</div>
    {/if}

    <div class="resena-actions">
      <button type="button" class="cancelar-resena" onclick={() => goto('/valoraciones')}>
        Cancelar
      </button>

      <button type="submit" class="publicar-resena" disabled={cargando}>
        {cargando ? 'Publicando...' : 'Publicar reseña'}
      </button>
    </div>
  </form>
</section>