<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { obtenerValoraciones } from '$lib/services/valoracionesService.js';

  let valoraciones = $state([]);
  let busqueda = $state('');
  let calificacion = $state('');
  let fecha = $state('');
  let tipo_experiencia = $state('todos');
  let orden = $state('recientes');

  let cargando = $state(false);
  let error = $state('');

  async function cargarValoraciones() {
    cargando = true;
    error = '';

    try {
      const data = await obtenerValoraciones({
        busqueda,
        calificacion,
        fecha,
        tipo_experiencia,
        orden
      });

      valoraciones = data.valoraciones;
    } catch (err) {
      error = err.message;
    } finally {
      cargando = false;
    }
  }

  function buscar(event) {
    event.preventDefault();
    cargarValoraciones();
  }

  function limpiarFiltros() {
    busqueda = '';
    calificacion = '';
    fecha = '';
    tipo_experiencia = 'todos';
    orden = 'recientes';
    cargarValoraciones();
  }

  function mostrarEstrellas(cantidad) {
    return '★'.repeat(cantidad) + '☆'.repeat(5 - cantidad);
  }

  onMount(() => {
    cargarValoraciones();
  });
</script>

<section class="valoraciones-hero">
  <div>
    <p>Inicio / Valoraciones</p>
    <h1>Valoraciones de las empresas</h1>
    <span>Explora reseñas reales de distintas empresas y conoce la experiencia de otros usuarios.</span>
  </div>
</section>

<section class="valoraciones-page">
  <aside class="valoraciones-filtros">
    <div class="filtros-card">
      <h3>Filtros</h3>

      <div class="filtro-grupo">
        <div class="filtro-titulo">
          <h4>Calificación</h4>
          <span>⌃</span>
        </div>

        <label>
          <input type="radio" name="calificacion" value="5" bind:group={calificacion} />
          5 estrellas
        </label>

        <label>
          <input type="radio" name="calificacion" value="4" bind:group={calificacion} />
          4 estrellas o más
        </label>

        <label>
          <input type="radio" name="calificacion" value="3" bind:group={calificacion} />
          3 estrellas o más
        </label>
      </div>

      <div class="filtro-grupo">
        <div class="filtro-titulo">
          <h4>Fecha</h4>
          <span>⌃</span>
        </div>

        <label>
          <input type="radio" name="fecha" value="semana" bind:group={fecha} />
          Última semana
        </label>

        <label>
          <input type="radio" name="fecha" value="mes" bind:group={fecha} />
          Último mes
        </label>

        <label>
          <input type="radio" name="fecha" value="tres_meses" bind:group={fecha} />
          Últimos 3 meses
        </label>
      </div>

      <div class="filtro-grupo">
        <div class="filtro-titulo">
          <h4>Tipo de experiencia</h4>
          <span>⌃</span>
        </div>

        <label>
          <input type="radio" name="tipo" value="positiva" bind:group={tipo_experiencia} />
          Positiva
        </label>

        <label>
          <input type="radio" name="tipo" value="neutral" bind:group={tipo_experiencia} />
          Neutral
        </label>

        <label>
          <input type="radio" name="tipo" value="negativa" bind:group={tipo_experiencia} />
          Negativa
        </label>
      </div>

      <button class="filtros-aplicar" type="button" onclick={cargarValoraciones}>
        Aplicar filtros
      </button>

      <button class="filtros-limpiar" type="button" onclick={limpiarFiltros}>
        Limpiar filtros
      </button>
    </div>
  </aside>

  <main class="valoraciones-contenido">
    <form class="valoraciones-top" onsubmit={buscar}>
      <div class="valoraciones-search">
        <span>⌕</span>
        <input
          type="text"
          bind:value={busqueda}
          placeholder="Buscar por empresa o cargo"
        />
      </div>

      <button type="submit" class="buscar-btn">Buscar</button>

      <button
        type="button"
        class="escribir-btn"
        onclick={() => goto('/valoraciones/escribir')}
      >
        Escribir reseña
      </button>
    </form>

    <div class="valoraciones-meta">
      <p>Mostrando {valoraciones.length} reseñas</p>

      <select bind:value={orden} onchange={cargarValoraciones}>
        <option value="recientes">Más recientes</option>
        <option value="mejor_calificadas">Mejor calificadas</option>
        <option value="menor_calificadas">Menor calificadas</option>
      </select>
    </div>

    {#if error}
      <div class="valoraciones-error">{error}</div>
    {/if}

    {#if cargando}
      <div class="valoraciones-empty">Cargando valoraciones...</div>
    {:else if valoraciones.length === 0}
      <div class="valoraciones-empty">
        <h2>No hay valoraciones todavía</h2>
        <p>Cuando los usuarios escriban reseñas, aparecerán aquí.</p>
      </div>
    {:else}
      <section class="valoraciones-lista">
        {#each valoraciones as valoracion}
          <article class="valoracion-card">
            <div class="valoracion-card-header">
              <div>
                <h2>{valoracion.empresa_nombre}</h2>
                <p>{valoracion.puesto}</p>
              </div>

              <span class={`experiencia-badge ${valoracion.tipo_experiencia}`}>
                {valoracion.tipo_experiencia}
              </span>
            </div>

            <div class="valoracion-stars">
              {mostrarEstrellas(valoracion.calificacion)}
            </div>

            <p class="valoracion-texto">
              {valoracion.resena}
            </p>

            <div class="valoracion-footer">
              <span>Por {valoracion.usuario_nombre}</span>
              <span>{new Date(valoracion.fecha_valoracion).toLocaleDateString()}</span>
            </div>
          </article>
        {/each}
      </section>
    {/if}
  </main>
</section>