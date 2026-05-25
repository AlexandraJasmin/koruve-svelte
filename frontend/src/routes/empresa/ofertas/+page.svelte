<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { API_URL } from '$lib/services/api.js';
  import LayoutEmpresa from '$lib/components/empresa/LayoutEmpresa.svelte';
  import {
    Trash,
    Pencil,
    Eye,
    MapPin,
    BriefcaseBusiness,
    X
  } from '@lucide/svelte';

  let cargando = $state(true);
  let error = $state('');
  let ofertas = $state([]);

  let modalEliminarAbierto = $state(false);
  let ofertaSeleccionada = $state(null);
  let eliminando = $state(false);

  let empresa = $state({
    id: 1,
    nombre: 'Anna',
    logo: ''
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';

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

  const cargarOfertas = async () => {
    try {
      cargando = true;
      error = '';

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

      const respuesta = await fetch(`${API_URL}/empresas/${empresa.id}/ofertas`);

      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}: no se pudieron cargar las ofertas`);
      }

      const data = await respuesta.json();

      ofertas = data.map((oferta) => ({
        id: oferta.id_oferta,
        titulo: oferta.titulo,
        ubicacion: oferta.ubicacion || 'Sin ubicación',
        fecha: oferta.fecha_publicacion,
        estado: oferta.estado || 'sin estado',
        totalAplicaciones: oferta.total_aplicaciones || 0
      }));
    } catch (err) {
      error = err.message || 'Error al cargar las ofertas';
      console.error('Error al cargar ofertas:', err);
    } finally {
      cargando = false;
    }
  };

  const abrirModalEliminar = (oferta) => {
    ofertaSeleccionada = oferta;
    modalEliminarAbierto = true;
  };

  const cerrarModalEliminar = () => {
    modalEliminarAbierto = false;
    ofertaSeleccionada = null;
  };

  const eliminarOferta = async () => {
    if (!ofertaSeleccionada) return;

    try {
      eliminando = true;

      const respuesta = await fetch(`${API_URL}/ofertas/${ofertaSeleccionada.id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado: 'eliminada'
        })
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo eliminar la oferta');
      }

      ofertas = ofertas.filter((oferta) => oferta.id !== ofertaSeleccionada.id);
      cerrarModalEliminar();
    } catch (err) {
      error = err.message || 'Error al eliminar la oferta';
      console.error('Error al eliminar oferta:', err);
    } finally {
      eliminando = false;
    }
  };

  const irAEditar = (id) => {
    goto(`/empresa/ofertas/${id}/editar`);
  };

  const irADetalle = (id) => {
    goto(`/empresa/ofertas/${id}/aplicantes`);
  };

  onMount(() => {
    cargarOfertas();
  });
</script>

