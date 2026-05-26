<script>
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore.js';
  import { crearPublicacion } from '$lib/services/foroService.js';

  let tipo = $state('');
  let titulo = $state('');
  let contenido = $state('');
  let imagen_url = $state('');
  let cargando = $state(false);
  let error = $state('');
  let mensaje = $state('');

  const sesionActiva = $derived($authStore.autenticado === true);
  const tipoCuenta = $derived($authStore.tipoCuenta);
  const datosCuenta = $derived($authStore.datos);

  function obtenerAutor() {
    if (tipoCuenta === 'usuario') {
      return {
        autor_tipo: 'usuario',
        id_usuario: datosCuenta?.id_usuario,
        id_empresa: null
      };
    }

    if (tipoCuenta === 'empresa') {
      return {
        autor_tipo: 'empresa',
        id_usuario: null,
        id_empresa: datosCuenta?.id_empresa
      };
    }

    return null;
  }

  async function publicar(event) {
    event.preventDefault();

    error = '';
    mensaje = '';

    if (!sesionActiva) {
      error = 'Debes iniciar sesión para crear una publicación.';
      return;
    }

    if (!tipo || !titulo || !contenido) {
      error = 'Debes completar tipo, título y contenido.';
      return;
    }

    const autor = obtenerAutor();

    if (!autor) {
      error = 'No se pudo identificar el tipo de cuenta.';
      return;
    }

    cargando = true;

    try {
      await crearPublicacion({
        titulo,
        contenido,
        tipo,
        imagen_url: imagen_url || null,
        ...autor
      });

      mensaje = 'Publicación creada correctamente';

      setTimeout(() => {
        goto('/foro');
      }, 800);
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }
</script>

<section class="crear-foro-page">
  <form class="crear-foro-card" onsubmit={publicar}>
    {#if error}
      <div class="foro-error">{error}</div>
    {/if}

    {#if mensaje}
      <div class="foro-success">{mensaje}</div>
    {/if}

    <select bind:value={tipo} required>
      <option value="">Elige el tipo de publicación</option>
      <option value="pregunta">Pregunta</option>
      <option value="debate">Debate</option>
      <option value="tutorial">Tutorial</option>
    </select>

    <input
      type="text"
      bind:value={titulo}
      placeholder="Escribe un título que llame la atención"
      required
    />

    <textarea
      bind:value={contenido}
      placeholder="Escribe aquí tu opinión o pregunta....."
      required
    ></textarea>

    <div class="image-row">
      <input
        type="text"
        bind:value={imagen_url}
        placeholder="URL de imagen opcional"
      />

      <button type="button" class="image-button">
        🖼 Agregar imagen
      </button>
    </div>

    <div class="crear-actions">
      <button type="button" class="cancel-button" onclick={() => goto('/foro')}>
        Cancelar
      </button>

      <button type="submit" class="publish-button" disabled={cargando}>
        ✈ {cargando ? 'Publicando...' : 'Publicar'}
      </button>
    </div>
  </form>
</section>