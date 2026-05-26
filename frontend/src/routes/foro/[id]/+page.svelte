<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/authStore.js';
  import {
    obtenerPublicacionPorId,
    crearComentario
  } from '$lib/services/foroService.js';

  const idPublicacion = $derived(page.params.id);

  let publicacion = $state(null);
  let comentarios = $state([]);
  let nuevoComentario = $state('');
  let cargando = $state(false);
  let enviando = $state(false);
  let error = $state('');
  let mensaje = $state('');

  const sesionActiva = $derived($authStore.autenticado === true);
  const tipoCuenta = $derived($authStore.tipoCuenta);
  const datosCuenta = $derived($authStore.datos);

  function obtenerAutorComentario() {
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

  async function cargarDetalle() {
    cargando = true;
    error = '';

    try {
      const data = await obtenerPublicacionPorId(idPublicacion);
      publicacion = data.publicacion;
      comentarios = data.comentarios;
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }

  async function comentar(event) {
    event.preventDefault();

    error = '';
    mensaje = '';

    if (!sesionActiva) {
      error = 'Debes iniciar sesión para comentar.';
      return;
    }

    if (!nuevoComentario.trim()) {
      error = 'Escribe un comentario antes de enviarlo.';
      return;
    }

    const autor = obtenerAutorComentario();

    if (!autor) {
      error = 'No se pudo identificar tu cuenta.';
      return;
    }

    enviando = true;

    try {
      await crearComentario(idPublicacion, {
        comentario: nuevoComentario,
        ...autor
      });

      nuevoComentario = '';
      mensaje = 'Comentario agregado correctamente';
      await cargarDetalle();
    } catch (err) {
      error = err.message;
    } finally {
      enviando = false;
    }
  }

  onMount(() => {
    cargarDetalle();
  });
</script>

<section class="foro-detail-page">
  <aside class="foro-detail-side">
    <button type="button" onclick={() => goto('/foro')}>
      ← Volver al foro
    </button>

    <p>Detalle de publicación y respuestas.</p>
  </aside>

  <main class="foro-detail-content">
    {#if error}
      <div class="foro-error">{error}</div>
    {/if}

    {#if cargando}
      <div class="foro-loading">Cargando publicación...</div>
    {:else if publicacion}
      <article class="foro-detail-card">
        <div class="foro-card-header">
          <span class="foro-type">{publicacion.tipo}</span>
          <span>{new Date(publicacion.fecha_publicacion).toLocaleDateString()}</span>
        </div>

        <h1>{publicacion.titulo}</h1>
        <p>{publicacion.contenido}</p>

        {#if publicacion.imagen_url}
          <img src={publicacion.imagen_url} alt={publicacion.titulo} />
        {/if}

        <div class="foro-card-footer">
          <span>Publicado por {publicacion.autor_nombre || 'Autor desconocido'}</span>
        </div>
      </article>
    {/if}

    <section class="comentarios-section">
      <h2>Comentarios</h2>

      <form class="comentario-form" onsubmit={comentar}>
        <textarea
          bind:value={nuevoComentario}
          placeholder="Escribe aquí tu comentario..."
        ></textarea>

        {#if mensaje}
          <p class="foro-success">{mensaje}</p>
        {/if}

        <div class="comentario-actions">
          <button type="submit" disabled={enviando}>
            {enviando ? 'Comentando...' : 'Comentar'}
          </button>
        </div>
      </form>

      <div class="comentarios-list">
        {#if comentarios.length === 0}
          <p class="sin-comentarios">Todavía no hay comentarios.</p>
        {:else}
          {#each comentarios as comentario}
            <article class="comentario-card">
              <div class="comment-avatar">
                {(comentario.autor_nombre || 'A').charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{comentario.autor_nombre || 'Autor desconocido'}</h3>
                <p>{comentario.comentario}</p>
                <span>{new Date(comentario.fecha_comentario).toLocaleString()}</span>
              </div>
            </article>
          {/each}
        {/if}
      </div>
    </section>
  </main>
</section>