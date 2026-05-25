<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { API_URL } from '$lib/services/api.js';
  import LayoutEmpresa from '$lib/components/empresa/LayoutEmpresa.svelte';
  import {
    UsersRound,
    UserCheck,
    UserX,
    Clock,
    Eye,
    Check,
    X,
    Mail,
    Phone,
    GraduationCap,
    Languages,
    BriefcaseBusiness,
    CalendarDays,
    AlertCircle,
    Search
  } from '@lucide/svelte';

  let empresa = $state({
    id: 1,
    nombre: 'Empresa',
    logo: ''
  });

  let aplicantes = $state([]);
  let cargando = $state(true);
  let error = $state('');

  let filtroEstado = $state('todos');
  let filtroOferta = $state('todas');
  let busqueda = $state('');

  let modalAbierto = $state(false);
  let modalAccion = $state('');
  let aplicanteSeleccionado = $state(null);
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

  const normalizarEstado = (estado) => {
    if (!estado) return 'Sin estado';
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const totalAplicantes = $derived(aplicantes.length);

  const totalPendientes = $derived(
    aplicantes.filter((aplicante) => aplicante.estado === 'pendiente').length
  );

  const totalAceptados = $derived(
    aplicantes.filter((aplicante) => aplicante.estado === 'aceptada').length
  );

  const totalDenegados = $derived(
    aplicantes.filter((aplicante) => aplicante.estado === 'denegada').length
  );

  const ofertasDisponibles = $derived(
    Array.from(
      new Map(
        aplicantes.map((aplicante) => [
          aplicante.id_oferta,
          {
            id: aplicante.id_oferta,
            titulo: aplicante.titulo_oferta
          }
        ])
      ).values()
    )
  );

  const aplicantesFiltrados = $derived(
    aplicantes.filter((aplicante) => {
      const coincideEstado =
        filtroEstado === 'todos' || aplicante.estado === filtroEstado;

      const coincideOferta =
        filtroOferta === 'todas' || String(aplicante.id_oferta) === String(filtroOferta);

      const texto = `${aplicante.nombre_completo || ''} ${aplicante.correo || ''} ${aplicante.titulo_oferta || ''}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase().trim());

      return coincideEstado && coincideOferta && coincideBusqueda;
    })
  );

  const cargarAplicantes = async () => {
    try {
      cargando = true;
      error = '';

      const respuesta = await fetch(`${API_URL}/empresas/${empresa.id}/aplicantes`);

      if (!respuesta.ok) {
        throw new Error('No se pudieron cargar los solicitantes.');
      }

      aplicantes = await respuesta.json();
    } catch (err) {
      error = err.message || 'Error al cargar los solicitantes.';
    } finally {
      cargando = false;
    }
  };

  const abrirModalEstado = (aplicante, accion) => {
    aplicanteSeleccionado = aplicante;
    modalAccion = accion;
    modalAbierto = true;
  };

  const cerrarModal = () => {
    modalAbierto = false;
    modalAccion = '';
    aplicanteSeleccionado = null;
  };

  const cambiarEstado = async () => {
    if (!aplicanteSeleccionado || !modalAccion) return;

    try {
      procesando = true;

      const nuevoEstado = modalAccion === 'aceptar' ? 'aceptada' : 'denegada';

      const respuesta = await fetch(
        `${API_URL}/aplicaciones/${aplicanteSeleccionado.id_aplicacion}/estado`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            estado: nuevoEstado
          })
        }
      );

      if (!respuesta.ok) {
        throw new Error('No se pudo actualizar el estado del solicitante.');
      }

      aplicantes = aplicantes.map((aplicante) =>
        aplicante.id_aplicacion === aplicanteSeleccionado.id_aplicacion
          ? { ...aplicante, estado: nuevoEstado }
          : aplicante
      );

      cerrarModal();
    } catch (err) {
      error = err.message || 'Error al actualizar el estado.';
      cerrarModal();
    } finally {
      procesando = false;
    }
  };

  const verPerfil = (aplicante) => {
    goto(
      `/empresa/postulantes/${aplicante.id_usuario}?idAplicacion=${aplicante.id_aplicacion}&idOferta=${aplicante.id_oferta}&estado=${aplicante.estado}`
    );
  };

  onMount(() => {
    cargarAplicantes();
  });
</script>

<LayoutEmpresa active="aplicantes" {empresa}>
  {#if cargando}
    <p class="message">Cargando solicitantes...</p>
  {:else if error}
    <section class="error-card">
      <AlertCircle size={46} strokeWidth={1.8} />
      <h1>No se pudieron cargar los solicitantes</h1>
      <p>{error}</p>
      <button type="button" onclick={cargarAplicantes}>
        Intentar de nuevo
      </button>
    </section>
  {:else}
    <section class="page-header">
      <div>
        <h1>Todos los solicitantes</h1>
        <p>Consulta y gestiona las solicitudes recibidas en todas tus ofertas.</p>
      </div>
    </section>

    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-icon">
          <UsersRound size={26} strokeWidth={1.8} />
        </div>
        <div>
          <span>Total</span>
          <strong>{totalAplicantes}</strong>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon pending">
          <Clock size={26} strokeWidth={1.8} />
        </div>
        <div>
          <span>Pendientes</span>
          <strong>{totalPendientes}</strong>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon accepted">
          <UserCheck size={26} strokeWidth={1.8} />
        </div>
        <div>
          <span>Aceptadas</span>
          <strong>{totalAceptados}</strong>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon rejected">
          <UserX size={26} strokeWidth={1.8} />
        </div>
        <div>
          <span>Denegadas</span>
          <strong>{totalDenegados}</strong>
        </div>
      </article>
    </section>

    <section class="applicants-card">
      <div class="filters">
        <div class="search-box">
          <Search size={18} strokeWidth={1.8} />
          <input
            type="text"
            bind:value={busqueda}
            aria-label="Buscar solicitante"
          />
        </div>

        <select bind:value={filtroOferta}>
          <option value="todas">Todas las ofertas</option>
          {#each ofertasDisponibles as oferta}
            <option value={oferta.id}>{oferta.titulo}</option>
          {/each}
        </select>

        <select bind:value={filtroEstado}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="aceptada">Aceptadas</option>
          <option value="denegada">Denegadas</option>
        </select>
      </div>

      {#if aplicantesFiltrados.length === 0}
        <div class="empty-state">
          <UsersRound size={44} strokeWidth={1.6} />
          <h3>No hay solicitantes para mostrar</h3>
          <p>
            Cuando los usuarios apliquen a tus ofertas, aparecerán en esta sección.
          </p>
        </div>
      {:else}
        <div class="applicants-list">
          {#each aplicantesFiltrados as aplicante}
            <article class="applicant">
              <div class="avatar">
                {#if aplicante.foto_perfil}
                  <img src={aplicante.foto_perfil} alt={aplicante.nombre_completo} />
                {:else}
                  <span>{obtenerInicial(aplicante.nombre_completo)}</span>
                {/if}
              </div>

              <div class="applicant-info">
                <div class="applicant-main">
                  <div>
                    <h3>{mostrarValor(aplicante.nombre_completo)}</h3>
                    <p class="profession">{mostrarValor(aplicante.titulo_profesional || aplicante.profesion)}</p>
                  </div>

                  <span class="badge {aplicante.estado}">
                    {normalizarEstado(aplicante.estado)}
                  </span>
                </div>

                <div class="offer-line">
                  <BriefcaseBusiness size={16} strokeWidth={1.8} />
                  Aplicó a: <strong>{mostrarValor(aplicante.titulo_oferta)}</strong>
                </div>

                <div class="details-grid">
                  <span>
                    <Mail size={15} strokeWidth={1.8} />
                    {mostrarValor(aplicante.correo)}
                  </span>

                  <span>
                    <Phone size={15} strokeWidth={1.8} />
                    {mostrarValor(aplicante.telefono)}
                  </span>

                  <span>
                    <GraduationCap size={15} strokeWidth={1.8} />
                    {mostrarValor(aplicante.nivel_educativo)}
                  </span>

                  <span>
                    <Languages size={15} strokeWidth={1.8} />
                    {mostrarValor(aplicante.idiomas)}
                  </span>

                  <span>
                    <CalendarDays size={15} strokeWidth={1.8} />
                    Aplicó el {formatearFecha(aplicante.fecha_aplicacion)}
                  </span>

                  <span>
                    <BriefcaseBusiness size={15} strokeWidth={1.8} />
                    {mostrarValor(aplicante.experiencia)}
                  </span>
                </div>

                <p class="description">
                  {mostrarValor(aplicante.descripcion)}
                </p>
              </div>

              <div class="actions">
                <button
                  class="action-button"
                  type="button"
                  title="Ver currículum"
                  onclick={() => verPerfil(aplicante)}
                >
                  <Eye size={17} strokeWidth={1.8} />
                </button>

                <button
                  class="action-button accept"
                  type="button"
                  title="Aceptar solicitante"
                  disabled={aplicante.estado === 'aceptada'}
                  onclick={() => abrirModalEstado(aplicante, 'aceptar')}
                >
                  <Check size={17} strokeWidth={1.8} />
                </button>

                <button
                  class="action-button reject"
                  type="button"
                  title="Denegar solicitante"
                  disabled={aplicante.estado === 'denegada'}
                  onclick={() => abrirModalEstado(aplicante, 'denegar')}
                >
                  <X size={17} strokeWidth={1.8} />
                </button>
              </div>
            </article>
          {/each}
        </div>
      {/if}
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

          <h2>
            {modalAccion === 'aceptar' ? 'Aceptar solicitud' : 'Denegar solicitud'}
          </h2>

          <p>
            ¿Estás segura de que deseas
            {modalAccion === 'aceptar' ? 'aceptar' : 'denegar'} a
            <strong>{aplicanteSeleccionado?.nombre_completo}</strong>?
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

  .page-header h1 {
    margin: 0 0 8px;
    color: #1f2937;
    font-size: 34px;
  }

  .page-header p {
    margin: 0;
    color: #667085;
    font-size: 16px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: white;
    border-radius: 14px;
    padding: 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .stat-icon {
    width: 54px;
    height: 54px;
    border-radius: 12px;
    background: #eef3f6;
    color: #24364b;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .stat-icon.pending {
    background: #fff4d6;
    color: #8a6100;
  }

  .stat-icon.accepted {
    background: #dcfce7;
    color: #166534;
  }

  .stat-icon.rejected {
    background: #fee2e2;
    color: #991b1b;
  }

  .stat-card span {
    display: block;
    color: #667085;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .stat-card strong {
    color: #1f2937;
    font-size: 28px;
  }

  .applicants-card {
    background: white;
    border-radius: 14px;
    padding: 30px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .filters {
    display: grid;
    grid-template-columns: 1fr 240px 220px;
    gap: 18px;
    margin-bottom: 28px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #eef3f6;
    border-radius: 10px;
    padding: 0 16px;
    color: #667085;
  }

  .search-box input,
  .filters select {
    border: none;
    outline: none;
    background: #eef3f6;
    color: #475467;
    padding: 14px 0;
    font-size: 15px;
    width: 100%;
  }

  .filters select {
    border-radius: 10px;
    padding: 14px 16px;
  }

  .empty-state {
    text-align: center;
    padding: 65px 20px;
    color: #667085;
  }

  .empty-state h3 {
    margin: 16px 0 8px;
    color: #1f2937;
  }

  .empty-state p {
    margin: 0;
  }

  .applicants-list {
    display: grid;
    gap: 20px;
  }

  .applicant {
    border: 1px solid #edf0f5;
    border-radius: 14px;
    padding: 24px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 22px;
    align-items: start;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #24364b;
    color: white;
    display: grid;
    place-items: center;
    overflow: hidden;
    font-size: 24px;
    font-weight: 700;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .applicant-info {
    min-width: 0;
  }

  .applicant-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 12px;
  }

  .applicant-main h3 {
    margin: 0 0 6px;
    color: #1f2937;
    font-size: 20px;
  }

  .profession {
    margin: 0;
    color: #a14f3d;
    font-size: 15px;
  }

  .offer-line {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #667085;
    margin-bottom: 14px;
    font-size: 14px;
  }

  .offer-line strong {
    color: #1f2937;
  }

  .badge {
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    text-transform: capitalize;
    background: #edf0f5;
    color: #475467;
    white-space: nowrap;
  }

  .badge.pendiente {
    background: #fff4d6;
    color: #8a6100;
  }

  .badge.aceptada {
    background: #dcfce7;
    color: #166534;
  }

  .badge.denegada {
    background: #fee2e2;
    color: #991b1b;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 18px;
    margin-bottom: 14px;
  }

  .details-grid span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #667085;
    font-size: 14px;
    min-width: 0;
  }

  .description {
    margin: 0;
    color: #667085;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .action-button {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 10px;
    background: #dfb9b0;
    color: #9b5144;
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .action-button.accept {
    background: #dcfce7;
    color: #166534;
  }

  .action-button.reject {
    background: #fee2e2;
    color: #991b1b;
  }

  .action-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
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
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .filters {
      grid-template-columns: 1fr;
    }

    .applicant {
      grid-template-columns: auto 1fr;
    }

    .actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
  }

  @media (max-width: 700px) {
    .stats-grid,
    .details-grid {
      grid-template-columns: 1fr;
    }

    .applicant {
      grid-template-columns: 1fr;
    }

    .avatar {
      width: 64px;
      height: 64px;
    }

    .applicant-main {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>