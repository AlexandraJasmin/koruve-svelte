<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { API_URL } from '$lib/services/api.js';
  import LayoutEmpresa from '$lib/components/empresa/LayoutEmpresa.svelte';
  import {
    BriefcaseBusiness,
    FileText,
    BadgeCheck,
    MapPin,
    Save,
    Search,
    X,
    AlertCircle,
    CheckCircle
  } from '@lucide/svelte';

  import 'leaflet/dist/leaflet.css';

  let empresa = $state({
    id: 1,
    nombre: 'Anna',
    logo: ''
  });

  let titulo = $state('');
  let descripcion = $state('');
  let responsabilidades = $state('');
  let habilidadesExperiencia = $state('');
  let salario = $state('');
  let tipoSalario = $state('');
  let horarioLaboral = $state('');
  let nivelEstudios = $state('');
  let experienciaRequerida = $state('');
  let tipoEmpleo = $state('');
  let certificaciones = $state('');
  let idiomasRequeridos = $state('');
  let fechaLimite = $state('');
  let modalidad = $state('');
  let categoriaEmpleo = $state('');
  let pais = $state('');
  let ciudad = $state('');
  let direccion = $state('');
  let referenciaMapa = $state('');

  let latitud = $state(null);
  let longitud = $state(null);
  let ubicacionEncontrada = $state(false);

  let guardando = $state(false);
  let buscandoUbicacion = $state(false);

  let modalAbierto = $state(false);
  let modalTipo = $state('error');
  let modalTitulo = $state('');
  let modalMensaje = $state('');

  let mapaElemento;
  let mapa;
  let marcador;
  let L;

  const abrirModal = (tipo, tituloModal, mensajeModal) => {
    modalTipo = tipo;
    modalTitulo = tituloModal;
    modalMensaje = mensajeModal;
    modalAbierto = true;
  };

  const cerrarModal = () => {
    modalAbierto = false;
  };

  const obtenerFechaActual = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
  };

  const validarFormulario = () => {
    if (!titulo.trim()) return 'Ingresa el título profesional.';
    if (!descripcion.trim()) return 'Ingresa la descripción del trabajo.';
    if (!responsabilidades.trim()) return 'Ingresa las responsabilidades clave.';
    if (!habilidadesExperiencia.trim()) return 'Ingresa las habilidades y experiencia requeridas.';

    if (!salario) return 'Ingresa el salario.';
    if (Number(salario) <= 0) return 'El salario debe ser un número mayor que cero.';

    if (!tipoSalario.trim()) return 'Selecciona el tipo de salario.';
    if (!horarioLaboral.trim()) return 'Ingresa el horario laboral.';
    if (!nivelEstudios.trim()) return 'Selecciona el nivel de estudios requerido.';
    if (!experienciaRequerida.trim()) return 'Ingresa la experiencia requerida.';
    if (!tipoEmpleo.trim()) return 'Selecciona el tipo de empleo.';
    if (!modalidad.trim()) return 'Selecciona la modalidad.';
    if (!categoriaEmpleo.trim()) return 'Ingresa la categoría del empleo.';

    if (!fechaLimite) return 'Selecciona la fecha límite de solicitud.';

    const fechaSeleccionada = new Date(`${fechaLimite}T00:00:00`);

    if (fechaSeleccionada < obtenerFechaActual()) {
      return 'La fecha límite no puede ser anterior a la fecha actual.';
    }

    if (!pais.trim()) return 'Ingresa el país.';
    if (!ciudad.trim()) return 'Ingresa la ciudad.';
    if (!direccion.trim()) return 'Ingresa la dirección completa.';
    if (!referenciaMapa.trim()) return 'Ingresa una referencia de ubicación.';

    if (!ubicacionEncontrada || latitud === null || longitud === null) {
      return 'Busca la ubicación en el mapa antes de guardar la oferta.';
    }

    return '';
  };

  const inicializarMapa = async () => {
    L = await import('leaflet');

    mapa = L.map(mapaElemento, {
      center: [13.6929, -89.2182],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);
  };

  const actualizarMarcador = (lat, lng, texto) => {
    if (!mapa || !L) return;

    const icono = L.divIcon({
      className: 'custom-location-marker',
      html: '<div class="marker-pin"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (marcador) {
      marcador.setLatLng([lat, lng]);
      marcador.setPopupContent(texto);
    } else {
      marcador = L.marker([lat, lng], { icon: icono }).addTo(mapa);
      marcador.bindPopup(texto);
    }

    mapa.setView([lat, lng], 15);
    marcador.openPopup();
  };

  const buscarUbicacion = async () => {
    if (!pais.trim() || !ciudad.trim() || !direccion.trim()) {
      abrirModal(
        'error',
        'Faltan datos de ubicación',
        'Para buscar en el mapa debes ingresar país, ciudad y dirección completa.'
      );
      return;
    }

    try {
      buscandoUbicacion = true;

      const busqueda = referenciaMapa.trim()
        ? `${referenciaMapa}, ${direccion}, ${ciudad}, ${pais}`
        : `${direccion}, ${ciudad}, ${pais}`;

      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda)}&limit=1`
      );

      const resultados = await respuesta.json();

      if (!resultados || resultados.length === 0) {
        ubicacionEncontrada = false;
        latitud = null;
        longitud = null;

        abrirModal(
          'error',
          'Ubicación no encontrada',
          'No se encontró esa ubicación en el mapa. Revisa la dirección o escribe una referencia más específica.'
        );
        return;
      }

      latitud = Number(resultados[0].lat);
      longitud = Number(resultados[0].lon);
      ubicacionEncontrada = true;

      actualizarMarcador(latitud, longitud, resultados[0].display_name);

      abrirModal(
        'exito',
        'Ubicación encontrada',
        'La ubicación fue encontrada correctamente en el mapa.'
      );
    } catch (err) {
      ubicacionEncontrada = false;

      abrirModal(
        'error',
        'Error al buscar ubicación',
        'No se pudo buscar la ubicación. Revisa tu conexión e intenta nuevamente.'
      );
    } finally {
      buscandoUbicacion = false;
    }
  };

  const guardarOferta = async () => {
    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      abrirModal('error', 'Formulario incompleto', mensajeValidacion);
      return;
    }

    try {
      guardando = true;

      const respuesta = await fetch(`${API_URL}/ofertas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_empresa: empresa.id,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          requisitos: habilidadesExperiencia.trim(),
          salario: Number(salario),
          modalidad,
          ubicacion: ciudad.trim(),
          tipo_contrato: tipoEmpleo,
          responsabilidades: responsabilidades.trim(),
          habilidades_experiencia: habilidadesExperiencia.trim(),
          horario_laboral: horarioLaboral.trim(),
          tipo_salario: tipoSalario,
          nivel_estudios: nivelEstudios,
          experiencia_requerida: experienciaRequerida.trim(),
          tipo_empleo: tipoEmpleo,
          certificaciones: certificaciones.trim() || null,
          idiomas_requeridos: idiomasRequeridos.trim() || null,
          fecha_limite: fechaLimite,
          pais: pais.trim(),
          ciudad: ciudad.trim(),
          direccion: direccion.trim(),
          referencia_mapa: referenciaMapa.trim(),
          latitud,
          longitud,
          categoria_empleo: categoriaEmpleo.trim(),
          urgente: false
        })
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo guardar la oferta.');
      }

      abrirModal(
        'exito',
        'Oferta creada',
        'La oferta fue creada correctamente y será visible en la lista de empleos.'
      );

      setTimeout(() => {
        goto('/empresa/ofertas');
      }, 1100);
    } catch (err) {
      abrirModal(
        'error',
        'Error al crear la oferta',
        'No se pudo crear la oferta. Revisa la información e intenta nuevamente.'
      );
    } finally {
      guardando = false;
    }
  };

  onMount(async () => {
    await inicializarMapa();
  });
