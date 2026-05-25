<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { API_URL } from '$lib/services/api.js';
  import LayoutEmpresa from '$lib/components/empresa/LayoutEmpresa.svelte';
  import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    BriefcaseBusiness,
    GraduationCap,
    Languages,
    DollarSign,
    FileText,
    UserRound,
    Download,
    AlertCircle,
    Check,
    X,
    UserCheck,
    UserX
  } from '@lucide/svelte';

  let empresa = $state({
    id: 1,
    nombre: 'Empresa',
    logo: ''
  });

  let postulante = $state(null);
  let cargando = $state(true);
  let error = $state('');

  let idAplicacion = $state(null);
  let idOferta = $state(null);
  let estadoAplicacion = $state('');

  let modalAbierto = $state(false);
  let modalAccion = $state('');
  let procesando = $state(false);

  const mostrarValor = (valor) => {
    return valor && String(valor).trim() ? valor : 'Sin información registrada';
  };

  const obtenerInicial = (nombre) => {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha registrada';

    return new Date(fecha).toLocaleDateString('es-SV', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearSalario = (salario) => {
    if (!salario) return 'Sin información registrada';

    return Number(salario).toLocaleString('es-SV', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const normalizarEstado = (estado) => {
    if (!estado) return 'Sin estado';
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const cargarParametros = () => {
    const params = page.url.searchParams;

    idAplicacion = params.get('idAplicacion');
    idOferta = params.get('idOferta');
    estadoAplicacion = params.get('estado') || '';
  };

  const cargarPerfil = async () => {
    try {
      cargando = true;
      error = '';

      const idUsuario = page.params.id;

      const respuesta = await fetch(`${API_URL}/usuarios/${idUsuario}/perfil`);

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error('El postulante no existe.');
        }

        throw new Error('No se pudo cargar el perfil del postulante.');
      }

      postulante = await respuesta.json();
    } catch (err) {
      error = err.message || 'Error al cargar el perfil.';
    } finally {
      cargando = false;
    }
  };

  const volver = () => {
    if (idOferta) {
      goto(`/empresa/ofertas/${idOferta}/aplicantes`);
      return;
    }

    history.back();
  };

  const descargarCV = () => {
    if (!postulante?.archivo_cv) return;
    window.open(postulante.archivo_cv, '_blank');
  };

  const abrirModalEstado = (accion) => {
    if (!idAplicacion) {
      error = 'No se encontró la aplicación asociada a este postulante.';
      return;
    }

    modalAccion = accion;
    modalAbierto = true;
  };

  const cerrarModal = () => {
    modalAbierto = false;
    modalAccion = '';
  };

  const cambiarEstado = async () => {
    if (!idAplicacion || !modalAccion) return;

    try {
      procesando = true;

      const nuevoEstado = modalAccion === 'aceptar' ? 'aceptada' : 'denegada';

      const respuesta = await fetch(`${API_URL}/aplicaciones/${idAplicacion}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: nuevoEstado
        })
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo actualizar el estado de la solicitud.');
      }

      estadoAplicacion = nuevoEstado;
      cerrarModal();
    } catch (err) {
      error = err.message || 'Error al actualizar la solicitud.';
      cerrarModal();
    } finally {
      procesando = false;
    }
  };

  onMount(() => {
    cargarParametros();
    cargarPerfil();
  });
</script>

<LayoutEmpresa active="aplicantes" {empresa}>
  {#if cargando}
    <p class="message">Cargando perfil del postulante...</p>
  {:else if error}
    <section class="error-card">
      <AlertCircle size={46} strokeWidth={1.8} />
      <h1>No se pudo cargar el perfil</h1>
      <p>{error}</p>
      <button type="button" onclick={volver}>Volver</button>
    </section>
  {:else if postulante}
    <section class="page-header">
      <button class="back-button" type="button" onclick={volver}>
        <ArrowLeft size={18} strokeWidth={1.8} />
        Volver
      </button>

      <div class="header-title">
        <div>
          <h1>Currículum del solicitante</h1>
          {#if estadoAplicacion}
            <p class="application-status {estadoAplicacion}">
              Solicitud {normalizarEstado(estadoAplicacion)}
            </p>
          {/if}
        </div>

        {#if idAplicacion}
          <div class="header-actions">
            <button
              class="decision-button accept"
              type="button"
              disabled={estadoAplicacion === 'aceptada'}
              onclick={() => abrirModalEstado('aceptar')}
            >
              <Check size={18} strokeWidth={1.8} />
              Aceptar solicitud
            </button>

            <button
              class="decision-button reject"
              type="button"
              disabled={estadoAplicacion === 'denegada'}
              onclick={() => abrirModalEstado('denegar')}
            >
              <X size={18} strokeWidth={1.8} />
              Denegar solicitud
            </button>
          </div>
        {/if}
      </div>
    </section>

    <section class="profile-card">
      <div class="profile-layout">
        <main class="profile-main">
          <section class="candidate-header">
            <div class="avatar">
              {#if postulante.foto_perfil}
                <img src={postulante.foto_perfil} alt={postulante.nombre_completo} />
              {:else}
                <span>{obtenerInicial(postulante.nombre_completo)}</span>
              {/if}
            </div>

            <div class="candidate-info">
              <h2>{mostrarValor(postulante.nombre_completo)}</h2>
              <p>{mostrarValor(postulante.cv_titulo_profesional || postulante.titulo_profesional || postulante.profesion)}</p>

              <div class="meta-list">
                <span>
                  <MapPin size={15} strokeWidth={1.8} />
                  {mostrarValor(postulante.ciudad || postulante.ubicacion)}
                </span>

                <span>
                  <BriefcaseBusiness size={15} strokeWidth={1.8} />
                  {mostrarValor(postulante.anios_experiencia || postulante.experiencia)}
                </span>

                <span>
                  <CalendarDays size={15} strokeWidth={1.8} />
                  Miembro desde {formatearFecha(postulante.fecha_registro)}
                </span>
              </div>

              <div class="chips">
                <span>{mostrarValor(postulante.cv_nivel_educativo || postulante.nivel_educativo)}</span>
                <span>{mostrarValor(postulante.cv_idiomas || postulante.idiomas)}</span>
              </div>
            </div>
          </section>

          <section class="content-section">
            <h3>Acerca del candidato</h3>
            <p>{mostrarValor(postulante.perfil_profesional || postulante.descripcion)}</p>
          </section>

          <section class="content-section">
            <h3>Formación académica</h3>
            <div class="timeline-item">
              <div class="timeline-dot">
                <GraduationCap size={17} strokeWidth={1.8} />
              </div>
              <div>
                <strong>{mostrarValor(postulante.cv_nivel_educativo || postulante.nivel_educativo)}</strong>
                <p>{mostrarValor(postulante.formacion_academica)}</p>
              </div>
            </div>
          </section>

          <section class="content-section">
            <h3>Experiencia laboral</h3>
            <div class="timeline-item">
              <div class="timeline-dot">
                <BriefcaseBusiness size={17} strokeWidth={1.8} />
              </div>
              <div>
                <strong>{mostrarValor(postulante.anios_experiencia || postulante.experiencia)}</strong>
                <p>{mostrarValor(postulante.experiencia_laboral || postulante.experiencia)}</p>
              </div>
            </div>
          </section>

          <section class="content-section">
            <h3>Habilidades</h3>
            <p>{mostrarValor(postulante.habilidades)}</p>
          </section>
        </main>

        <aside class="profile-side">
          <button class="cv-button" type="button" onclick={descargarCV} disabled={!postulante.archivo_cv}>
            <Download size={18} strokeWidth={1.8} />
            {postulante.archivo_cv ? 'Descargar CV' : 'CV no disponible'}
          </button>

          <article class="summary-card">
            <div class="summary-item">
              <Mail size={19} strokeWidth={1.8} />
              <div>
                <span>Correo</span>
                <strong>{mostrarValor(postulante.correo)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <Phone size={19} strokeWidth={1.8} />
              <div>
                <span>Teléfono</span>
                <strong>{mostrarValor(postulante.telefono)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <MapPin size={19} strokeWidth={1.8} />
              <div>
                <span>Ubicación</span>
                <strong>{mostrarValor(postulante.direccion_completa || postulante.ubicacion)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <BriefcaseBusiness size={19} strokeWidth={1.8} />
              <div>
                <span>Experiencia</span>
                <strong>{mostrarValor(postulante.anios_experiencia || postulante.experiencia)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <DollarSign size={19} strokeWidth={1.8} />
              <div>
                <span>Salario actual</span>
                <strong>{formatearSalario(postulante.salario_actual)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <DollarSign size={19} strokeWidth={1.8} />
              <div>
                <span>Salario esperado</span>
                <strong>{formatearSalario(postulante.salario_esperado)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <GraduationCap size={19} strokeWidth={1.8} />
              <div>
                <span>Nivel educativo</span>
                <strong>{mostrarValor(postulante.cv_nivel_educativo || postulante.nivel_educativo)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <Languages size={19} strokeWidth={1.8} />
              <div>
                <span>Idiomas</span>
                <strong>{mostrarValor(postulante.cv_idiomas || postulante.idiomas)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <UserRound size={19} strokeWidth={1.8} />
              <div>
                <span>Estado de cuenta</span>
                <strong>{mostrarValor(postulante.estado)}</strong>
              </div>
            </div>

            <div class="summary-item">
              <FileText size={19} strokeWidth={1.8} />
              <div>
                <span>Actualización CV</span>
                <strong>{formatearFecha(postulante.fecha_actualizacion)}</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>

    {#if modalAbierto}
      <div class="modal-backdrop">
        <div class="modal">
          <button class="modal-close" type="button" onclick={cerrarModal}>
            <X size={20} strokeWidth={1.8} />
          </button>

          <div class="modal-icon {modalAccion}">
            {#if modalAccion === 'aceptar'}
              <UserCheck size={30} strokeWidth={1.8} />
            {:else}
              <UserX size={30} strokeWidth={1.8} />
            {/if}
          </div>

          <h2>{modalAccion === 'aceptar' ? 'Aceptar solicitud' : 'Denegar solicitud'}</h2>

          <p>
            ¿Estás segura de que deseas
            {modalAccion === 'aceptar' ? 'aceptar' : 'denegar'}
            la solicitud de <strong>{postulante.nombre_completo}</strong>?
          </p>

          <div class="modal-actions">
            <button class="cancel-button" type="button" onclick={cerrarModal}>
              Cancelar
            </button>

            <button
              class="confirm-button {modalAccion}"
              type="button"
              onclick={cambiarEstado}
              disabled={procesando}
            >
              {procesando ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</LayoutEmpresa>

<style>
  .message {
    background: white;
    padding: 18px;
    border-radius: 12px;
  }

  .error-card {
    background: white;
    border-radius: 14px;
    padding: 50px;
    text-align: center;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .error-card svg {
    color: #b42318;
  }

  .error-card h1 {
    margin: 16px 0 10px;
    color: #1f2937;
  }

  .error-card p {
    color: #667085;
  }

  .error-card button {
    margin-top: 18px;
    border: none;
    border-radius: 10px;
    padding: 13px 20px;
    background: #a14f3d;
    color: white;
    font-weight: 700;
    cursor: pointer;
  }

  .page-header {
    margin-bottom: 28px;
  }

  .back-button {
    border: none;
    background: transparent;
    color: #667085;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
    cursor: pointer;
    font-weight: 700;
  }

  .header-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 22px;
  }

  .header-title h1 {
    margin: 0;
    color: #1f2937;
    font-size: 34px;
  }

  .application-status {
    width: fit-content;
    margin: 12px 0 0;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    text-transform: capitalize;
  }

  .application-status.pendiente {
    background: #fff4d6;
    color: #8a6100;
  }

  .application-status.aceptada {
    background: #dcfce7;
    color: #166534;
  }

  .application-status.denegada {
    background: #fee2e2;
    color: #991b1b;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .decision-button {
    border: none;
    border-radius: 10px;
    padding: 14px 18px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-weight: 700;
    cursor: pointer;
  }

  .decision-button.accept {
    background: #dcfce7;
    color: #166534;
  }

  .decision-button.reject {
    background: #fee2e2;
    color: #991b1b;
  }

  .decision-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .profile-card {
    background: white;
    border-radius: 14px;
    padding: 34px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .profile-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(330px, 0.7fr);
    gap: 36px;
    align-items: start;
  }

  .candidate-header {
    display: flex;
    gap: 22px;
    align-items: flex-start;
    margin-bottom: 34px;
  }

  .avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: #24364b;
    color: white;
    display: grid;
    place-items: center;
    overflow: hidden;
    font-size: 34px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .candidate-info h2 {
    margin: 0 0 8px;
    color: #1f2937;
    font-size: 30px;
  }

  .candidate-info > p {
    margin: 0 0 12px;
    color: #a14f3d;
    font-size: 16px;
    font-weight: 700;
  }

  .meta-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    color: #667085;
    margin-bottom: 14px;
  }

  .meta-list span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chips span {
    background: #f0d8d2;
    color: #9b5144;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
  }

  .content-section {
    margin-top: 34px;
  }

  .content-section h3 {
    margin: 0 0 14px;
    color: #1f2937;
    font-size: 20px;
  }

  .content-section p {
    margin: 0;
    color: #667085;
    line-height: 1.8;
    white-space: pre-line;
  }

  .timeline-item {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .timeline-dot {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #eef3f6;
    color: #9b5144;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .timeline-item strong {
    display: block;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .profile-side {
    display: grid;
    gap: 18px;
  }

  .cv-button {
    border: none;
    border-radius: 10px;
    padding: 16px 18px;
    background: #a14f3d;
    color: white;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
  }

  .cv-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .summary-card {
    background: #fbf6f4;
    border-radius: 14px;
    padding: 26px;
    display: grid;
    gap: 24px;
  }

  .summary-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    color: #9b5144;
  }

  .summary-item span {
    display: block;
    color: #667085;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .summary-item strong {
    color: #1f2937;
    font-size: 14px;
    line-height: 1.4;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.42);
    display: grid;
    place-items: center;
    z-index: 9999;
    padding: 20px;
  }

  .modal {
    position: relative;
    width: 100%;
    max-width: 460px;
    background: white;
    border-radius: 16px;
    padding: 34px 30px 28px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
    text-align: center;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    border: none;
    background: transparent;
    color: #667085;
    cursor: pointer;
  }

  .modal-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    margin: 0 auto 18px;
  }

  .modal-icon.aceptar {
    background: #dcfce7;
    color: #166534;
  }

  .modal-icon.denegar {
    background: #fee2e2;
    color: #991b1b;
  }

  .modal h2 {
    margin: 0 0 12px;
    color: #1f2937;
    font-size: 24px;
  }

  .modal p {
    margin: 0;
    color: #667085;
    line-height: 1.5;
  }

  .modal p strong {
    color: #1f2937;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
  }

  .cancel-button,
  .confirm-button {
    flex: 1;
    border: none;
    border-radius: 10px;
    padding: 13px 16px;
    font-weight: 700;
    cursor: pointer;
  }

  .cancel-button {
    background: #f2f4f7;
    color: #475467;
  }

  .confirm-button.aceptar {
    background: #16a34a;
    color: white;
  }

  .confirm-button.denegar {
    background: #dc2626;
    color: white;
  }

  .confirm-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 1100px) {
    .profile-layout {
      grid-template-columns: 1fr;
    }

    .header-title {
      flex-direction: column;
    }
  }

  @media (max-width: 700px) {
    .candidate-header {
      flex-direction: column;
    }

    .header-title h1 {
      font-size: 28px;
    }

    .header-actions {
      width: 100%;
    }

    .decision-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>