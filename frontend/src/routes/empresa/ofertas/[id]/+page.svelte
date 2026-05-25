<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { API_URL } from '$lib/services/api.js';
  import LayoutEmpresa from '$lib/components/empresa/LayoutEmpresa.svelte';
  import {
    BriefcaseBusiness,
    MapPin,
    CalendarDays,
    DollarSign,
    Clock,
    GraduationCap,
    Languages,
    UsersRound,
    Pencil,
    ArrowLeft,
    UserCheck,
    Building2,
    AlertCircle,
    Globe,
    Tag,
    FileText,
    CheckCircle
  } from '@lucide/svelte';

  import 'leaflet/dist/leaflet.css';

  let empresa = $state({
    id: 1,
    nombre: 'Empresa',
    logo: ''
  });

  let oferta = $state(null);
  let cargando = $state(true);
  let error = $state('');

  let mapaElemento;
  let mapa;
  let marcador;
  let L;

  const mostrarValor = (valor) => {
    return valor && String(valor).trim() ? valor : 'Sin información registrada';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha registrada';

    return new Date(fecha).toLocaleDateString('es-SV', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearSalario = (salario, tipoSalario) => {
    if (!salario) return 'Sin salario registrado';

    const salarioFormateado = Number(salario).toLocaleString('es-SV', {
      style: 'currency',
      currency: 'USD'
    });

    return tipoSalario ? `${salarioFormateado} / ${tipoSalario}` : salarioFormateado;
  };

  const normalizarEstado = (estado) => {
    if (!estado) return 'Sin estado';
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const inicializarMapa = async () => {
    if (!mapaElemento || !oferta?.latitud || !oferta?.longitud) return;

    L = await import('leaflet');

    const lat = Number(oferta.latitud);
    const lng = Number(oferta.longitud);

    mapa = L.map(mapaElemento, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    const icono = L.divIcon({
      className: 'custom-location-marker',
      html: '<div class="marker-pin"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    marcador = L.marker([lat, lng], { icon: icono }).addTo(mapa);
    marcador.bindPopup(oferta.direccion || oferta.referencia_mapa || oferta.ubicacion || 'Ubicación de la oferta');
    marcador.openPopup();
  };

  const cargarOferta = async () => {
    try {
      cargando = true;
      error = '';

      const idOferta = page.params.id;

      const respuesta = await fetch(`${API_URL}/ofertas/${idOferta}`);

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error('La oferta no existe o fue eliminada.');
        }

        throw new Error('No se pudo cargar el detalle de la oferta.');
      }

      oferta = await respuesta.json();

      empresa = {
        id: oferta.id_empresa || 1,
        nombre: oferta.nombre_empresa || 'Empresa',
        logo: oferta.logo || ''
      };

      setTimeout(() => {
        inicializarMapa();
      }, 100);
    } catch (err) {
      error = err.message || 'Error al cargar la oferta.';
    } finally {
      cargando = false;
    }
  };

  const volverAOfertas = () => {
    goto('/empresa/ofertas');
  };

  const irAEditar = () => {
    if (!oferta) return;
    goto(`/empresa/ofertas/${oferta.id_oferta}/editar`);
  };

  const irAPostulantes = () => {
    if (!oferta) return;
    goto(`/empresa/ofertas/${oferta.id_oferta}/aplicantes`);
  };

  onMount(() => {
    cargarOferta();
  });
</script>

<LayoutEmpresa active="ofertas" {empresa}>
  {#if cargando}
    <p class="message">Cargando detalle de la oferta...</p>
  {:else if error}
    <section class="error-card">
      <AlertCircle size={46} strokeWidth={1.8} />
      <h1>No se pudo cargar la oferta</h1>
      <p>{error}</p>
      <button type="button" onclick={volverAOfertas}>
        Volver a gestionar empleos
      </button>
    </section>
  {:else if oferta}
    <section class="detail-header">
      <button class="back-button" type="button" onclick={volverAOfertas}>
        <ArrowLeft size={18} strokeWidth={1.8} />
        Volver
      </button>

      <div class="header-card">
        <div class="job-icon">
          <BriefcaseBusiness size={36} strokeWidth={1.8} />
        </div>

        <div class="header-info">
          <h1>{oferta.titulo}</h1>

          <div class="meta-list">
            <span>
              <Building2 size={16} strokeWidth={1.8} />
              {mostrarValor(oferta.nombre_empresa)}
            </span>

            <span>
              <MapPin size={16} strokeWidth={1.8} />
              {mostrarValor(oferta.ciudad || oferta.ubicacion)}
            </span>

            <span>
              <CalendarDays size={16} strokeWidth={1.8} />
              Publicada el {formatearFecha(oferta.fecha_publicacion)}
            </span>

            <span>
              <DollarSign size={16} strokeWidth={1.8} />
              {formatearSalario(oferta.salario, oferta.tipo_salario)}
            </span>
          </div>

          <div class="chips">
            <span>{mostrarValor(oferta.modalidad)}</span>
            <span>{mostrarValor(oferta.tipo_empleo || oferta.tipo_contrato)}</span>
            <span class="status {oferta.estado}">{normalizarEstado(oferta.estado)}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="detail-grid">
      <article class="main-card">
        <section class="content-section">
          <h2>Descripción del trabajo</h2>
          <p>{mostrarValor(oferta.descripcion)}</p>
        </section>

        <section class="content-section">
          <h2>Responsabilidades clave</h2>
          <p>{mostrarValor(oferta.responsabilidades)}</p>
        </section>

        <section class="content-section">
          <h2>Habilidades y experiencia</h2>
          <p>{mostrarValor(oferta.habilidades_experiencia || oferta.requisitos)}</p>
        </section>

        <section class="content-section">
          <h2>Certificaciones requeridas</h2>
          <p>{mostrarValor(oferta.certificaciones)}</p>
        </section>

        <section class="content-section">
          <h2>Información adicional</h2>

          <div class="info-grid">
            <div>
              <Tag size={18} strokeWidth={1.8} />
              <span>Categoría</span>
              <strong>{mostrarValor(oferta.categoria_empleo)}</strong>
            </div>

            <div>
              <Languages size={18} strokeWidth={1.8} />
              <span>Idiomas requeridos</span>
              <strong>{mostrarValor(oferta.idiomas_requeridos)}</strong>
            </div>

            <div>
              <Globe size={18} strokeWidth={1.8} />
              <span>Modalidad</span>
              <strong>{mostrarValor(oferta.modalidad)}</strong>
            </div>

            <div>
              <FileText size={18} strokeWidth={1.8} />
              <span>Tipo de empleo</span>
              <strong>{mostrarValor(oferta.tipo_empleo || oferta.tipo_contrato)}</strong>
            </div>
          </div>
        </section>
      </article>

      <aside class="side-column">
        <article class="summary-card">
          <h2>Resumen del trabajo</h2>

          <div class="summary-list">
            <div>
              <Clock size={18} strokeWidth={1.8} />
              <div>
                <span>Horario laboral</span>
                <strong>{mostrarValor(oferta.horario_laboral)}</strong>
              </div>
            </div>

            <div>
              <UserCheck size={18} strokeWidth={1.8} />
              <div>
                <span>Experiencia requerida</span>
                <strong>{mostrarValor(oferta.experiencia_requerida)}</strong>
              </div>
            </div>

            <div>
              <GraduationCap size={18} strokeWidth={1.8} />
              <div>
                <span>Nivel de estudios</span>
                <strong>{mostrarValor(oferta.nivel_estudios)}</strong>
              </div>
            </div>

            <div>
              <DollarSign size={18} strokeWidth={1.8} />
              <div>
                <span>Salario</span>
                <strong>{formatearSalario(oferta.salario, oferta.tipo_salario)}</strong>
              </div>
            </div>

            <div>
              <CalendarDays size={18} strokeWidth={1.8} />
              <div>
                <span>Fecha límite</span>
                <strong>{formatearFecha(oferta.fecha_limite)}</strong>
              </div>
            </div>

            <div>
              <UsersRound size={18} strokeWidth={1.8} />
              <div>
                <span>Aplicaciones recibidas</span>
                <strong>{oferta.total_aplicaciones || 0}</strong>
              </div>
            </div>
          </div>
        </article>

        <article class="summary-card">
          <h2>Ubicación del trabajo</h2>

          <div class="location-info">
            <p><strong>País:</strong> {mostrarValor(oferta.pais)}</p>
            <p><strong>Ciudad:</strong> {mostrarValor(oferta.ciudad)}</p>
            <p><strong>Dirección:</strong> {mostrarValor(oferta.direccion)}</p>
            <p><strong>Referencia:</strong> {mostrarValor(oferta.referencia_mapa)}</p>
          </div>

          {#if oferta.latitud && oferta.longitud}
            <div class="map-container">
              <div class="map" bind:this={mapaElemento}></div>
            </div>
          {:else}
            <div class="map-empty">
              <MapPin size={34} strokeWidth={1.6} />
              <span>Esta oferta no tiene ubicación en mapa.</span>
            </div>
          {/if}
        </article>

        <article class="actions-card">
          <h2>Acciones</h2>

          <button type="button" onclick={irAEditar}>
            <Pencil size={18} strokeWidth={1.8} />
            Editar oferta
          </button>

          <button type="button" onclick={irAPostulantes}>
            <UsersRound size={18} strokeWidth={1.8} />
            Ver postulantes
          </button>

          <button class="secondary" type="button" onclick={volverAOfertas}>
            <ArrowLeft size={18} strokeWidth={1.8} />
            Volver al listado
          </button>
        </article>
      </aside>
    </section>
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

  .detail-header {
    margin-bottom: 30px;
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

  .header-card {
    background: white;
    border-radius: 14px;
    padding: 30px;
    display: flex;
    align-items: flex-start;
    gap: 22px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .job-icon {
    width: 72px;
    height: 72px;
    border-radius: 16px;
    background: #dfb9b0;
    color: #9b5144;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .header-info h1 {
    margin: 0 0 14px;
    font-size: 32px;
    color: #1f2937;
  }

  .meta-list {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 22px;
    color: #667085;
    font-size: 14px;
    margin-bottom: 18px;
  }

  .meta-list span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .chips span {
    background: #eef3f6;
    color: #475467;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
  }

  .chips .status.activa {
    background: #dcfce7;
    color: #166534;
  }

  .chips .status.inactiva {
    background: #fef3c7;
    color: #92400e;
  }

  .chips .status.eliminada,
  .chips .status.cancelada {
    background: #fee2e2;
    color: #991b1b;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(360px, 0.8fr);
    gap: 30px;
    align-items: start;
  }

  .main-card,
  .summary-card,
  .actions-card {
    background: white;
    border-radius: 14px;
    padding: 30px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .content-section + .content-section {
    margin-top: 34px;
  }

  .content-section h2,
  .summary-card h2,
  .actions-card h2 {
    margin: 0 0 18px;
    color: #1f2937;
    font-size: 20px;
  }

  .content-section p {
    margin: 0;
    color: #667085;
    line-height: 1.8;
    white-space: pre-line;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  .info-grid div {
    background: #f7f8fb;
    border-radius: 12px;
    padding: 18px;
    display: grid;
    gap: 6px;
    color: #9b5144;
  }

  .info-grid span {
    color: #667085;
    font-size: 13px;
  }

  .info-grid strong {
    color: #1f2937;
    line-height: 1.4;
  }

  .side-column {
    display: grid;
    gap: 24px;
  }

  .summary-list {
    display: grid;
    gap: 22px;
  }

  .summary-list > div {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    color: #9b5144;
  }

  .summary-list span {
    display: block;
    color: #667085;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .summary-list strong {
    color: #1f2937;
    font-size: 14px;
    line-height: 1.4;
  }

  .location-info {
    display: grid;
    gap: 8px;
    margin-bottom: 18px;
  }

  .location-info p {
    margin: 0;
    color: #667085;
    line-height: 1.5;
  }

  .location-info strong {
    color: #1f2937;
  }

  .map-container {
    width: 100%;
    height: 250px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #d0d5dd;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .map-empty {
    height: 220px;
    border-radius: 12px;
    background: #eef3f6;
    display: grid;
    place-items: center;
    text-align: center;
    color: #667085;
    padding: 20px;
  }

  .actions-card {
    display: grid;
    gap: 14px;
  }

  .actions-card button {
    border: none;
    border-radius: 10px;
    padding: 14px 18px;
    background: #dfb9b0;
    color: #9b5144;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
  }

  .actions-card button.secondary {
    background: #eef3f6;
    color: #475467;
  }

  :global(.custom-location-marker) {
    background: transparent;
    border: none;
  }

  :global(.marker-pin) {
    width: 22px;
    height: 22px;
    background: #a14f3d;
    border: 4px solid white;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35);
  }

  @media (max-width: 1100px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .header-card {
      flex-direction: column;
    }

    .header-info h1 {
      font-size: 26px;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>