</script>

<LayoutEmpresa active="crear" {empresa}>
  <section class="page-header">
    <h1>¡Publica una nueva oferta de trabajo!</h1>
  </section>

  <section class="form-card">
    <h2>Publicar Empleo</h2>

    <div class="steps">
      <div class="step active">
        <div class="step-icon">
          <BriefcaseBusiness size={28} strokeWidth={1.8} />
        </div>
        <span>Detalles del trabajo</span>
      </div>

      <div class="step">
        <div class="step-icon">
          <FileText size={28} strokeWidth={1.8} />
        </div>
        <span>Información de la oferta</span>
      </div>

      <div class="step">
        <div class="step-icon">
          <BadgeCheck size={28} strokeWidth={1.8} />
        </div>
        <span>Confirmación</span>
      </div>
    </div>

    <form onsubmit={(event) => event.preventDefault()}>
      <div class="field full">
        <label for="titulo">Título profesional</label>
        <input id="titulo" type="text" bind:value={titulo} />
      </div>

      <div class="field full">
        <label for="descripcion">Descripción del trabajo</label>
        <textarea id="descripcion" bind:value={descripcion} rows="6"></textarea>
      </div>

      <div class="field full">
        <label for="responsabilidades">Responsabilidades clave</label>
        <textarea id="responsabilidades" bind:value={responsabilidades} rows="5"></textarea>
      </div>

      <div class="field full">
        <label for="habilidadesExperiencia">Habilidades y experiencia</label>
        <textarea id="habilidadesExperiencia" bind:value={habilidadesExperiencia} rows="5"></textarea>
      </div>

      <div class="form-grid">
        <div class="field">
          <label for="salario">Salario</label>
          <input id="salario" type="number" min="0" step="0.01" bind:value={salario} />
        </div>

        <div class="field">
          <label for="horarioLaboral">Horario laboral</label>
          <input id="horarioLaboral" type="text" bind:value={horarioLaboral} />
        </div>

        <div class="field">
          <label for="tipoSalario">Tipo de salario</label>
          <select id="tipoSalario" bind:value={tipoSalario}>
            <option value="">Selecciona una opción</option>
            <option value="Mensual">Mensual</option>
            <option value="Quincenal">Quincenal</option>
            <option value="Semanal">Semanal</option>
            <option value="Por hora">Por hora</option>
            <option value="Por proyecto">Por proyecto</option>
          </select>
        </div>

        <div class="field">
          <label for="nivelEstudios">Nivel de estudios requerido</label>
          <select id="nivelEstudios" bind:value={nivelEstudios}>
            <option value="">Selecciona una opción</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Técnico">Técnico</option>
            <option value="Universitario">Universitario</option>
            <option value="Posgrado">Posgrado</option>
            <option value="No requerido">No requerido</option>
          </select>
        </div>

        <div class="field">
          <label for="experienciaRequerida">Experiencia requerida</label>
          <input id="experienciaRequerida" type="text" bind:value={experienciaRequerida} />
        </div>

        <div class="field">
          <label for="tipoEmpleo">Tipo de empleo</label>
          <select id="tipoEmpleo" bind:value={tipoEmpleo}>
            <option value="">Selecciona una opción</option>
            <option value="Tiempo completo">Tiempo completo</option>
            <option value="Medio tiempo">Medio tiempo</option>
            <option value="Por proyecto">Por proyecto</option>
            <option value="Pasantía">Pasantía</option>
            <option value="Temporal">Temporal</option>
          </select>
        </div>

        <div class="field">
          <label for="modalidad">Modalidad</label>
          <select id="modalidad" bind:value={modalidad}>
            <option value="">Selecciona una modalidad</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        <div class="field">
          <label for="categoriaEmpleo">Categoría del empleo</label>
          <input id="categoriaEmpleo" type="text" bind:value={categoriaEmpleo} />
        </div>

        <div class="field">
          <label for="certificaciones">Certificaciones requeridas</label>
          <input id="certificaciones" type="text" bind:value={certificaciones} />
        </div>

        <div class="field">
          <label for="idiomasRequeridos">Idiomas requeridos</label>
          <input id="idiomasRequeridos" type="text" bind:value={idiomasRequeridos} />
        </div>

        <div class="field full">
          <label for="fechaLimite">Fecha límite de solicitud</label>
          <input id="fechaLimite" type="date" bind:value={fechaLimite} />
        </div>

        <div class="field">
          <label for="pais">País</label>
          <input id="pais" type="text" bind:value={pais} />
        </div>

        <div class="field">
          <label for="ciudad">Ciudad</label>
          <input id="ciudad" type="text" bind:value={ciudad} />
        </div>

        <div class="field full">
          <label for="direccion">Dirección completa</label>
          <input id="direccion" type="text" bind:value={direccion} />
        </div>

        <div class="field full">
          <label for="referenciaMapa">Referencia de ubicación</label>
          <input id="referenciaMapa" type="text" bind:value={referenciaMapa} />
        </div>
      </div>

      <button class="location-button" type="button" onclick={buscarUbicacion} disabled={buscandoUbicacion}>
        <Search size={17} strokeWidth={1.8} />
        {buscandoUbicacion ? 'Buscando ubicación...' : 'Buscar ubicación en el mapa'}
      </button>

      <div class="map-container">
        <div class="map" bind:this={mapaElemento}></div>
      </div>

      <div class="location-status">
        <MapPin size={17} strokeWidth={1.8} />
        {#if ubicacionEncontrada}
          <span>Ubicación encontrada y lista para guardar.</span>
        {:else}
          <span>Busca la ubicación antes de guardar la oferta.</span>
        {/if}
      </div>

      <div class="form-actions">
        <button class="save-button" type="button" onclick={guardarOferta} disabled={guardando}>
          <Save size={18} strokeWidth={1.8} />
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  </section>

  {#if modalAbierto}
    <div class="modal-backdrop">
      <div class="modal">
        <button class="modal-close" type="button" onclick={cerrarModal}>
          <X size={20} strokeWidth={1.8} />
        </button>

        <div class="modal-icon {modalTipo}">
          {#if modalTipo === 'exito'}
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
  .page-header {
    margin-bottom: 28px;
  }

  .page-header h1 {
    margin: 0;
    font-size: 30px;
    color: #1f2937;
  }

  .form-card {
    background: white;
    border-radius: 10px;
    padding: 30px 34px 38px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .form-card h2 {
    margin: 0 0 34px;
    font-size: 18px;
    color: #1f2937;
  }

  .steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
    margin-bottom: 34px;
  }

  .step {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: #1f2937;
    font-size: 15px;
  }

  .step-icon {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    background: #f0d8d2;
    color: #9b5144;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .step.active .step-icon {
    background: #dfb9b0;
  }

  form {
    display: grid;
    gap: 22px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 22px 30px;
  }

  .field {
    display: grid;
    gap: 9px;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  label {
    color: #1f2937;
    font-size: 14px;
    font-weight: 700;
  }

  input,
  textarea,
  select {
    width: 100%;
    border: none;
    outline: none;
    border-radius: 8px;
    background: #eef3f6;
    color: #273044;
    padding: 16px 18px;
    font-size: 15px;
  }

  textarea {
    resize: vertical;
    line-height: 1.6;
  }

  .location-button {
    width: fit-content;
    border: none;
    border-radius: 9px;
    padding: 14px 24px;
    background: #dfb9b0;
    color: #9b5144;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    cursor: pointer;
  }

  .location-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .map-container {
    width: 100%;
    height: 320px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #d0d5dd;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .location-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #667085;
    font-size: 14px;
  }

  .form-actions {
    margin-top: 10px;
  }

  .save-button {
    border: none;
    border-radius: 9px;
    padding: 15px 30px;
    background: #a14f3d;
    color: white;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .save-button:hover {
    background: #8f4334;
  }

  .save-button:disabled {
    opacity: 0.7;
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

  .modal-icon.error {
    background: #fee2e2;
    color: #b42318;
  }

  .modal-icon.exito {
    background: #dcfce7;
    color: #166534;
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
    .steps,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .step {
      justify-content: flex-start;
    }

    .field.full {
      grid-column: auto;
    }
  }
</style>