<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { obtenerPublicaciones } from '$lib/services/foroService.js';

  let publicaciones = $state([]);
  let busqueda = $state('');
  let tipo = $state('todos');
  let cargando = $state(false);
  let error = $state('');

  async function cargarPublicaciones() {
    cargando = true;
    error = '';

    try {
      const data = await obtenerPublicaciones({
        busqueda,
        tipo
      });

      publicaciones = data.publicaciones;
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }

  function buscar(event) {
    event.preventDefault();
    cargarPublicaciones();
  }

  function cambiarTipo(nuevoTipo) {
    tipo = nuevoTipo;
    cargarPublicaciones();
  }

  function verDetalle(id) {
    goto(`/foro/${id}`);
  }

  onMount(() => {
    cargarPublicaciones();
  });
</script>

<section class="foro-hero">
  <div class="foro-hero-content">
    <p>Home / Foro</p>
    <h1>Foro</h1>
    <span>Participa en debates, haz preguntas y comparte conocimientos con otros usuarios.</span>
  </div>
</section>

<section class="foro-page">
  <aside class="foro-sidebar">
    <form class="foro-search" onsubmit={buscar}>
      <label for="busqueda">Buscar por palabras clave</label>

      <div class="search-box">
        <span>⌕</span>
        <input
          id="busqueda"
          type="text"
          bind:value={busqueda}
          placeholder="Buscar temas, preguntas o palabras"
        />
      </div>
    </form>

    <div class="foro-filter-card">
      <div class="filter-title">
        <h3>Tipo de publicación</h3>
        <span>⌃</span>
      </div>

      <label>
        <input
          type="radio"
          name="tipo"
          checked={tipo === 'todos'}
          onchange={() => cambiarTipo('todos')}
        />
        Todos
      </label>

      <label>
        <input
          type="radio"
          name="tipo"
          checked={tipo === 'pregunta'}
          onchange={() => cambiarTipo('pregunta')}
        />
        Pregunta
      </label>

      <label>
        <input
          type="radio"
          name="tipo"
          checked={tipo === 'debate'}
          onchange={() => cambiarTipo('debate')}
        />
        Debate
      </label>

      <label>
        <input
          type="radio"
          name="tipo"
          checked={tipo === 'tutorial'}
          onchange={() => cambiarTipo('tutorial')}
        />
        Tutorial
      </label>
    </div>

    <button class="crear-publicacion-btn" type="button" onclick={() => goto('/foro/crear')}>
      Crear publicación
    </button>
  </aside>

  <main class="foro-content">
    {#if error}
      <div class="foro-error">{error}</div>
    {/if}

    {#if cargando}
      <div class="foro-loading">Cargando publicaciones...</div>
    {:else if publicaciones.length === 0}
      <div class="foro-empty">
        <h2>No hay publicaciones todavía</h2>
        <p>Crea la primera publicación del foro.</p>
      </div>
    {:else}
      <div class="foro-list">
        {#each publicaciones as publicacion}
          <article class="foro-card" onclick={() => verDetalle(publicacion.id_publicacion)}>
            <div class="foro-card-header">
              <span class="foro-type">{publicacion.tipo}</span>
              <span class="foro-date">
                {new Date(publicacion.fecha_publicacion).toLocaleDateString()}
              </span>
            </div>

            <h2>{publicacion.titulo}</h2>
            <p>{publicacion.contenido}</p>

            <div class="foro-card-footer">
              <span>Por {publicacion.autor_nombre || 'Autor desconocido'}</span>
              <span>{publicacion.total_comentarios} comentarios</span>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </main>
</section>