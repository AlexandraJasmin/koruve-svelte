<script>
  import { goto } from '$app/navigation';

  let busqueda = '';
  let ubicacion = '';

  function buscarEmpleos() {
    const params = new URLSearchParams();

    const textoBusqueda = busqueda.trim();
    const textoUbicacion = ubicacion.trim();

    if (textoBusqueda !== '') {
      params.set('busqueda', textoBusqueda);
    }

    if (textoUbicacion !== '') {
      params.set('ciudad', textoUbicacion);
    }

    const query = params.toString();

    if (query) {
      goto(`/empleos?${query}`);
    } else {
      goto('/empleos');
    }
  }

  const empleosDestacados = [
    {
      id: 1,
      titulo: 'Desarrollador Frontend Svelte',
      empresa: 'Tech Solutions',
      ubicacion: 'San Salvador',
      fecha: 'Hace 2 días',
      salario: '$750',
      tipo: 'Remoto',
      logo: '/img/logo.png'
    },
    {
      id: 2,
      titulo: 'Soporte Técnico Junior',
      empresa: 'Tech Solutions',
      ubicacion: 'San Salvador',
      fecha: 'Hace 4 días',
      salario: '$500',
      tipo: 'Presencial',
      logo: '/img/logo.png'
    },
    {
      id: 3,
      titulo: 'Diseñador UI Junior',
      empresa: 'Creative Studio',
      ubicacion: 'Santa Ana',
      fecha: 'Hace 1 semana',
      salario: '$600',
      tipo: 'Híbrido',
      logo: '/img/logo.png'
    }
  ];

  const categorias = [
    {
      nombre: 'Tecnología',
      puestos: 120,
      icono: 'bi-display'
    },
    {
      nombre: 'Marketing',
      puestos: 80,
      icono: 'bi-megaphone'
    },
    {
      nombre: 'Finanzas',
      puestos: 65,
      icono: 'bi-cash-stack'
    },
    {
      nombre: 'Diseño',
      puestos: 45,
      icono: 'bi-palette'
    },
    {
      nombre: 'Ventas',
      puestos: 90,
      icono: 'bi-cart4'
    },
    {
      nombre: 'Atención al Cliente',
      puestos: 70,
      icono: 'bi-headset'
    }
  ];

  const empresas = [
    {
      id: 1,
      nombre: 'Tech Solutions',
      logo: '/img/logo.png'
    },
    {
      id: 2,
      nombre: 'Creative Studio',
      logo: '/img/logo.png'
    },
    {
      id: 3,
      nombre: 'Data Insights',
      logo: '/img/logo.png'
    },
    {
      id: 4,
      nombre: 'NetSupport El Salvador',
      logo: '/img/logo.png'
    },
    {
      id: 5,
      nombre: 'MarketPlus Agency',
      logo: '/img/logo.png'
    },
    {
      id: 6,
      nombre: 'Backend Labs',
      logo: '/img/logo.png'
    },
    {
      id: 7,
      nombre: 'Creative Branding',
      logo: '/img/logo.png'
    },
    {
      id: 8,
      nombre: 'Support Center',
      logo: '/img/logo.png'
    }
  ];

  const valoraciones = [
    {
      puesto: 'Desarrolladora Web',
      empresa: 'Tech Solutions',
      ubicacion: 'San Salvador',
      fecha: 'Hace 3 días',
      calificacion: 5,
      experiencia: 'Positiva',
      comentario:
        'Excelente ambiente laboral, buena comunicación con el equipo y oportunidades de crecimiento profesional.'
    },
    {
      puesto: 'Diseñador UX/UI',
      empresa: 'Creative Studio',
      ubicacion: 'Santa Ana',
      fecha: 'Hace 1 semana',
      calificacion: 4,
      experiencia: 'Positiva',
      comentario:
        'La empresa permite desarrollar creatividad y participar en proyectos interesantes con clientes reales.'
    },
    {
      puesto: 'Soporte Técnico',
      empresa: 'NetSupport El Salvador',
      ubicacion: 'San Miguel',
      fecha: 'Hace 2 semanas',
      calificacion: 3,
      experiencia: 'Neutral',
      comentario:
        'La experiencia fue buena, aunque el ritmo de trabajo puede ser exigente en ciertos periodos.'
    }
  ];
