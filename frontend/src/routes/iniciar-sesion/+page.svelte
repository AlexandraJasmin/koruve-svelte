<script>
    import { goto } from "$app/navigation";
    import { loginUsuario, loginEmpresa } from "$lib/services/authService.js";
    import { guardarSesion } from "$lib/stores/authStore.js";

    let correo = $state("");
    let password = $state("");
    let tipoCuenta = $state("usuario");

    let mostrarPassword = $state(false);
    let recordarme = $state(false);
    let cargando = $state(false);
    let error = $state("");
    let mensaje = $state("");

    async function iniciarSesion() {
        error = "";
        mensaje = "";
        cargando = true;

        try {
            const credenciales = {
                correo,
                password,
            };

            const data =
                tipoCuenta === "usuario"
                    ? await loginUsuario(credenciales)
                    : await loginEmpresa(credenciales);

            guardarSesion(data);

            mensaje =
                tipoCuenta === "usuario"
                    ? "Inicio de sesión como candidato correcto"
                    : "Inicio de sesión como empresa correcto";

            /*
        IMPORTANTE:
        Como todavía no quieres crear /usuario/dashboard ni /empresa/dashboard,
        por ahora redirigimos al inicio.
        Después, cuando tus compañeras hagan los dashboards, cambiamos esto.
      */

            setTimeout(() => {
                if (data.tipoCuenta === "usuario") {
                    goto("/usuario/dashboard");
                }

                if (data.tipoCuenta === "empresa") {
                    goto("/empresa/dashboard");
                }
            }, 700);

            /*
        Cuando ya existan los dashboards, reemplazas lo de arriba por esto:

        if (data.tipoCuenta === 'usuario') {
          goto('/usuario/dashboard');
        }

        if (data.tipoCuenta === 'empresa') {
          goto('/empresa/dashboard');
        }
      */
        } catch (err) {
            error = err.message;
        } finally {
            cargando = false;
        }
    }
</script>

<section class="auth-section">
    <div class="auth-heading">
        <h1>Inicia sesión en tu cuenta</h1>
        <p>¡Bienvenido de nuevo! Ingresa tus datos para acceder a tu cuenta</p>
    </div>

    <form class="auth-card login-card" onsubmit={iniciarSesion}>
        <a href="/" class="close-button">×</a>

        <div class="account-tabs login-tabs">
            <button
                type="button"
                class:active={tipoCuenta === "usuario"}
                onclick={() => (tipoCuenta = "usuario")}
            >
                Candidato
            </button>

            <button
                type="button"
                class:active={tipoCuenta === "empresa"}
                onclick={() => (tipoCuenta = "empresa")}
            >
                Empresa
            </button>
        </div>

        <label for="correo">Correo electrónico</label>
        <input
            id="correo"
            type="email"
            bind:value={correo}
            placeholder="Ingresa tu correo electrónico"
            required
        />

        <label for="password">Contraseña</label>
        <div class="password-wrapper">
            <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                bind:value={password}
                placeholder="Ingresa tu contraseña"
                required
            />

            <button
                type="button"
                onclick={() => (mostrarPassword = !mostrarPassword)}
            >
                👁
            </button>
        </div>

        <div class="form-row">
            <label class="checkbox-label">
                <input type="checkbox" bind:checked={recordarme} />
                Recordarme
            </label>

            <a href="/nueva-contrasena">¿Olvidaste tu contraseña?</a>
        </div>

        {#if error}
            <p class="error-message">{error}</p>
        {/if}

        {#if mensaje}
            <p class="success-message">{mensaje}</p>
        {/if}

        <button class="submit-button" type="submit" disabled={cargando}>
            {cargando ? "Iniciando..." : "Iniciar sesión"}
        </button>

        <div class="divider">
            <span></span>
            <p>o inicia sesión con</p>
            <span></span>
        </div>

        <button class="google-button" type="button">
            <strong>G</strong>
            Continuar con Google
        </button>

        <p class="bottom-text">
            ¿No tienes una cuenta?
            <a href="/registro">Regístrate</a>
        </p>
    </form>
</section>
