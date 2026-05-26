<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ModalesUsuario from '$lib/components/ModalesUsuario.svelte';

    let mostrarModalCerrarSesion = $state(false);
    let mostrarModalEliminarCuenta = $state(false);

  let curriculum = $state({
    titulo_profesional: '',
    anios_experiencia: '',
    idiomas: '',
    nivel_educativo: '',
    salario_actual: '',
    salario_esperado: '',
    perfil_profesional: '',
    formacion_academica: '',
    experiencia_laboral: ''
  });

  let usuario = $state({
    nombre_completo: 'Ana Lopez',
    correo: 'ana@example.com'
  });

  let archivoSeleccionado = $state(null);
  let nombreArchivo = $state('');
  let mensaje = $state('');
  let error = $state('');

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

    curriculum = {
      ...curriculum,
      titulo_profesional: datos.titulo_profesional || datos.profesion || curriculum.titulo_profesional,
      idiomas: datos.idiomas || curriculum.idiomas,
      nivel_educativo: datos.nivel_educativo || curriculum.nivel_educativo
    };
  }

  function cargarCurriculumLocal() {
    const data = localStorage.getItem('curriculumUsuarioLocal');

    if (!data) return;

    const curriculumGuardado = JSON.parse(data);

    curriculum = {
      ...curriculum,
      ...curriculumGuardado
    };

    nombreArchivo = curriculumGuardado.nombreArchivo || '';
  }

  function manejarArchivo(event) {
    error = '';
    mensaje = '';

    const archivo = event.target.files[0];

    if (!archivo) return;

    const formatosPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const extensionPermitida =
      archivo.name.endsWith('.pdf') ||
      archivo.name.endsWith('.doc') ||
      archivo.name.endsWith('.docx');

    if (!formatosPermitidos.includes(archivo.type) && !extensionPermitida) {
      error = 'Formato no permitido. Solo puedes subir PDF, DOC o DOCX.';
      archivoSeleccionado = null;
      nombreArchivo = '';
      return;
    }

    archivoSeleccionado = archivo;
    nombreArchivo = archivo.name;
    mensaje = 'Archivo seleccionado correctamente.';
  }

  function guardarCurriculum() {
    error = '';
    mensaje = '';

    if (!curriculum.titulo_profesional.trim()) {
      error = 'El título profesional es obligatorio.';
      return;
    }

    const dataGuardar = {
      ...curriculum,
      nombreArchivo
    };

    localStorage.setItem('curriculumUsuarioLocal', JSON.stringify(dataGuardar));

    const sesionGuardada = localStorage.getItem('koruveSesion');

    if (sesionGuardada) {
      const sesion = JSON.parse(sesionGuardada);

      const nuevaSesion = {
        ...sesion,
        datos: {
          ...(sesion.datos || {}),
          profesion: curriculum.titulo_profesional,
          titulo_profesional: curriculum.titulo_profesional,
          nivel_educativo: curriculum.nivel_educativo,
          idiomas: curriculum.idiomas,
          curriculum: nombreArchivo || 'curriculum_usuario.pdf'
        }
      };

      localStorage.setItem('koruveSesion', JSON.stringify(nuevaSesion));
    }

    mensaje = 'Currículum guardado correctamente.';
  }

  function cerrarSesion() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    goto('/iniciar-sesion');
  }

  function eliminarPerfil() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('curriculumUsuarioLocal');
    goto('/');
  }

  onMount(() => {
    cargarSesion();
    cargarCurriculumLocal();
  });
</script>

<svelte:head>
  <title>Mi Currículum | Koruve</title>
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

        <a href="/usuario/curriculum" class="list-group-item list-group-item-action border-0 rounded mb-2 panel-activo">
          <i class="bi bi-file-earmark-text me-2 texto-panel"></i>
          <span class="texto-panel">Mi Currículum</span>
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
        <h3 class="fw-bold">Mi Currículum</h3>
        <p class="text-muted small mb-0">¿Listo para la carga?</p>
      </section>

      <section class="card border-0 shadow-sm curriculum-card">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-4">Resumen del currículum</h5>

          <div class="upload-cv-box border rounded p-4 text-center mb-4 bg-white">
            <p class="fw-semibold mb-2">Sube tu archivo de currículum</p>
            <p class="small text-muted mb-3">Formatos permitidos: PDF, DOC, DOCX</p>

            <label for="archivoCv" class="btn boton-naranja px-4">
              Subir currículum
            </label>

            <input
              type="file"
              id="archivoCv"
              class="d-none"
              accept=".pdf,.doc,.docx"
              onchange={manejarArchivo}
            >

            {#if nombreArchivo}
              <p class="small text-muted mt-3 mb-0">
                Archivo seleccionado: <strong>{nombreArchivo}</strong>
              </p>
            {:else}
              <p class="small text-muted mt-3 mb-0">
                Ningún archivo seleccionado
              </p>
            {/if}
          </div>

          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Título profesional</label>
              <input
                type="text"
                class="form-control bg-body-tertiary border-0"
                bind:value={curriculum.titulo_profesional}
              >
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Años de experiencia</label>
              <input
                type="text"
                class="form-control bg-body-tertiary border-0"
                bind:value={curriculum.anios_experiencia}
              >
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Idiomas</label>
              <input
                type="text"
                class="form-control bg-body-tertiary border-0"
                bind:value={curriculum.idiomas}
              >
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Nivel educativo</label>
              <input
                type="text"
                class="form-control bg-body-tertiary border-0"
                bind:value={curriculum.nivel_educativo}
              >
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Salario actual</label>
              <input
                type="number"
                step="0.01"
                class="form-control bg-body-tertiary border-0"
                bind:value={curriculum.salario_actual}
              >
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Salario esperado</label>
              <input
                type="number"
                step="0.01"
                class="form-control bg-body-tertiary border-0"
                bind:value={curriculum.salario_esperado}
              >
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Perfil profesional</label>
              <textarea
                class="form-control bg-body-tertiary border-0"
                rows="4"
                bind:value={curriculum.perfil_profesional}
              ></textarea>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Formación académica</label>
              <textarea
                class="form-control bg-body-tertiary border-0"
                rows="5"
                bind:value={curriculum.formacion_academica}
              ></textarea>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Experiencia laboral</label>
              <textarea
                class="form-control bg-body-tertiary border-0"
                rows="6"
                bind:value={curriculum.experiencia_laboral}
              ></textarea>
            </div>
          </div>

          {#if error}
            <div class="alert alert-danger mt-4 mb-0 py-2">
              {error}
            </div>
          {/if}

          {#if mensaje}
            <div class="alert alert-info mt-4 mb-0 py-2">
              {mensaje}
            </div>
          {/if}

          <div class="mt-4 d-flex gap-2">
            <button type="button" class="btn boton-naranja px-4" onclick={guardarCurriculum}>
              Guardar
            </button>
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

  .boton-naranja {
    background-color: #a35139;
    color: white;
    border: none;
    padding: 10px 18px;
  }

  .boton-naranja:hover {
    background-color: #8f422e;
    color: white;
  }

  .curriculum-card {
    border-radius: 10px;
  }

  .upload-cv-box {
    border-style: dashed !important;
  }

  .form-control,
  .form-select {
    min-height: 46px;
    font-size: 14px;
  }

  textarea.form-control {
    min-height: 140px;
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