</script>
<svelte:head>
  <title>Koruve | Inicio</title>
</svelte:head>

<!-- NAVBAR -->
<div class="container">
  <nav class="navbar navbar-expand-lg py-3">
    <div class="container-fluid">
      <a href="/">
        <img src="/img/logo.png" alt="Logo" style="height: 80px; width: 200px;">
      </a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mx-auto fs-6">
          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/empleos">Empleos</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="/empresa">Empresas</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="#">Recursos</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="#">Foro</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="#">Valoraciones</a>
          </li>

          <li class="nav-item mx-3">
            <a class="nav-link active fw-semibold" href="#">Nosotros</a>
          </li>
        </ul>

        <div class="dropdown">
          <button class="btn border-0 d-flex align-items-center gap-2" type="button">
            <span class="fw-semibold">Mi Cuenta</span>
            <i class="bi bi-chevron-down small text-primary"></i>
          </button>
        </div>
      </div>
    </div>
  </nav>
</div>

<!-- HERO / BUSCADOR -->
<section class="hero-card">
  <img src="/img/Hero.png" class="hero-img" alt="Hero">

  <div class="hero-overlay">
    <div class="hero-content">
      <h1 class="text-white fw-bold mb-4">
        Explora Más de <br>
        15,000+ <br>
        Oportunidades <br>
        Laborales
      </h1>

      <p class="text-white mb-4">
        Descubre una plataforma diseñada para quienes buscan con pasión y desean superarse.
        Encuentra tu próxima oportunidad profesional y conéctate con personas afines.
      </p>

      <form class="search-box" on:submit|preventDefault={buscarEmpleos}>
        <div class="d-flex align-items-center px-2 search-input">
          <i class="bi bi-search text-muted me-2"></i>
          <input
            type="text"
            class="form-control border-0"
            placeholder="Buscar"
            bind:value={busqueda}
          >
        </div>

        <div class="vr"></div>

        <div class="d-flex align-items-center px-2 search-input">
          <i class="bi bi-geo-alt text-muted me-2"></i>
          <input
            type="text"
            class="form-control border-0"
            placeholder="Ubicación"
            bind:value={ubicacion}
          >
        </div>

        <button class="btn btn-dark ms-2 px-4" type="submit">
          Buscar
        </button>
      </form>

      <p class="text-white mt-3 small">
        Sugerencias: Digital Marketing, UX Designer, Data Analyst
      </p>
    </div>
  </div>
</section>

<!-- MÉTRICAS -->
<section class="container-fluid section-space" style="background-color:#F8F9FB;">
  <div class="container">
    <div class="row text-center">
      <div class="col-md-4 mb-4 mb-md-0">
        <h2 class="fw-bold mb-3 metrics-number">15,000+</h2>
        <p class="text-muted mb-0 metrics-text">
          Oportunidades laborales publicadas
        </p>
      </div>

      <div class="col-md-4 mb-4 mb-md-0">
        <h2 class="fw-bold mb-3 metrics-number">300+</h2>
        <p class="text-muted mb-0 metrics-text">
          Empresas registradas en la plataforma
        </p>
      </div>

      <div class="col-md-4">
        <h2 class="fw-bold mb-3 metrics-number">5,000+</h2>
        <p class="text-muted mb-0 metrics-text">
          Candidatos activos buscando empleo
        </p>
      </div>
    </div>
  </div>
</section>

