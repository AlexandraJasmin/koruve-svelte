<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  import {
    obtenerOfertas,
    obtenerDetalleOferta
  } from '$lib/services/ofertasService.js';

  import {
    crearAplicacion
  } from '$lib/services/aplicacionesService.js';

  import {
    verificarGuardado,
    guardarEmpleo,
    eliminarGuardadoPorUsuarioYOferta
  } from '$lib/services/guardadosService.js';

  let oferta = $state(null);
  let relacionadas = $state([]);
  let cargando = $state(false);
  let error = $state('');
  let aplicando = $state(false);
  let mensajeAplicacion = $state('');

  let empleoGuardado = $state(false);
  let idGuardadoActual = $state(null);
  let guardandoEmpleo = $state(false);
  let mensajeGuardado = $state('');

  let mostrarModalAplicacion = $state(false);
  let faltantesAplicacion = $state([]);
  let puedeAplicar = $state(false);

  let mostrarModalExito = $state(false);
  let mensajeExito = $state('');

  let usuarioActual = $state({
    id_usuario: 1,
    nombre_completo: 'Ana López',
    correo: 'ana@example.com',
    telefono: '',
    curriculum: ''
  });

  function formatearSalario(salario) {
    if (salario === null || salario === undefined || salario === '') {
      return 'No especificado';
    }

    return '$' + Number(salario).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatearFecha(fechaISO) {
    if (!fechaISO) return 'No definida';

    return new Date(fechaISO).toLocaleDateString('es-SV', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function tiempoRelativo(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';

    const ahora = new Date();
    const fecha = new Date(fechaISO);
    const diffMs = ahora - fecha;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) return 'Hace unos minutos';
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;

    return `Hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
  }

  function cargarUsuarioSesion() {
    const sesionKoruve = localStorage.getItem('koruveSesion');
    const sesionActiva = localStorage.getItem('sesionActiva');
    const curriculumLocal = localStorage.getItem('curriculumUsuarioLocal');

    let sesion = null;

    if (sesionKoruve) {
      sesion = JSON.parse(sesionKoruve);
    } else if (sesionActiva) {
      sesion = JSON.parse(sesionActiva);
    }

    const datos = sesion?.datos || sesion?.usuario || sesion;

    let curriculum = datos?.curriculum || datos?.cv || '';

    if (!curriculum && curriculumLocal) {
      const cv = JSON.parse(curriculumLocal);
      curriculum = cv.nombreArchivo || cv.archivo_cv || '';
    }

    if (datos) {
      usuarioActual = {
        id_usuario: datos.id_usuario || datos.id || 1,
        nombre_completo: datos.nombre_completo || datos.nombre || '',
        correo: datos.correo || '',
        telefono: datos.telefono || '',
        curriculum
      };
    }
  }

  function obtenerIdUsuarioActual() {
    cargarUsuarioSesion();
    return usuarioActual.id_usuario || 1;
  }

  async function verificarEstadoGuardado(idOferta) {
    mensajeGuardado = '';

    try {
      const idUsuario = obtenerIdUsuarioActual();
      const data = await verificarGuardado(idUsuario, idOferta);

      empleoGuardado = data.guardado;
      idGuardadoActual = data.empleo_guardado?.id_guardado || null;
    } catch (err) {
      console.error('Error al verificar guardado:', err);
      empleoGuardado = false;
      idGuardadoActual = null;
    }
  }

  async function alternarGuardado() {
    if (!oferta) return;

    guardandoEmpleo = true;
    mensajeGuardado = '';

    try {
      const idUsuario = obtenerIdUsuarioActual();

      if (empleoGuardado) {
        await eliminarGuardadoPorUsuarioYOferta(idUsuario, oferta.id_oferta);

        empleoGuardado = false;
        idGuardadoActual = null;
        mensajeGuardado = 'Empleo eliminado de guardados.';
      } else {
        const data = await guardarEmpleo(idUsuario, oferta.id_oferta);

        empleoGuardado = true;
        idGuardadoActual = data.guardado?.id_guardado || null;
        mensajeGuardado = 'Empleo guardado correctamente.';
      }
    } catch (err) {
      console.error('Error al guardar/eliminar empleo:', err);
      mensajeGuardado = err.message || 'No se pudo actualizar el empleo guardado.';
    } finally {
      guardandoEmpleo = false;
    }
  }

  async function cargarDetalle() {
    cargando = true;
    error = '';

    try {
      const paginaActual = get(page);
      const id = paginaActual.params.id;

      oferta = await obtenerDetalleOferta(id);

      await verificarEstadoGuardado(oferta.id_oferta);
      await cargarRelacionadas(oferta);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      error = err.message || 'No se pudo cargar el detalle del empleo.';
    } finally {
      cargando = false;
    }
  }

  async function cargarRelacionadas(ofertaActual) {
    try {
      const data = await obtenerOfertas();

      relacionadas = data
        .filter((item) => Number(item.id_oferta) !== Number(ofertaActual.id_oferta))
        .filter((item) => {
          const mismoRubro =
            item.rubro &&
            ofertaActual.rubro &&
            item.rubro.toLowerCase() === ofertaActual.rubro.toLowerCase();

          const mismaUbicacion =
            item.ubicacion &&
            ofertaActual.ubicacion &&
            item.ubicacion.toLowerCase() === ofertaActual.ubicacion.toLowerCase();

          return mismoRubro || mismaUbicacion;
        })
        .slice(0, 3);
    } catch (err) {
      console.error('Error al cargar relacionadas:', err);
      relacionadas = [];
    }
  }

  function revisarRequisitosAplicacion() {
    mensajeAplicacion = '';
    cargarUsuarioSesion();

    const faltantes = [];

    if (!usuarioActual.nombre_completo) {
      faltantes.push('Completar tu nombre completo');
    }

    if (!usuarioActual.correo) {
      faltantes.push('Agregar tu correo electrónico');
    }

    if (!usuarioActual.telefono) {
      faltantes.push('Agregar tu número de teléfono');
    }

    if (!usuarioActual.curriculum) {
      faltantes.push('Subir o registrar tu currículum');
    }

    faltantesAplicacion = faltantes;
    puedeAplicar = faltantes.length === 0;
    mostrarModalAplicacion = true;
  }

  function cerrarModalAplicacion() {
    mostrarModalAplicacion = false;
  }

  function cerrarModalExito() {
    mostrarModalExito = false;
    goto('/usuario/dashboard');
  }

  async function aplicarAOferta() {
    if (!oferta) return;

    aplicando = true;
    mensajeAplicacion = '';
    mensajeExito = '';

    try {
      const data = await crearAplicacion(
        usuarioActual.id_usuario || 1,
        oferta.id_oferta
      );

      mensajeExito = data.mensaje || 'Solicitud enviada correctamente.';
      mostrarModalAplicacion = false;
      mostrarModalExito = true;
    } catch (err) {
      console.error('Error al aplicar:', err);
      mensajeAplicacion = err.message || 'No se pudo aplicar a esta oferta.';
    } finally {
      aplicando = false;
    }
  }

  function volverEmpleos() {
    goto('/empleos');
  }

  function irRelacionado(idOferta) {
    goto(`/empleos/${idOferta}`);
  }

  function irPerfil() {
    goto('/usuario/perfil');
  }

  onMount(() => {
    cargarUsuarioSesion();
    cargarDetalle();
  });
</script>

<svelte:head>
  <title>{oferta ? `${oferta.titulo} | Koruve` : 'Detalle de empleo | Koruve'}</title>
</svelte:head>

{#if cargando}
  <section class="container py-5">
    <div class="alert alert-light border rounded-4">
      Cargando detalle del empleo...
    </div>
  </section>
{:else if error}
  <section class="container py-5">
    <div class="alert alert-danger rounded-4">
      {error}
    </div>

    <button class="btn outline-back rounded-3 mt-3" type="button" onclick={volverEmpleos}>
      Volver al listado de empleos
    </button>
  </section>
{:else if oferta}
  <main class="container pt-5 pb-4">
    <div class="row mb-5">
      <div class="col-12">
        <nav aria-label="breadcrumb" class="mb-2">
          <ol class="breadcrumb mb-1 small">
            <li class="breadcrumb-item">
              <a href="/" class="text-decoration-none text-muted">Inicio</a>
            </li>

            <li class="breadcrumb-item">
              <a href="/empleos" class="text-decoration-none text-muted">Empleos</a>
            </li>

            <li class="breadcrumb-item active text-dark fw-semibold">
              {oferta.titulo}
            </li>
          </ol>
        </nav>

        <div class="d-flex justify-content-between align-items-start gap-4 flex-wrap mt-5">
          <div class="d-flex gap-4 align-items-start">
            <img
              src="/img/logo.png"
              alt={oferta.nombre_empresa || 'Empresa'}
              class="rounded"
              style="width:62px; height:62px; object-fit:cover;"
            >

            <div>
              <h2 class="fw-bold mb-2 main-title">
                {oferta.titulo}
              </h2>

              <div class="d-flex flex-wrap gap-3 meta-text mb-3">
                <span>
                  <i class="bi bi-briefcase me-1"></i>
                  {oferta.nombre_empresa || 'Empresa no disponible'}
                </span>

                <span>
                  <i class="bi bi-geo-alt me-1"></i>
                  {oferta.ubicacion || 'Ubicación no disponible'}
                </span>

                <span>
                  <i class="bi bi-clock me-1"></i>
                  {tiempoRelativo(oferta.fecha_publicacion)}
                </span>

                <span>
                  <i class="bi bi-cash me-1"></i>
                  {formatearSalario(oferta.salario)}
                </span>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <span class="badge rounded-pill px-3 py-2 fw-normal job-badge-main">
                  {oferta.tipo_contrato || 'Tipo no especificado'}
                </span>

                <span class="badge rounded-pill px-3 py-2 fw-normal job-badge-urgent">
                  {oferta.modalidad || 'Modalidad no especificada'}
                </span>

                {#if oferta.rubro}
                  <span class="badge rounded-pill px-3 py-2 fw-normal job-badge-category">
                    {oferta.rubro}
                  </span>
                {/if}
              </div>
            </div>
          </div>

          <div class="text-center" style="min-width:280px;">
            <h6 class="fw-bold mb-1">Publicado</h6>

            <p class="text-muted mb-3" style="font-size:13px;">
              {formatearFecha(oferta.fecha_publicacion)}
            </p>

            <div class="d-flex justify-content-center align-items-center gap-2 flex-wrap">
              <button
                class="btn text-white rounded-3 apply-btn"
                type="button"
                onclick={revisarRequisitosAplicacion}
                disabled={aplicando}
              >
                Solicitar empleo
              </button>

              <button
                class={`save-job-btn ${empleoGuardado ? 'saved' : ''}`}
                type="button"
                title={empleoGuardado ? 'Eliminar de guardados' : 'Guardar empleo'}
                onclick={alternarGuardado}
                disabled={guardandoEmpleo}
              >
                <i class={empleoGuardado ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'}></i>
              </button>
            </div>

            {#if mensajeGuardado}
              <div class="alert alert-light border mt-3 py-2 mb-0">
                {mensajeGuardado}
              </div>
            {/if}

            {#if mensajeAplicacion}
              <div class="alert alert-info mt-3 py-2 mb-0">
                {mensajeAplicacion}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 align-items-start">
      <div class="col-lg-8">
        <section class="mb-5">
          <h4 class="fw-bold mb-4 section-title">Descripción del trabajo</h4>

          <p class="body-text mb-0">
            {oferta.descripcion || 'No especificada'}
          </p>
        </section>

        <section class="mb-5">
          <h4 class="fw-bold mb-4 section-title">Requisitos</h4>

          <ul class="body-text ps-3 mb-0">
            {#each (oferta.requisitos || 'No especificados').split('\n') as requisito}
              <li>{requisito}</li>
            {/each}
          </ul>
        </section>

        <section class="mb-5">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="fw-semibold me-2" style="font-size:14px;">Compartir este trabajo</span>
            <a href="/" class="btn btn-sm text-white px-3" style="background-color:#4267B2; font-size:12px;">Facebook</a>
            <a href="/" class="btn btn-sm text-white px-3" style="background-color:#1DA1F2; font-size:12px;">Twitter</a>
            <a href="/" class="btn btn-sm text-white px-3" style="background-color:#DB4437; font-size:12px;">Correo</a>
          </div>
        </section>

        <section>
          <h3 class="fw-bold mb-4" style="font-size:1.55rem;">Empleos relacionados</h3>

          {#if relacionadas.length === 0}
            <div class="card border related-card p-4 mb-3">
              <div class="text-muted">No hay empleos relacionados disponibles.</div>
            </div>
          {:else}
            {#each relacionadas as relacionada}
              <div
                class="card border related-card p-4 mb-3"
                role="button"
                tabindex="0"
                onclick={() => irRelacionado(relacionada.id_oferta)}
                onkeydown={(event) => event.key === 'Enter' && irRelacionado(relacionada.id_oferta)}
              >
                <div class="d-flex gap-3 align-items-start">
                  <img
                    src="/img/logo.png"
                    alt={relacionada.nombre_empresa || 'Empresa'}
                    class="rounded"
                    style="width:50px; height:50px; object-fit:cover;"
                  >

                  <div class="w-100">
                    <h6 class="fw-bold mb-2">
                      {relacionada.titulo || 'Sin título'}
                    </h6>

                    <div class="d-flex flex-wrap gap-3 text-muted mb-2" style="font-size:13px;">
                      <span>
                        <i class="bi bi-briefcase me-1"></i>
                        {relacionada.nombre_empresa || 'Empresa'}
                      </span>

                      <span>
                        <i class="bi bi-geo-alt me-1"></i>
                        {relacionada.ubicacion || 'Sin ubicación'}
                      </span>

                      <span>
                        <i class="bi bi-clock me-1"></i>
                        {tiempoRelativo(relacionada.fecha_publicacion)}
                      </span>

                      <span>
                        <i class="bi bi-cash me-1"></i>
                        {formatearSalario(relacionada.salario)}
                      </span>
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                      <span class="badge rounded-pill px-3 py-2 fw-normal job-badge-main">
                        {relacionada.tipo_contrato || 'No especificado'}
                      </span>

                      <span class="badge rounded-pill px-3 py-2 fw-normal job-badge-urgent">
                        {relacionada.modalidad || 'No especificada'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </section>
      </div>

      <aside class="col-lg-4 pt-lg-5">
        <div class="card border-0 sidebar-card p-4 mb-4" style="margin-top:5px;">
          <h5 class="fw-bold mb-4">Resumen del trabajo</h5>

          <div class="d-flex gap-3 mb-4">
            <i class="bi bi-briefcase job-summary-icon"></i>
            <div>
              <h6 class="fw-bold mb-1 mini-label">Tipo de contrato:</h6>
              <p class="mini-value mb-0">{oferta.tipo_contrato || 'No especificado'}</p>
            </div>
          </div>

          <div class="d-flex gap-3 mb-4">
            <i class="bi bi-laptop job-summary-icon"></i>
            <div>
              <h6 class="fw-bold mb-1 mini-label">Modalidad:</h6>
              <p class="mini-value mb-0">{oferta.modalidad || 'No especificada'}</p>
            </div>
          </div>

          <div class="d-flex gap-3 mb-4">
            <i class="bi bi-tags job-summary-icon"></i>
            <div>
              <h6 class="fw-bold mb-1 mini-label">Área:</h6>
              <p class="mini-value mb-0">{oferta.rubro || 'No especificada'}</p>
            </div>
          </div>

          <div class="d-flex gap-3 mb-4">
            <i class="bi bi-cash-coin job-summary-icon"></i>
            <div>
              <h6 class="fw-bold mb-1 mini-label">Salario:</h6>
              <p class="mini-value mb-0">{formatearSalario(oferta.salario)}</p>
            </div>
          </div>

          <h6 class="fw-bold mb-3">Ubicación del trabajo</h6>

          <div class="mb-2 mini-value">
            <strong class="text-dark">Ubicación:</strong>
            <span>{oferta.ubicacion || 'No especificada'}</span>
          </div>

          <div class="rounded-4 overflow-hidden mb-3" style="height:190px;">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(oferta.ubicacion || 'San Salvador El Salvador')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style="border:0;"
              title="Mapa de ubicación"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>

        <div class="card border-0 sidebar-card p-4 mb-3">
          <div class="d-flex gap-3 align-items-center mb-4">
            <img
              src="/img/logo.png"
              alt={oferta.nombre_empresa || 'Empresa'}
              class="rounded"
              style="width:50px; height:50px; object-fit:cover;"
            >

            <div>
              <h5 class="fw-bold mb-1">{oferta.nombre_empresa || 'Empresa no disponible'}</h5>
              <a href="/" class="text-decoration-none small" style="color:#2F73D9;">Ver perfil de empresa</a>
            </div>
          </div>

          <div class="d-flex justify-content-between mb-3" style="font-size:14px;">
            <span class="fw-semibold">Rubro:</span>
            <span class="text-muted text-end">{oferta.rubro || 'No especificado'}</span>
          </div>

          <div class="d-flex justify-content-between mb-3" style="font-size:14px;">
            <span class="fw-semibold">Teléfono:</span>
            <span class="text-muted text-end">{oferta.telefono || 'No especificado'}</span>
          </div>

          <div class="d-flex justify-content-between mb-3" style="font-size:14px;">
            <span class="fw-semibold">Correo:</span>
            <span class="text-muted text-end">{oferta.correo || 'No especificado'}</span>
          </div>

          <div class="mb-3" style="font-size:14px;">
            <span class="fw-semibold d-block mb-2">Descripción:</span>
            <p class="text-muted mb-0">
              {oferta.descripcion_empresa || 'No especificada'}
            </p>
          </div>

          {#if oferta.sitio_web}
            <a
              href={oferta.sitio_web}
              target="_blank"
              rel="noopener noreferrer"
              class="btn w-100 py-3 fw-semibold rounded-3 company-link-btn"
            >
              Sitio web
            </a>
          {:else}
            <button class="btn w-100 py-3 fw-semibold rounded-3 company-link-btn" type="button" disabled>
              Sitio no disponible
            </button>
          {/if}
        </div>

        <button class="btn outline-back w-100 py-2 rounded-3" type="button" onclick={volverEmpleos}>
          Volver al listado de empleos
        </button>
      </aside>
    </div>
  </main>

  <footer class="text-white py-5 mt-5" style="background-color:#2C3B4E;">
    <div class="container">
      <div class="row gy-4">
        <div class="col-md-4">
          <h2 class="fw-bold mb-2">Koruve</h2>
          <p class="mb-0">Llama ahora: +503 77458990</p>
        </div>

        <div class="col-6 col-md-2">
          <h5 class="fw-semibold mb-3">Empresa</h5>

          <ul class="list-unstyled">
            <li class="mb-2"><a href="/" class="text-white text-decoration-none">Sobre nosotros</a></li>
            <li class="mb-2"><a href="/" class="text-white text-decoration-none">Contáctanos</a></li>
            <li><a href="/empleos" class="text-white text-decoration-none">Empleos</a></li>
          </ul>
        </div>

        <div class="col-6 col-md-2">
          <h5 class="fw-semibold mb-3">Servicios</h5>

          <ul class="list-unstyled">
            <li class="mb-2"><a href="/" class="text-white text-decoration-none">Finanzas</a></li>
            <li class="mb-2"><a href="/" class="text-white text-decoration-none">Marketing</a></li>
            <li><a href="/" class="text-white text-decoration-none">Diseño</a></li>
          </ul>
        </div>

        <div class="col-6 col-md-3">
          <h5 class="fw-semibold mb-3">Legal</h5>

          <ul class="list-unstyled">
            <li class="mb-2"><a href="/" class="text-white text-decoration-none">Política de Privacidad</a></li>
            <li><a href="/" class="text-white text-decoration-none">Términos y condiciones</a></li>
          </ul>
        </div>
      </div>

      <hr class="border-light my-4">

      <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
        <p class="mb-3 mb-md-0">© 2026 Copyright, All Right</p>

        <div class="d-flex gap-3 fs-5">
          <a href="/" class="text-white text-decoration-none">Twitter</a>
          <a href="/" class="text-white text-decoration-none">Facebook</a>
          <a href="/" class="text-white text-decoration-none">Instagram</a>
          <a href="/" class="text-white text-decoration-none">LinkedIn</a>
        </div>
      </div>
    </div>
  </footer>
{/if}

{#if mostrarModalAplicacion}
  <div class="modal-backdrop-custom">
    <div class="modal-card-custom">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h4 class="fw-bold mb-1">Revisión de postulación</h4>
          <p class="text-muted mb-0">
            Antes de aplicar, revisaremos que tu perfil tenga la información necesaria.
          </p>
        </div>

        <button class="btn-close" type="button" onclick={cerrarModalAplicacion}></button>
      </div>

      {#if faltantesAplicacion.length > 0}
        <div class="alert alert-warning rounded-4">
          <strong>Te falta completar lo siguiente:</strong>
        </div>

        <ul class="list-group mb-4">
          {#each faltantesAplicacion as item}
            <li class="list-group-item d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-circle text-warning"></i>
              {item}
            </li>
          {/each}
        </ul>

        <p class="text-muted small">
          Completa estos datos en tu perfil para poder enviar tu postulación correctamente.
        </p>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" type="button" onclick={cerrarModalAplicacion}>
            Cerrar
          </button>

          <button class="btn text-white" type="button" style="background-color:#2F73D9;" onclick={irPerfil}>
            Ir a mi perfil
          </button>
        </div>
      {:else}
        <div class="alert alert-success rounded-4">
          Tu perfil tiene la información necesaria para aplicar.
        </div>

        <div class="card border-0 bg-light rounded-4 p-3 mb-4">
          <p class="mb-2">
            <strong>Empleo:</strong> {oferta?.titulo}
          </p>

          <p class="mb-2">
            <strong>Empresa:</strong> {oferta?.nombre_empresa}
          </p>

          <p class="mb-2">
            <strong>Nombre:</strong> {usuarioActual.nombre_completo}
          </p>

          <p class="mb-0">
            <strong>Correo:</strong> {usuarioActual.correo}
          </p>
        </div>

        {#if mensajeAplicacion}
          <div class="alert alert-info rounded-4">
            {mensajeAplicacion}
          </div>
        {/if}

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" type="button" onclick={cerrarModalAplicacion}>
            Cancelar
          </button>

          <button
            class="btn text-white"
            type="button"
            style="background-color:#2F73D9;"
            onclick={aplicarAOferta}
            disabled={aplicando}
          >
            {aplicando ? 'Enviando...' : 'Enviar postulación'}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if mostrarModalExito}
  <div class="modal-backdrop-custom">
    <div class="modal-card-custom text-center">
      <div class="success-icon mx-auto mb-3">
        <i class="bi bi-check-lg"></i>
      </div>

      <h4 class="fw-bold mb-2">Solicitud enviada correctamente</h4>

      <p class="text-muted mb-4">
        Tu postulación fue registrada. Puedes revisar el estado desde tu panel de usuario.
      </p>

      {#if mensajeExito}
        <div class="alert alert-success rounded-4 text-start">
          {mensajeExito}
        </div>
      {/if}

      <div class="d-flex justify-content-center gap-2">
        <button class="btn btn-outline-secondary" type="button" onclick={() => goto('/empleos')}>
          Ver más empleos
        </button>

        <button class="btn text-white" type="button" style="background-color:#2F73D9;" onclick={cerrarModalExito}>
          Ir a mi panel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    background-color: #f8f9fb;
    color: #1f2937;
    font-size: 13px;
  }

  .main-title {
    font-size: 1.9rem;
  }

  .section-title {
    font-size: 1.32rem;
  }

  .meta-text {
    font-size: 12.5px;
    color: #6b7280;
  }

  .body-text {
    font-size: 13.5px;
    line-height: 1.9;
    color: #4b5563;
  }

  .sidebar-card {
    background-color: #f1f5fb;
    border-radius: 22px;
  }

  .job-badge-main {
    background-color: #ddebff;
    color: #5095ff;
    font-size: 11px;
  }

  .job-badge-urgent {
    background-color: #fff0d7;
    color: #f4a62a;
    font-size: 11px;
  }

  .job-badge-category {
    background-color: #f3e8ff;
    color: #7e22ce;
    font-size: 11px;
  }

  .related-card {
    border-radius: 18px;
    transition: all 0.25s ease;
    cursor: pointer;
  }

  .related-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
  }

  .company-link-btn {
    background-color: #ddebff;
    color: #2f73d9;
    font-size: 13px;
    border: none;
  }

  .company-link-btn:hover {
    background-color: #cfe1ff;
    color: #1f5fc0;
  }

  .apply-btn {
    background-color: #2f73d9;
    min-width: 220px;
  }

  .apply-btn:hover {
    background-color: #1f63c5;
  }

  .save-job-btn {
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 12px;
    background-color: #eef4fb;
    color: #6b7280;
    font-size: 1.25rem;
    transition: all 0.2s ease;
  }

  .save-job-btn:hover {
    background-color: #ddebff;
    color: #2f73d9;
    transform: translateY(-2px);
  }

  .save-job-btn.saved {
    background-color: #ddebff;
    color: #2f73d9;
  }

  .outline-back {
    border: 1px solid #bfc7d4;
    color: #374151;
    background: #fff;
  }

  .outline-back:hover {
    background: #f8fafc;
    color: #111827;
  }

  .job-summary-icon {
    color: #2f73d9;
    font-size: 15px;
    margin-top: 2px;
  }

  .mini-label {
    font-size: 13px;
  }

  .mini-value {
    font-size: 12.5px;
    color: #6b7280;
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
    max-width: 560px;
    background: #ffffff;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
  }

  .success-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #ddf6e6;
    color: #2f9e5b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
  }
</style>