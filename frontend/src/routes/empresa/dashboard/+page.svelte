<script>
  import { onMount } from 'svelte';
  import { API_URL } from '$lib/services/api.js';
  import LayoutEmpresa from '$lib/components/empresa/LayoutEmpresa.svelte';
  import {
    BriefcaseBusiness,
    FileText,
    BadgeCheck,
    Bell,
    UsersRound
  } from '@lucide/svelte';

  let cargando = $state(true);
  let error = $state('');

  let totalOfertas = $state(0);
  let ofertasActivas = $state(0);
  let ofertasInactivas = $state(0);
  let ofertasCanceladas = $state(0);
  let ofertasEliminadas = $state(0);

  let totalAplicantes = $state(0);
  let aplicantesAceptados = $state(0);

  let postulantesRecientes = $state([]);

  let empresa = $state({
    id: 1,
    nombre: 'Anna',
    logo: ''
  });

  onMount(async () => {
    try {
      const sesionGuardada = localStorage.getItem('sesion');

      if (sesionGuardada) {
        const sesion = JSON.parse(sesionGuardada);

        if (sesion.rol === 'empresa') {
          empresa = {
            id: sesion.id || 1,
            nombre: sesion.nombre || 'Empresa',
            logo: sesion.logo || ''
          };
        }
      }

      const respuesta = await fetch(`${API_URL}/dashboard/empresa/${empresa.id}`);

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}: no se pudo obtener el dashboard`);
      }

      const data = await respuesta.json();

      totalOfertas = data.ofertas?.total_ofertas || 0;
      ofertasActivas = data.ofertas?.ofertas_activas || 0;
      ofertasInactivas = data.ofertas?.ofertas_inactivas || 0;
      ofertasCanceladas = data.ofertas?.ofertas_canceladas || 0;
      ofertasEliminadas = data.ofertas?.ofertas_eliminadas || 0;

      totalAplicantes = data.aplicaciones?.total_aplicantes || 0;
      aplicantesAceptados = data.aplicaciones?.aplicantes_aceptados || 0;

      postulantesRecientes = (data.ultimas_aplicaciones || []).map((item) => ({
        id: item.id_aplicacion,
        nombre: item.nombre_completo || 'Sin nombre',
        profesion: item.profesion || 'Sin profesión',
        oferta: item.oferta || 'Sin oferta',
        estado: item.estado || 'pendiente',
        inicial: item.nombre_completo ? item.nombre_completo.charAt(0).toUpperCase() : '?'
      }));
    } catch (err) {
        error = 'Error al cargar el dashboard';
    } finally {
      cargando = false;
    }
  });
</script>

<LayoutEmpresa active="dashboard" {empresa}>
  <section class="welcome">
    <h1>¡Hola, {empresa.nombre}!</h1>
    <p>¿Lista para revisar la actividad de tu empresa?</p>
  </section>

  {#if cargando}
    <p class="message">Cargando dashboard...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-icon">
          <BriefcaseBusiness size={30} strokeWidth={1.8} />
        </div>
        <div class="stat-text">
          <h3>{totalOfertas}</h3>
          <p>Ofertas de Empleo</p>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon">
          <FileText size={30} strokeWidth={1.8} />
        </div>
        <div class="stat-text">
          <h3>{totalAplicantes}</h3>
          <p>Solicitudes</p>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-icon">
          <BadgeCheck size={32} strokeWidth={1.8} />
        </div>
        <div class="stat-text">
          <h3>{aplicantesAceptados}</h3>
          <p>Aceptados</p>
        </div>
      </article>
    </section>

    <section class="dashboard-grid">
      <article class="panel-card">
        <h2>Resumen de Ofertas</h2>

        <div class="status-list">
          <div>
            <span>Activas</span>
            <strong>{ofertasActivas}</strong>
          </div>
          <div>
            <span>Inactivas</span>
            <strong>{ofertasInactivas}</strong>
          </div>
          <div>
            <span>Canceladas</span>
            <strong>{ofertasCanceladas}</strong>
          </div>
          <div>
            <span>Eliminadas</span>
            <strong>{ofertasEliminadas}</strong>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="section-title">
          <h2>Notificaciones</h2>
          <Bell size={20} strokeWidth={1.8} />
        </div>

        {#if postulantesRecientes.length === 0}
          <p class="empty">No hay aplicaciones recientes.</p>
        {:else}
          <div class="notifications">
            {#each postulantesRecientes as postulante}
              <div class="notification">
                <div class="notification-icon">
                  <BriefcaseBusiness size={17} strokeWidth={1.8} />
                </div>
                <p>
                  <strong>{postulante.nombre}</strong>
                  aplicó a la oferta
                  <span>{postulante.oferta}</span>
                </p>
              </div>
            {/each}
          </div>
        {/if}
      </article>
    </section>

    <section class="recent-card">
      <div class="section-title">
        <h2>Postulantes Recientes</h2>
        <UsersRound size={21} strokeWidth={1.8} />
      </div>

      {#if postulantesRecientes.length === 0}
        <p class="empty">Todavía no hay postulantes recientes.</p>
      {:else}
        <div class="applicants-list">
          {#each postulantesRecientes as postulante}
            <article class="applicant">
              <div class="applicant-avatar">
                {postulante.inicial}
              </div>

              <div class="applicant-info">
                <h3>{postulante.nombre}</h3>
                <p>{postulante.profesion}</p>
                <span>{postulante.oferta}</span>
              </div>

              <div class="badge {postulante.estado}">
                {postulante.estado}
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</LayoutEmpresa>

<style>
  .welcome {
    margin-bottom: 32px;
  }

  .welcome h1 {
    margin: 0 0 10px;
    font-size: 32px;
    color: #1f2937;
  }

  .welcome p {
    margin: 0;
    color: #667085;
    font-size: 17px;
  }

  .message,
  .error {
    background: white;
    padding: 18px;
    border-radius: 12px;
  }

  .error {
    color: #b42318;
  }

  .stats-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    margin-bottom: 36px;
  }

  .stat-card {
    background: white;
    border-radius: 10px;
    padding: 28px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
    min-height: 130px;
  }

  .stat-icon {
    width: 62px;
    height: 62px;
    border-radius: 8px;
    background: #d7dbe2;
    color: #24364b;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .stat-text {
    text-align: right;
  }

  .stat-text h3 {
    margin: 0;
    font-size: 34px;
    color: #1f2937;
  }

  .stat-text p {
    margin: 6px 0 0;
    font-size: 15px;
    color: #1f2937;
  }

  .dashboard-grid {
    width: 100%;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 36px;
    margin-bottom: 38px;
  }

  .panel-card,
  .recent-card {
    background: white;
    border-radius: 10px;
    padding: 32px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .panel-card h2,
  .recent-card h2 {
    margin: 0;
    font-size: 20px;
    color: #1f2937;
  }

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 26px;
    color: #24364b;
  }

  .status-list {
    display: grid;
    gap: 17px;
  }

  .status-list div {
    display: flex;
    justify-content: space-between;
    background: #f7f8fb;
    padding: 18px;
    border-radius: 8px;
  }

  .status-list span {
    color: #667085;
    font-size: 17px;
  }

  .status-list strong {
    color: #24364b;
    font-size: 17px;
  }

  .notifications {
    display: grid;
    gap: 22px;
  }

  .notification {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .notification-icon {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #f0d8d2;
    color: #9b5144;
  }

  .notification p {
    margin: 0;
    color: #667085;
    font-size: 15px;
    line-height: 1.5;
  }

  .notification strong {
    color: #111827;
  }

  .notification span {
    color: #9b5144;
  }

  .applicants-list {
    display: grid;
    gap: 18px;
  }

  .applicant {
    border: 1px solid #edf0f5;
    border-radius: 10px;
    padding: 22px 26px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .applicant-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #24364b;
    color: white;
    display: grid;
    place-items: center;
    font-size: 22px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .applicant-info {
    flex: 1;
  }

  .applicant-info h3 {
    margin: 0 0 7px;
    font-size: 18px;
    color: #1f2937;
  }

  .applicant-info p {
    margin: 0 0 7px;
    color: #c26b5b;
    font-size: 15px;
  }

  .applicant-info span {
    color: #667085;
    font-size: 14px;
  }

  .badge {
    padding: 9px 16px;
    border-radius: 999px;
    font-size: 14px;
    text-transform: capitalize;
    background: #edf0f5;
    color: #475467;
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

  .empty {
    color: #667085;
    font-size: 15px;
  }

  @media (max-width: 1100px) {
    .stats-grid,
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
</style>