<!-- EMPLEOS DESTACADOS -->
<section class="container section-space">
  <div class="text-center mb-5">
    <h2 class="fw-bold">Empleos Destacados</h2>
    <p class="text-muted small mb-0">
      Conoce tu valor y encuentra el trabajo que califique con tu perfil
    </p>
  </div>

  <div class="table-responsive">
    <table class="table align-middle bg-white shadow-sm rounded overflow-hidden">
      <tbody>
        {#each empleosDestacados as empleo}
          <tr class="job-row">
            <td class="py-4">
              <div class="d-flex align-items-center gap-3">
                <img src={empleo.logo} alt={empleo.empresa} class="rounded" width="55" height="55">

                <div>
                  <h6 class="mb-2 fw-bold">{empleo.titulo}</h6>

                  <div class="d-flex flex-wrap gap-3 text-muted small">
                    <span>
                      <i class="bi bi-suitcase-lg"></i>
                      {empleo.empresa}
                    </span>

                    <span>
                      <i class="bi bi-geo-alt"></i>
                      {empleo.ubicacion}
                    </span>

                    <span>
                      <i class="bi bi-clock"></i>
                      {empleo.fecha}
                    </span>

                    <span>
                      <i class="bi bi-cash"></i>
                      {empleo.salario}
                    </span>

                    <span class="badge rounded-pill text-primary bg-primary-subtle fw-normal px-3 py-2">
                      {empleo.tipo}
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <td class="text-end py-4">
              <a
                href={`/empleos/${empleo.id}`}
                class="btn px-4 py-2 text-white btn-hover-dark"
                style="background-color:#2C3B4E;"
              >
                Ver detalle
              </a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<!-- CATEGORÍAS -->
<section class="container-fluid section-space" style="background-color:#F5F3EF;">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="fw-bold">Categorías de Empleo Populares</h2>
      <p class="text-muted small">
        Explora oportunidades según tu área profesional
      </p>
    </div>

    <div class="row g-4">
      {#each categorias as categoria}
        <div class="col-md-4">
          <div class="card border rounded-3 p-4 h-100 bg-white card-hover icon-hover">
            <div class="d-flex align-items-center gap-3">
              <div
                class="rounded-circle d-flex align-items-center justify-content-center"
                style="width:70px; height:70px; background-color:#F4E3D3;"
              >
                <i class={`bi ${categoria.icono} fs-2`} style="color:#A35D3D;"></i>
              </div>

              <div>
                <h6 class="mb-1 fw-semibold">{categoria.nombre}</h6>
                <small class="text-muted">{categoria.puestos} puestos disponibles</small>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- EMPRESAS PRINCIPALES -->
<section class="container section-space">
  <div class="text-center mb-5">
    <h2 class="fw-bold">Principales Empresas Registradas</h2>
    <p class="text-muted">
      Algunas de las empresas a las que hemos ayudado a reclutar excelentes candidatos a lo largo de los años
    </p>
  </div>

  <div class="row justify-content-center g-4">
    {#each empresas as empresa}
      <div class="col-md-3">
        <a href={`/empresa/${empresa.id}`} class="text-decoration-none text-dark">
          <div
            class="card border text-center p-4 py-5 rounded-3 company-card shadow-sm"
            style="height:190px; background-color:#F7F5F2;"
          >
            <div class="d-flex justify-content-center mb-4">
              <div class="rounded-circle d-flex align-items-center justify-content-center overflow-hidden company-logo-circle">
                <img
                  src={empresa.logo}
                  alt={empresa.nombre}
                  style="width:80%; height:80%; object-fit:contain;"
                >
              </div>
            </div>

            <h6 class="mb-0 fw-semibold">{empresa.nombre}</h6>
          </div>
        </a>
      </div>
    {/each}
  </div>
</section>

<!-- VALORACIONES -->
<section class="container section-space">
  <div class="text-center mb-5">
    <h2 class="fw-bold">Valoraciones de las empresas</h2>
    <p class="text-muted">
      Conoce la experiencia de quienes han trabajado en diferentes empresas
    </p>
  </div>

  {#each valoraciones as valoracion}
    <div class="card border-0 shadow-sm p-4 mb-4 review-card">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div class="d-flex gap-3">
          <img src="/img/perfil.png" alt="Perfil" class="review-avatar">

          <div>
            <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
              <h6 class="fw-bold mb-0">{valoracion.puesto}</h6>

              <span class="badge rounded-pill badge-soft-warning">
                <i class="bi bi-star-fill"></i>
                {valoracion.calificacion}
              </span>

              <span class="badge rounded-pill bg-success-subtle text-success">
                {valoracion.experiencia}
              </span>
            </div>

            <p class="text-muted small mb-2">
              {valoracion.empresa} · {valoracion.ubicacion} · {valoracion.fecha}
            </p>

            <p class="mb-3">
              {valoracion.comentario}
            </p>

            <button type="button" class="badge rounded-pill px-3 py-2 badge-like border-0">
              <i class="bi bi-hand-thumbs-up-fill"></i>
              12 útil
            </button>
          </div>
        </div>

        <div>
          <a href="/empresa" class="btn text-white btn-hover-dark" style="background-color:#2C3B4E;">
            Ver empresa
          </a>
        </div>
      </div>
    </div>
  {/each}
</section>

<!-- RECURSOS Y CONSEJOS -->
<section class="container section-space">
  <div class="text-center mb-5">
    <h2 class="fw-bold">Recursos y Consejos Profesionales</h2>
    <p class="text-muted mb-0">
      Mejora tu perfil y prepárate para el mundo laboral
    </p>
  </div>

  <div class="row g-4">
    <div class="col-md-4">
      <div class="card border-0 h-100 news-card">
        <img src="/img/ventas.jpg" class="card-img-top rounded news-img" alt="Ventas">

        <div class="card-body px-0">
          <p class="text-muted small mb-3">
            31 de agosto, 2021 &nbsp; • &nbsp; 12 comentarios
          </p>

          <h5 class="card-title fw-semibold">
            Cómo atraer ventas y aumentar ganancias
          </h5>

          <p class="card-text text-muted">
            Descubre estrategias prácticas para mejorar tus resultados comerciales y fortalecer tu perfil profesional.
          </p>

          <a
            href="https://www.teamleader.eu/es/blog/tecnicas-de-ventas"
            target="_blank"
            rel="noopener noreferrer"
            class="btn p-0 border-0 text-danger"
          >
            Leer más <i class="bi bi-chevron-right ms-1"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card border-0 h-100 news-card">
        <img src="/img/entrevista.jpg" class="card-img-top rounded news-img" alt="Entrevista">

        <div class="card-body px-0">
          <p class="text-muted small mb-3">
            31 de agosto, 2021 &nbsp; • &nbsp; 12 comentarios
          </p>

          <h5 class="card-title fw-semibold">
            Consejos para tus entrevistas de trabajo
          </h5>

          <p class="card-text text-muted">
            Aprende a prepararte mejor, responder con seguridad y destacar frente a otros candidatos.
          </p>

          <a
            href="https://jovensalud.net/informate-ya/blog/guia-entrevista-trabajo"
            target="_blank"
            rel="noopener noreferrer"
            class="btn p-0 border-0 text-danger"
          >
            Leer más <i class="bi bi-chevron-right ms-1"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card border-0 h-100 news-card">
        <img src="/img/cv.webp" class="card-img-top rounded news-img" alt="Currículum">

        <div class="card-body px-0">
          <p class="text-muted small mb-3">
            31 de agosto, 2021 &nbsp; • &nbsp; 12 comentarios
          </p>

          <h5 class="card-title fw-semibold">
            Cómo mejorar tu currículum y destacar
          </h5>

          <p class="card-text text-muted">
            Conoce recomendaciones clave para construir un CV más atractivo y profesional.
          </p>

          <a
            href="https://www.ucam.edu/executiveonline/blog/8-consejos-para-mejorar-tu-curriculum-vitae/"
            target="_blank"
            rel="noopener noreferrer"
            class="btn p-0 border-0 text-danger"
          >
            Leer más <i class="bi bi-chevron-right ms-1"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="text-white py-5" style="background-color:#2C3B4E;">
  <div class="container">
    <div class="row gy-4">
      <div class="col-md-4">
        <h2 class="fw-bold mb-2">Koruve</h2>
        <p class="mb-0">Llama ahora: +503 77458990</p>
      </div>

      <div class="col-6 col-md-2">
        <h5 class="fw-semibold mb-3">Empresa</h5>

        <ul class="list-unstyled">
          <li class="mb-2">
            <a href="#" class="text-white text-decoration-none">Sobre nosotros</a>
          </li>

          <li class="mb-2">
            <a href="#" class="text-white text-decoration-none">Contáctanos</a>
          </li>

          <li>
            <a href="/empleos" class="text-white text-decoration-none">Empleos</a>
          </li>
        </ul>
      </div>

      <div class="col-6 col-md-2">
        <h5 class="fw-semibold mb-3">Servicios</h5>

        <ul class="list-unstyled">
          <li class="mb-2">
            <a href="#" class="text-white text-decoration-none">Finanzas</a>
          </li>

          <li class="mb-2">
            <a href="#" class="text-white text-decoration-none">Marketing</a>
          </li>

          <li>
            <a href="#" class="text-white text-decoration-none">Diseño</a>
          </li>
        </ul>
      </div>

      <div class="col-6 col-md-3">
        <h5 class="fw-semibold mb-3">Legal</h5>

        <ul class="list-unstyled">
          <li class="mb-2">
            <a href="#" class="text-white text-decoration-none">Política de Privacidad</a>
          </li>

          <li>
            <a href="#" class="text-white text-decoration-none">Términos y condiciones</a>
          </li>
        </ul>
      </div>
    </div>

    <hr class="border-light my-4">

    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
      <p class="mb-3 mb-md-0">
        © 2026 Copyright, All Right
      </p>

      <div class="d-flex gap-3 fs-5">
        <a href="#" class="text-white"><i class="bi bi-twitter"></i></a>
        <a href="#" class="text-white"><i class="bi bi-facebook"></i></a>
        <a href="#" class="text-white"><i class="bi bi-instagram"></i></a>
        <a href="#" class="text-white"><i class="bi bi-linkedin"></i></a>
      </div>
    </div>
  </div>
</footer>

<style>
  :global(body) {
    background-color: #ffffff;
    font-size: 14px;
  }

  .section-space {
    padding-top: 70px;
    padding-bottom: 70px;
  }

  .hero-card {
    position: relative;
    width: 100%;
    min-height: 620px;
    overflow: hidden;
  }

  .hero-img {
    width: 100%;
    min-height: 620px;
    object-fit: cover;
    display: block;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .hero-content {
    width: 50%;
    margin-left: 3rem;
  }

  h1 {
    font-size: 3.5rem;
    line-height: 1.2;
  }

  .search-box {
    background-color: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    padding: 8px;
    max-width: 600px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .search-input {
    width: 50%;
  }

  .search-input input:focus {
    box-shadow: none;
  }

  .card-hover,
  .company-card,
  .review-card,
  .news-card {
    transition: all 0.35s ease;
  }

  .card-hover:hover,
  .company-card:hover,
  .review-card:hover,
  .news-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.10) !important;
  }

  .job-row {
    transition: all 0.3s ease;
  }

  .job-row:hover {
    transform: scale(1.01);
    box-shadow: inset 0 0 0 9999px rgba(44, 59, 78, 0.03);
  }

  .icon-hover i {
    transition: transform 0.3s ease;
  }

  .icon-hover:hover i {
    transform: scale(1.18);
  }

  .btn-hover-dark {
    transition: all 0.3s ease;
  }

  .btn-hover-dark:hover {
    background-color: #1f2937 !important;
    transform: translateY(-2px);
  }

  .news-img {
    height: 250px;
    object-fit: cover;
  }

  .review-avatar {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 50%;
  }

  .company-logo-circle {
    width: 68px;
    height: 68px;
    background-color: #fff;
  }

  .metrics-number {
    font-size: 3rem;
    color: #222c59;
  }

  .metrics-text {
    font-size: 1.2rem;
  }

  .badge-soft-warning {
    background-color: #fff3cd;
    color: #856404;
  }

  .badge-like {
    background-color: #f3f4f6;
    color: #374151;
  }

  @media (max-width: 992px) {
    .hero-content {
      width: 75%;
    }
  }

  @media (max-width: 768px) {
    .hero-content {
      width: 90%;
      margin-left: 1rem;
      margin-right: 1rem;
    }

    h1 {
      font-size: 2.4rem;
    }

    .search-box {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .search-input {
      width: 100%;
    }

    .vr {
      display: none;
    }

    .search-box button {
      margin-left: 0 !important;
      width: 100%;
    }
  }
</style>