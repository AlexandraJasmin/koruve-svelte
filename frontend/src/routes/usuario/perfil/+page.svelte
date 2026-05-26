<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import ModalesUsuario from '$lib/components/ModalesUsuario.svelte';

  let mostrarModalCerrarSesion = $state(false);
  let mostrarModalEliminarCuenta = $state(false);

  let perfil = $state({
    nombre_completo: 'Ana López',
    titulo_profesional: 'Desarrolladora Web',
    telefono: '7000-1111',
    correo: 'ana@example.com',
    sitio_web: '',
    salario_actual: '',
    salario_esperado: '',
    experiencia: '1 año de experiencia en frontend',
    edad: '',
    nivel_educativo: 'Universitario',
    idiomas: '',
    genero: '',
    visible_busqueda: 'true',
    descripcion: '',
    pais: 'El Salvador',
    ciudad: 'San Salvador'
  });

  let redes = $state({
    facebook: '',
    twitter: '',
    linkedin: '',
    google_plus: ''
  });

  let fotoPreview = $state('');
  let mensajePerfil = $state('');
  let mensajeRedes = $state('');
  let mensajeDireccion = $state('');

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

    perfil = {
      ...perfil,
      nombre_completo: datos.nombre_completo || datos.nombre || perfil.nombre_completo,
      telefono: datos.telefono || perfil.telefono,
      correo: datos.correo || perfil.correo,
      titulo_profesional: datos.titulo_profesional || datos.profesion || perfil.titulo_profesional,
      experiencia: datos.experiencia || perfil.experiencia,
      nivel_educativo: datos.nivel_educativo || perfil.nivel_educativo,
      ciudad: datos.ubicacion || datos.ciudad || perfil.ciudad
    };

    if (datos.foto_perfil) {
      fotoPreview = datos.foto_perfil;
    }
  }

  function manejarFoto(event) {
    const archivo = event.target.files[0];

    if (!archivo) return;

    if (archivo.size > 1024 * 1024) {
      mensajePerfil = 'La imagen no debe superar 1 MB.';
      return;
    }

    fotoPreview = URL.createObjectURL(archivo);
    mensajePerfil = 'Imagen seleccionada correctamente.';
  }

  function guardarPerfil() {
    mensajePerfil = '';

    if (!perfil.nombre_completo.trim()) {
      mensajePerfil = 'El nombre completo es obligatorio.';
      return;
    }

    if (!perfil.correo.trim()) {
      mensajePerfil = 'El correo electrónico es obligatorio.';
      return;
    }

    const sesionGuardada = localStorage.getItem('koruveSesion');
    let sesion = sesionGuardada
      ? JSON.parse(sesionGuardada)
      : {
          autenticado: true,
          tipoCuenta: 'usuario',
          token: null,
          datos: {}
        };

    sesion = {
      ...sesion,
      datos: {
        ...(sesion.datos || {}),
        ...perfil,
        profesion: perfil.titulo_profesional,
        ubicacion: perfil.ciudad,
        foto_perfil: fotoPreview
      }
    };

    localStorage.setItem('koruveSesion', JSON.stringify(sesion));
    localStorage.setItem('perfilUsuarioLocal', JSON.stringify(perfil));

    mensajePerfil = 'Perfil guardado correctamente.';
  }

  function guardarRedes() {
    localStorage.setItem('redesUsuarioLocal', JSON.stringify(redes));
    mensajeRedes = 'Redes sociales guardadas correctamente.';
  }

  function guardarDireccion() {
    localStorage.setItem(
      'direccionUsuarioLocal',
      JSON.stringify({
        pais: perfil.pais,
        ciudad: perfil.ciudad
      })
    );

    mensajeDireccion = 'Información de contacto guardada correctamente.';
  }

  function cargarDatosLocales() {
    const perfilLocal = localStorage.getItem('perfilUsuarioLocal');
    const redesLocal = localStorage.getItem('redesUsuarioLocal');
    const direccionLocal = localStorage.getItem('direccionUsuarioLocal');

    if (perfilLocal) {
      perfil = {
        ...perfil,
        ...JSON.parse(perfilLocal)
      };
    }

    if (redesLocal) {
      redes = {
        ...redes,
        ...JSON.parse(redesLocal)
      };
    }

    if (direccionLocal) {
      const direccion = JSON.parse(direccionLocal);

      perfil = {
        ...perfil,
        pais: direccion.pais || perfil.pais,
        ciudad: direccion.ciudad || perfil.ciudad
      };
    }
  }

  function cerrarSesion() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    goto('/iniciar-sesion');
  }

  function eliminarPerfil() {
    localStorage.removeItem('koruveSesion');
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('perfilUsuarioLocal');
    localStorage.removeItem('redesUsuarioLocal');
    localStorage.removeItem('direccionUsuarioLocal');
    goto('/');
  }

  onMount(() => {
    cargarSesion();
    cargarDatosLocales();
  });
</script>

<svelte:head>
  <title>Mi Perfil | Koruve</title>
</svelte:head>

