<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { API_URL } from '$lib/services/api.js';
  import LayoutEmpresa from '$lib/components/empresa/LayoutEmpresa.svelte';
  import {
    BriefcaseBusiness,
    BadgeDollarSign,
    CheckCircle,
    Search,
    Save,
    X,
    AlertCircle,
    ArrowLeft
  } from '@lucide/svelte';

  import 'leaflet/dist/leaflet.css';

  let empresa = $state({
    id: 1,
    nombre: 'Empresa',
    logo: ''
  });

  let cargando = $state(true);
  let guardando = $state(false);

  let modalAbierto = $state(false);
  let modalTipo = $state('info');
  let modalTitulo = $state('');
  let modalMensaje = $state('');

  let mapaElemento;
  let mapa;
  let marcador;
  let L;

  let formulario = $state({
    titulo: '',
    descripcion: '',
    requisitos: '',
    salario: '',
    modalidad: '',
    ubicacion: '',
    tipo_contrato: '',
    responsabilidades: '',
    habilidades_experiencia: '',
    horario_laboral: '',
    tipo_salario: '',
    nivel_estudios: '',
    experiencia_requerida: '',
    tipo_empleo: '',
    certificaciones: '',
    idiomas_requeridos: '',
    fecha_limite: '',
    pais: '',
    ciudad: '',
    direccion: '',
    referencia_mapa: '',
    latitud: null,
    longitud: null,
    categoria_empleo: '',
    urgente: false
  });

  const abrirModal = (tipo, titulo, mensaje) => {
    modalTipo = tipo;
    modalTitulo = titulo;
    modalMensaje = mensaje;
    modalAbierto = true;
  };

  const cerrarModal = () => {
    modalAbierto = false;
  };

  const volver = () => {
    goto(`/empresa/ofertas/${page.params.id}`);
  };

  const convertirFechaInput = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toISOString().split('T')[0];
  };

  const inicializarMapa = async () => {
    if (!mapaElemento || mapa) return;

    L = await import('leaflet');

    mapa = L.map(mapaElemento, {
      center: [13.6929, -89.2182],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    if (formulario.latitud && formulario.longitud) {
      ponerMarcador(Number(formulario.latitud), Number(formulario.longitud));
    }
  };

  const ponerMarcador = (lat, lng) => {
    if (!mapa || !L) return;

    const icono = L.divIcon({
      className: 'custom-location-marker',
      html: '<div class="marker-pin"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (marcador) {
      marcador.setLatLng([lat, lng]);
    } else {
      marcador = L.marker([lat, lng], { icon: icono }).addTo(mapa);
    }

    mapa.setView([lat, lng], 15);
    marcador.bindPopup(formulario.direccion || formulario.referencia_mapa || 'Ubicación de la oferta').openPopup();
  };

  const cargarOferta = async () => {
    try {
      cargando = true;

      const respuesta = await fetch(`${API_URL}/ofertas/${page.params.id}`);

      if (!respuesta.ok) {
        throw new Error('No se pudo cargar la oferta para editar.');
      }

      const oferta = await respuesta.json();

      empresa = {
        id: oferta.id_empresa || 1,
        nombre: oferta.nombre_empresa || 'Empresa',
        logo: oferta.logo || ''
      };

      formulario = {
        titulo: oferta.titulo || '',
        descripcion: oferta.descripcion || '',
        requisitos: oferta.requisitos || '',
        salario: oferta.salario || '',
        modalidad: oferta.modalidad || '',
        ubicacion: oferta.ubicacion || '',
        tipo_contrato: oferta.tipo_contrato || '',
        responsabilidades: oferta.responsabilidades || '',
        habilidades_experiencia: oferta.habilidades_experiencia || '',
        horario_laboral: oferta.horario_laboral || '',
        tipo_salario: oferta.tipo_salario || '',
        nivel_estudios: oferta.nivel_estudios || '',
        experiencia_requerida: oferta.experiencia_requerida || '',
        tipo_empleo: oferta.tipo_empleo || '',
        certificaciones: oferta.certificaciones || '',
        idiomas_requeridos: oferta.idiomas_requeridos || '',
        fecha_limite: convertirFechaInput(oferta.fecha_limite),
        pais: oferta.pais || '',
        ciudad: oferta.ciudad || '',
        direccion: oferta.direccion || '',
        referencia_mapa: oferta.referencia_mapa || '',
        latitud: oferta.latitud || null,
        longitud: oferta.longitud || null,
        categoria_empleo: oferta.categoria_empleo || '',
        urgente: oferta.urgente || false
      };

      setTimeout(() => {
        inicializarMapa();
      }, 100);
    } catch (error) {
      abrirModal('error', 'Error al cargar la oferta', error.message);
    } finally {
      cargando = false;
    }
  };

  const buscarUbicacion = async () => {
    if (
      !formulario.pais ||
      !formulario.ciudad ||
      !formulario.direccion ||
      !formulario.referencia_mapa
    ) {
      abrirModal(
        'error',
        'Datos de ubicación incompletos',
        'Completa país, ciudad, dirección y referencia de ubicación antes de buscar en el mapa.'
      );
      return;
    }

    try {
      const consultas = [
        `${formulario.referencia_mapa}, ${formulario.ciudad}, ${formulario.pais}`,
        `${formulario.direccion}, ${formulario.ciudad}, ${formulario.pais}`,
        `${formulario.ciudad}, ${formulario.pais}`
      ];

      let resultados = [];

      for (const consulta of consultas) {
        const respuesta = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(consulta)}`
        );

        resultados = await respuesta.json();

        if (resultados && resultados.length > 0) {
          break;
        }
      }

      if (!resultados || resultados.length === 0) {
        abrirModal(
          'error',
          'Ubicación no encontrada',
          'No se encontró esa ubicación en el mapa. Revisa la dirección o escribe una referencia más específica.'
        );
        return;
      }

      const ubicacion = resultados[0];

      formulario.latitud = Number(ubicacion.lat);
      formulario.longitud = Number(ubicacion.lon);
      formulario.ubicacion = formulario.ciudad;

      ponerMarcador(formulario.latitud, formulario.longitud);

      abrirModal(
        'success',
        'Ubicación encontrada',
        'La ubicación se actualizó correctamente en el mapa.'
      );
    } catch (error) {
      abrirModal(
        'error',
        'Error al buscar ubicación',
        'No se pudo buscar la ubicación en el mapa. Revisa tu conexión e intenta de nuevo.'
      );
    }
  };

  const validarFormulario = () => {
    const camposObligatorios = [
      ['titulo', 'Título profesional'],
      ['descripcion', 'Descripción del trabajo'],
      ['requisitos', 'Requisitos'],
      ['responsabilidades', 'Responsabilidades clave'],
      ['habilidades_experiencia', 'Habilidades y experiencia'],
      ['salario', 'Salario'],
      ['modalidad', 'Modalidad'],
      ['tipo_contrato', 'Tipo de contrato'],
      ['horario_laboral', 'Horario laboral'],
      ['tipo_salario', 'Tipo de salario'],
      ['nivel_estudios', 'Nivel de estudios requerido'],
      ['experiencia_requerida', 'Experiencia requerida'],
      ['tipo_empleo', 'Tipo de empleo'],
      ['categoria_empleo', 'Categoría del empleo'],
      ['fecha_limite', 'Fecha límite'],
      ['pais', 'País'],
      ['ciudad', 'Ciudad'],
      ['direccion', 'Dirección completa'],
      ['referencia_mapa', 'Referencia de ubicación']
    ];

    for (const [campo, nombre] of camposObligatorios) {
      if (!formulario[campo] || String(formulario[campo]).trim() === '') {
        abrirModal('error', 'Campo obligatorio', `Completa el campo: ${nombre}.`);
        return false;
      }
    }

    const salarioNumerico = Number(formulario.salario);

    if (Number.isNaN(salarioNumerico) || salarioNumerico <= 0) {
      abrirModal('error', 'Salario inválido', 'El salario debe ser un número mayor que cero.');
      return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaLimite = new Date(`${formulario.fecha_limite}T00:00:00`);

    if (fechaLimite < hoy) {
      abrirModal('error', 'Fecha inválida', 'La fecha límite no puede ser anterior a la fecha actual.');
      return false;
    }

    if (!formulario.latitud || !formulario.longitud) {
      abrirModal(
        'error',
        'Ubicación no confirmada',
        'Busca la ubicación en el mapa antes de guardar los cambios.'
      );
      return false;
    }

    return true;
  };

  const actualizarOferta = async () => {
    if (!validarFormulario()) return;

    try {
      guardando = true;

      const respuesta = await fetch(`${API_URL}/ofertas/${page.params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formulario)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || 'No se pudo actualizar la oferta.');
      }

      abrirModal('success', 'Oferta actualizada', 'Los cambios se guardaron correctamente.');

      setTimeout(() => {
        goto(`/empresa/ofertas/${page.params.id}`);
      }, 900);
    } catch (error) {
      abrirModal('error', 'Error al actualizar', error.message);
    } finally {
      guardando = false;
    }
  };

  onMount(() => {
    cargarOferta();
  });
</script>

<LayoutEmpresa active="ofertas" {empresa}>
  {#if cargando}
    <p class="message">Cargando oferta...</p>
  {:else}
    <section class="page-header">
      <button class="back-button" type="button" onclick={volver}>
        <ArrowLeft size={18} strokeWidth={1.8} />
        Volver al detalle
      </button>

      <h1>Editar Oferta de Empleo</h1>
    </section>

    <section class="form-card">
      <h2>Editar Empleo</h2>

      <div class="steps">
        <div class="step">
          <div class="step-icon">
            <BriefcaseBusiness size={28} strokeWidth={1.8} />
          </div>
          <span>Detalles del<br />trabajo</span>
        </div>

        <div class="step">
          <div class="step-icon">
            <BadgeDollarSign size={28} strokeWidth={1.8} />
          </div>
          <span>Paquete y pagos</span>
        </div>

        <div class="step">
          <div class="step-icon">
            <CheckCircle size={30} strokeWidth={1.8} />
          </div>
          <span>Confirmación</span>
        </div>
      </div>

      <form onsubmit={(event) => event.preventDefault()}>
        <div class="form-group">
          <label for="titulo">Título profesional</label>
          <input id="titulo" type="text" bind:value={formulario.titulo} />
        </div>

        <div class="form-group">
          <label for="descripcion">Descripción del trabajo</label>
          <textarea id="descripcion" rows="5" bind:value={formulario.descripcion}></textarea>
        </div>

        <div class="form-group">
          <label for="responsabilidades">Responsabilidades clave</label>
          <textarea id="responsabilidades" rows="4" bind:value={formulario.responsabilidades}></textarea>
        </div>

        <div class="form-group">
          <label for="requisitos">Requisitos</label>
          <textarea id="requisitos" rows="4" bind:value={formulario.requisitos}></textarea>
        </div>

        <div class="form-group">
          <label for="habilidades_experiencia">Habilidades y experiencia</label>
          <textarea id="habilidades_experiencia" rows="4" bind:value={formulario.habilidades_experiencia}></textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="salario">Salario</label>
            <input id="salario" type="number" min="1" step="0.01" bind:value={formulario.salario} />
          </div>

          <div class="form-group">
            <label for="horario_laboral">Horario laboral</label>
            <input id="horario_laboral" type="text" bind:value={formulario.horario_laboral} />
          </div>

          <div class="form-group">
            <label for="tipo_salario">Tipo de salario</label>
            <select id="tipo_salario" bind:value={formulario.tipo_salario}>
              <option value="">Selecciona una opción</option>
              <option value="Mensual">Mensual</option>
              <option value="Quincenal">Quincenal</option>
              <option value="Semanal">Semanal</option>
              <option value="Por hora">Por hora</option>
              <option value="Por proyecto">Por proyecto</option>
            </select>
          </div>

          <div class="form-group">
            <label for="nivel_estudios">Nivel de estudios requerido</label>
            <select id="nivel_estudios" bind:value={formulario.nivel_estudios}>
              <option value="">Selecciona una opción</option>
              <option value="Bachillerato">Bachillerato</option>
              <option value="Técnico">Técnico</option>
              <option value="Universitario">Universitario</option>
              <option value="Maestría">Maestría</option>
              <option value="No requerido">No requerido</option>
            </select>
          </div>

          <div class="form-group">
            <label for="experiencia_requerida">Experiencia requerida</label>
            <input id="experiencia_requerida" type="text" bind:value={formulario.experiencia_requerida} />
          </div>

          <div class="form-group">
            <label for="tipo_empleo">Tipo de empleo</label>
            <select id="tipo_empleo" bind:value={formulario.tipo_empleo}>
              <option value="">Selecciona una opción</option>
              <option value="Tiempo completo">Tiempo completo</option>
              <option value="Medio tiempo">Medio tiempo</option>
              <option value="Freelance">Freelance</option>
              <option value="Pasantía">Pasantía</option>
              <option value="Temporal">Temporal</option>
            </select>
          </div>

          <div class="form-group">
            <label for="modalidad">Modalidad</label>
            <select id="modalidad" bind:value={formulario.modalidad}>
              <option value="">Selecciona una opción</option>
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div class="form-group">
            <label for="tipo_contrato">Tipo de contrato</label>
            <select id="tipo_contrato" bind:value={formulario.tipo_contrato}>
              <option value="">Selecciona una opción</option>
              <option value="Tiempo completo">Tiempo completo</option>
              <option value="Medio tiempo">Medio tiempo</option>
              <option value="Servicios profesionales">Servicios profesionales</option>
              <option value="Temporal">Temporal</option>
            </select>
          </div>

          <div class="form-group">
            <label for="certificaciones">Certificaciones requeridas</label>
            <input id="certificaciones" type="text" bind:value={formulario.certificaciones} />
          </div>

          <div class="form-group">
            <label for="idiomas_requeridos">Idiomas requeridos</label>
            <input id="idiomas_requeridos" type="text" bind:value={formulario.idiomas_requeridos} />
          </div>
        </div>

        <div class="form-group">
          <label for="categoria_empleo">Categoría del empleo</label>
          <input id="categoria_empleo" type="text" bind:value={formulario.categoria_empleo} />
        </div>

        <div class="form-group">
          <label for="fecha_limite">Fecha límite de solicitud</label>
          <input id="fecha_limite" type="date" bind:value={formulario.fecha_limite} />
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="pais">País</label>
            <input id="pais" type="text" bind:value={formulario.pais} />
          </div>

          <div class="form-group">
            <label for="ciudad">Ciudad</label>
            <input id="ciudad" type="text" bind:value={formulario.ciudad} />
          </div>
        </div>

        <div class="form-group">
          <label for="direccion">Dirección completa</label>
          <input id="direccion" type="text" bind:value={formulario.direccion} />
        </div>

        <div class="form-group">
          <label for="referencia_mapa">Referencia de ubicación</label>
          <input id="referencia_mapa" type="text" bind:value={formulario.referencia_mapa} />
        </div>

        <button class="map-button" type="button" onclick={buscarUbicacion}>
          <Search size={18} strokeWidth={1.8} />
          Buscar ubicación en el mapa
        </button>

        <div class="map-container">
          <div class="map" bind:this={mapaElemento}></div>
        </div>

        <div class="form-actions">
          <button class="save-button" type="button" onclick={actualizarOferta} disabled={guardando}>
            <Save size={18} strokeWidth={1.8} />
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  {/if}

  {#if modalAbierto}
    <div class="modal-backdrop">
      <div class="modal">
        <button class="modal-close" type="button" onclick={cerrarModal}>
          <X size={20} strokeWidth={1.8} />
        </button>

        <div class="modal-icon {modalTipo}">
          {#if modalTipo === 'success'}
            <CheckCircle size={30} strokeWidth={1.8} />
          {:else}
            <AlertCircle size={30} strokeWidth={1.8} />
          {/if}
        </div>

        <h2>{modalTitulo}</h2>
        <p>{modalMensaje}</p>

        <button class="modal-button" type="button" onclick={cerrarModal}>
          Entendido
        </button>
      </div>
    </div>
  {/if}
</LayoutEmpresa>

<style>
  .message {
    background: white;
    padding: 18px;
    border-radius: 12px;
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

  .page-header h1 {
    margin: 0;
    color: #1f2937;
    font-size: 34px;
  }

  .form-card {
    background: white;
    border-radius: 14px;
    padding: 34px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .form-card h2 {
    margin: 0 0 34px;
    color: #1f2937;
    font-size: 20px;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
    margin-bottom: 36px;
  }

  .step {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: #1f2937;
    font-weight: 700;
  }

  .step-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #dfb9b0;
    color: #9b5144;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  form {
    display: grid;
    gap: 20px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 22px 28px;
  }

  .form-group {
    display: grid;
    gap: 9px;
  }

  label {
    color: #1f2937;
    font-weight: 700;
    font-size: 14px;
  }

  input,
  textarea,
  select {
    width: 100%;
    border: none;
    outline: none;
    background: #eef3f6;
    border-radius: 8px;
    padding: 15px 16px;
    color: #1f2937;
    font-size: 15px;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
    line-height: 1.6;
  }

  .map-button,
  .save-button {
    width: fit-content;
    border: none;
    border-radius: 10px;
    padding: 15px 22px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #dfb9b0;
    color: #7c2d12;
    font-weight: 700;
    cursor: pointer;
  }

  .map-container {
    width: 100%;
    height: 330px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #d0d5dd;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .form-actions {
    margin-top: 10px;
  }

  .save-button {
    background: #a14f3d;
    color: white;
  }

  .save-button:disabled {
    opacity: 0.65;
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
    max-width: 430px;
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

  .modal-icon.success {
    background: #dcfce7;
    color: #166534;
  }

  .modal-icon.error {
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

  .modal-button {
    margin-top: 26px;
    border: none;
    border-radius: 10px;
    padding: 13px 22px;
    background: #a14f3d;
    color: white;
    font-weight: 700;
    cursor: pointer;
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

  @media (max-width: 900px) {
    .form-grid,
    .steps {
      grid-template-columns: 1fr;
    }

    .step {
      justify-content: flex-start;
    }
  }
</style>