<LayoutEmpresa active="ofertas" {empresa}>
  <section class="page-header">
    <div>
      <h1>Gestionar empleos</h1>
    </div>

    <a class="create-button" href="/empresa/ofertas/crear">
      <BriefcaseBusiness size={18} strokeWidth={1.8} />
      Publicar empleo
    </a>
  </section>

  <section class="jobs-card">
    <div class="card-header">
      <h2>Mis Ofertas de Empleo</h2>
    </div>

    {#if cargando}
      <p class="message">Cargando ofertas...</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if ofertas.length === 0}
      <div class="empty-state">
        <BriefcaseBusiness size={40} strokeWidth={1.6} />
        <h3>No hay ofertas registradas</h3>
        <p>Cuando publiques una oferta, aparecerá en esta sección.</p>
      </div>
    {:else}
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Aplicaciones</th>
              <th>Fecha de creación</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {#each ofertas as oferta}
              <tr>
                <td>
                  <div class="job-title">
                    <h3>{oferta.titulo}</h3>
                    <span>
                      <MapPin size={15} strokeWidth={1.8} />
                      {oferta.ubicacion}
                    </span>
                  </div>
                </td>

                <td>
                  <span class="applications">
                    {oferta.totalAplicaciones} aplicados
                  </span>
                </td>

                <td>
                  <span class="date">
                    {formatearFecha(oferta.fecha)}
                  </span>
                </td>

                <td>
                  <span class="status {oferta.estado}">
                    {normalizarEstado(oferta.estado)}
                  </span>
                </td>

                <td>
                  <div class="actions">
                    <button
                      class="action-button"
                      type="button"
                      aria-label="Eliminar oferta"
                      onclick={() => abrirModalEliminar(oferta)}
                    >
                      <Trash size={17} strokeWidth={1.8} />
                    </button>

                    <button
                      class="action-button"
                      type="button"
                      aria-label="Editar oferta"
                      onclick={() => irAEditar(oferta.id)}
                    >
                      <Pencil size={17} strokeWidth={1.8} />
                    </button>

                    <button
                      class="action-button"
                      type="button"
                      aria-label="Ver detalle"
                      onclick={() => irADetalle(oferta.id)}
                    >
                      <Eye size={17} strokeWidth={1.8} />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  {#if modalEliminarAbierto}
    <div class="modal-backdrop">
      <div class="modal">
        <button class="modal-close" type="button" onclick={cerrarModalEliminar}>
          <X size={20} strokeWidth={1.8} />
        </button>

        <div class="modal-icon">
          <Trash size={28} strokeWidth={1.8} />
        </div>

        <h2>Eliminar oferta</h2>

        <p>
          ¿Estás segura de que deseas eliminar la oferta
          <strong>{ofertaSeleccionada?.titulo}</strong>?
        </p>

        <div class="modal-actions">
          <button class="cancel-button" type="button" onclick={cerrarModalEliminar}>
            Cancelar
          </button>

          <button class="delete-button" type="button" onclick={eliminarOferta} disabled={eliminando}>
            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</LayoutEmpresa>

<style>
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
  }

  .page-header h1 {
    margin: 0;
    font-size: 34px;
    color: #1f2937;
  }

  .create-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    background: #dfb9b0;
    color: #9b5144;
    padding: 14px 18px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 14px;
  }

  .jobs-card {
    background: white;
    border-radius: 10px;
    padding: 28px 28px 38px;
    box-shadow: 0 10px 26px rgba(20, 31, 56, 0.06);
  }

  .card-header {
    margin-bottom: 28px;
  }

  .card-header h2 {
    margin: 0;
    font-size: 20px;
    color: #1f2937;
  }

  .message,
  .error {
    background: #f7f8fb;
    padding: 18px;
    border-radius: 10px;
  }

  .error {
    color: #b42318;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #667085;
  }

  .empty-state h3 {
    margin: 14px 0 8px;
    color: #1f2937;
  }

  .empty-state p {
    margin: 0;
  }

  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background: #f5f7fc;
  }

  th {
    text-align: left;
    padding: 22px 24px;
    color: #a14f3d;
    font-size: 15px;
    font-weight: 700;
  }

  th:last-child {
    text-align: center;
  }

  td {
    padding: 22px 24px;
    border-bottom: 1px solid #edf0f5;
    vertical-align: middle;
  }

  .job-title h3 {
    margin: 0 0 10px;
    font-size: 18px;
    color: #1f2937;
  }

  .job-title span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #667085;
    font-size: 14px;
  }

  .applications {
    color: #a14f3d;
    font-size: 15px;
  }

  .date {
    color: #667085;
    font-size: 15px;
  }

  .status {
    font-size: 15px;
    font-weight: 700;
  }

  .status.activa {
    color: #16a34a;
  }

  .status.inactiva {
    color: #ca8a04;
  }

  .status.cancelada,
  .status.eliminada {
    color: #dc2626;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .action-button {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 9px;
    background: #dfb9b0;
    color: #9b5144;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .action-button:hover {
    background: #d2a197;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.42);
    display: grid;
    place-items: center;
    z-index: 50;
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
    width: 62px;
    height: 62px;
    border-radius: 50%;
    background: #fee2e2;
    color: #b42318;
    display: grid;
    place-items: center;
    margin: 0 auto 18px;
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
  .delete-button {
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

  .delete-button {
    background: #dc2626;
    color: white;
  }

  .delete-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    .page-header {
      align-items: flex-start;
      flex-direction: column;
    }

    th,
    td {
      padding: 18px 16px;
    }
  }
</style>