<div class="container-fluid dashboard-bg">
  <div class="row">
    <aside class="col-md-3 col-lg-2 bg-white border-end min-vh-100 p-3">
      <div class="list-group list-group-flush small">
        <a href="/usuario/dashboard" class="list-group-item list-group-item-action border-0">
          <i class="bi bi-house me-2"></i>
          Panel
        </a>

        <a href="/usuario/perfil" class="list-group-item list-group-item-action border-0 rounded mb-2 panel-activo">
          <i class="bi bi-person me-2 texto-panel"></i>
          <span class="texto-panel">Mi Perfil</span>
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
        <h3 class="fw-bold">Mi Perfil</h3>
        <p class="text-muted small mb-0">¿Listo para la carga?</p>
      </section>

      <section class="card border-0 shadow-sm mb-4 profile-card">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-4">Mi Perfil</h6>

          <div class="row align-items-center mb-4">
            <div class="col-md-4">
              <label
                for="logo"
                class="upload-box border rounded d-flex align-items-center justify-content-center text-center bg-white"
              >
                {#if fotoPreview}
                  <img src={fotoPreview} alt="Foto de perfil" class="preview-img">
                {:else}
                  <div>
                    <i class="bi bi-upload d-block mb-2 text-secondary"></i>
                    <small>Explorar logotipo</small>
                  </div>
                {/if}
              </label>

              <input type="file" id="logo" class="d-none" accept="image/*" onchange={manejarFoto}>
            </div>

            <div class="col-md-8">
              <p class="small text-muted mb-0">
                El tamaño máximo del archivo es de 1 MB, la dimensión mínima es de 330x300 y los formatos de archivo compatibles son .jpg y .png.
              </p>
            </div>
          </div>

          <hr class="mb-4">

          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Nombre completo</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.nombre_completo}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Título Profesional</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.titulo_profesional}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Teléfono</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.telefono}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Dirección de correo electrónico</label>
              <input type="email" class="form-control bg-body-tertiary border-0" bind:value={perfil.correo}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Sitio Web</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.sitio_web}>
            </div>

            <div class="col-md-3">
              <label class="form-label fw-semibold">Salario Actual ($)</label>
              <input type="number" step="0.01" class="form-control bg-body-tertiary border-0" bind:value={perfil.salario_actual}>
            </div>

            <div class="col-md-3">
              <label class="form-label fw-semibold">Salario Esperado ($)</label>
              <input type="number" step="0.01" class="form-control bg-body-tertiary border-0" bind:value={perfil.salario_esperado}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Experiencia</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.experiencia}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Edad</label>
              <input type="number" class="form-control bg-body-tertiary border-0" bind:value={perfil.edad}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Niveles Educativos</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.nivel_educativo}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Idiomas</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.idiomas}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Género</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.genero}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Permitir la búsqueda y en los listados</label>
              <select class="form-select bg-body-tertiary border-0" bind:value={perfil.visible_busqueda}>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Descripción</label>
              <textarea class="form-control bg-body-tertiary border-0" rows="7" bind:value={perfil.descripcion}></textarea>
            </div>
          </div>

          {#if mensajePerfil}
            <div class="alert alert-info mt-4 mb-0 py-2">
              {mensajePerfil}
            </div>
          {/if}

          <div class="mt-4">
            <button type="button" class="btn boton-naranja" onclick={guardarPerfil}>
              Guardar
            </button>
          </div>
        </div>
      </section>

      <section class="card border-0 shadow-sm mb-4 profile-card">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-4">Redes Sociales</h6>

          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Facebook</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={redes.facebook}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Twitter</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={redes.twitter}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Linkedin</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={redes.linkedin}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Google Plus</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={redes.google_plus}>
            </div>
          </div>

          {#if mensajeRedes}
            <div class="alert alert-info mt-4 mb-0 py-2">
              {mensajeRedes}
            </div>
          {/if}

          <div class="mt-4">
            <button type="button" class="btn boton-naranja" onclick={guardarRedes}>
              Guardar
            </button>
          </div>
        </div>
      </section>

      <section class="card border-0 shadow-sm mb-4 profile-card">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-4">Información de contacto</h6>

          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label fw-semibold">País</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.pais}>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Ciudad</label>
              <input type="text" class="form-control bg-body-tertiary border-0" bind:value={perfil.ciudad}>
            </div>
          </div>

          <div class="mt-4 mb-3">
            <button type="button" class="btn boton-claro">
              Buscar ubicación
            </button>
          </div>

          <div class="mb-4 rounded overflow-hidden map-box">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${perfil.ciudad || 'San Salvador'} ${perfil.pais || 'El Salvador'}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="400"
              style="border:0;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Mapa de ubicación">
            </iframe>
          </div>

          {#if mensajeDireccion}
            <div class="alert alert-info mb-3 py-2">
              {mensajeDireccion}
            </div>
          {/if}

          <button type="button" class="btn boton-naranja" onclick={guardarDireccion}>
            Guardar
          </button>
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

  .boton-claro {
    background-color: #e7c4bb;
    color: #a35139;
    border: none;
    padding: 10px 18px;
  }

  .boton-claro:hover {
    background-color: #dfb4aa;
    color: #8f422e;
  }

  .profile-card {
    border-radius: 10px;
  }

  .upload-box {
    height: 120px;
    cursor: pointer;
    border-style: dashed !important;
    overflow: hidden;
  }

  .preview-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  .form-control,
  .form-select {
    min-height: 46px;
    font-size: 14px;
  }

  textarea.form-control {
    min-height: 190px;
  }

  .map-box {
    background-color: #e5e7eb;
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