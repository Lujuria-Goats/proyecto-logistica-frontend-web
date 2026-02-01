<template>
  <div class="login-page theme-dark">

    <!-- FONDO ANIMADO -->
    <canvas id="canvas-bg"></canvas>

    <!-- BOTÓN VOLVER -->
    <button class="btn-back" @click="$router.push('/')">
      ⬅ Volver
    </button>

    <div class="login-card fade-in-up">

      <header class="card-header">
        <h2 class="title">Iniciar Sesión</h2>
        <p class="subtitle">Bienvenido de nuevo a Apex Vision.</p>
      </header>

      <form @submit.prevent="loginUser">

        <!-- NOTIFICACIONES -->
        <div v-if="notification.visible" class="notification" :class="notification.type">
          {{ notification.message }}
        </div>

        <!-- INPUT IDENTIFIER (Usuario o Correo) -->
        <div class="form-group">
          <label class="input-label">Usuario o Correo</label>
          <input v-model="identifier" type="text" class="input" :class="{ 'input-error': errors.identifier }"
            placeholder="admin_user o correo@ejemplo.com" required />
        </div>

        <!-- INPUT PASSWORD -->
        <div class="form-group">
          <label class="input-label">Contraseña</label>
          <div class="password-wrapper">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="input input-pass"
              :class="{ 'input-error': errors.password }" placeholder="••••••••" required />
            <button type="button" class="toggle-pass-btn" @click="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? 'BLOQUEAR' : 'VER' }}
            </button>
          </div>
        </div>

        <!-- OLVIDASTE CONTRASEÑA -->
        <div class="forgot-pass">
          <a href="#">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- BOTÓN LOGIN -->
        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? "Autenticando..." : "Ingresar" }}
        </button>

        <!-- LINK REGISTRO -->
        <div class="register-link">
          ¿No tienes cuenta?
          <router-link to="/register">Crear cuenta empresarial</router-link>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      identifier: "", // Cambiado de email a identifier
      password: "",
      showPassword: false,
      isLoading: false,
      errors: {},
      notification: { visible: false, message: "", type: "", timer: null },
    };
  },
  mounted() {
    this.initAnimatedBG();
  },
  methods: {
    // --- NOTIFICACIONES ---
    showNotification(message, type = "success") {
      if (this.notification.timer) clearTimeout(this.notification.timer);
      this.notification = {
        visible: true, message, type,
        timer: setTimeout(() => { this.notification.visible = false; }, 3500),
      };
    },

    // --- DECODIFICAR TOKEN (JWT) ---
    decodeToken(token) {
      try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
      } catch (error) {
        console.error("Error al decodificar token:", error);
        return null;
      }
    },

    // --- PROCESO DE LOGIN ---
    async loginUser() {
      // Limpieza de errores previos
      this.errors = {};

      if (!this.identifier.trim()) this.errors.identifier = true;
      if (!this.password) this.errors.password = true;

      if (this.errors.identifier || this.errors.password) {
        this.showNotification("Por favor completa tus credenciales.", "error");
        return;
      }

      this.isLoading = true;

      try {
        const response = await fetch("https://service.apexvision.crudzaso.com/api/Auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: this.identifier.trim(), // Se envía como "identifier"
            password: this.password
          }),
        });

        if (!response.ok) {
          // Si es 401 o 400, asumimos credenciales inválidas
          if (response.status === 401 || response.status === 400) {
            throw new Error("Usuario o contraseña incorrectos.");
          }
          throw new Error("Error del servidor (" + response.status + ")");
        }

        const data = await response.json();

        // Verificar que venga el token
        if (data.token) {
          // Guardamos SOLO el string del token
          localStorage.setItem("token", data.token);

          // Decodificar para saber el rol
          const decoded = this.decodeToken(data.token);

          if (!decoded || !decoded.role) {
            throw new Error("El token recibido no es válido.");
          }

          this.showNotification("¡Bienvenido! Iniciando sesión...", "success");

          // Redirección basada en Rol
          setTimeout(() => {
            if (decoded.role === "Admin" || decoded.role === "Company") {
              this.$router.push("/admin/dashboard"); // Ajusta tu ruta de admin
            } else if (decoded.role === "Driver") {
              this.$router.push("/driver/dashboard"); // Ajusta tu ruta de driver
            } else {
              this.$router.push("/dashboard"); // Ruta por defecto
            }
          }, 1000);

        } else {
          throw new Error("La respuesta no contiene un token de acceso.");
        }

      } catch (error) {
        console.error(error);
        this.showNotification(error.message, "error");
      } finally {
        this.isLoading = false;
      }
    },

    // --- FONDO ANIMADO (Igual al Register) ---
    initAnimatedBG() {
      const canvas = document.getElementById("canvas-bg");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      let w, h;
      const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
      resize(); window.addEventListener("resize", resize);

      const dots = Array.from({ length: 60 }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5
      }));

      const animate = () => {
        ctx.clearRect(0, 0, w, h); ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        dots.forEach(d => {
          d.x += d.dx; d.y += d.dy; if (d.x < 0 || d.x > w) d.dx *= -1; if (d.y < 0 || d.y > h) d.dy *= -1;
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(animate);
      }; animate();
    }
  },
};
</script>

<style scoped>
/* TEMA OSCURO (Igual que Register.vue) */
.theme-dark {
  --card-bg: #12100d;
  --text-pri: #f5e9c6;
  --text-sec: #b9a56d;
  --input-bg: #050505;
  --accent: #d4af37;
  --err: #ef5350;
  --ok: #66bb6a;
  background: #000;
  color: var(--text-pri);
}

#canvas-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #080808;
}

.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.btn-back {
  position: absolute;
  top: 25px;
  left: 25px;
  background: var(--accent);
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  z-index: 2;
  transition: transform 0.2s;
}

.btn-back:hover {
  transform: scale(1.05);
}

/* TARJETA DE LOGIN (Más angosta que Register) */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 35px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid rgba(212, 175, 55, 0.25);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9);
  z-index: 2;
}

.fade-in-up {
  animation: fadeUp 0.7s ease forwards;
  opacity: 0;
}

@keyframes fadeUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 1.8rem;
  color: var(--accent);
  margin: 0 0 5px 0;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-sec);
  margin: 0;
}

.form-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-sec);
  font-weight: 600;
}

.input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #333;
  background: var(--input-bg);
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border 0.3s, box-shadow 0.3s;
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.2);
}

.input-error {
  border-color: var(--err) !important;
}

/* PASSWORD */
.password-wrapper {
  position: relative;
  width: 100%;
}

.input-pass {
  padding-right: 80px;
}

.toggle-pass-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: bold;
}

.forgot-pass {
  text-align: right;
  margin-top: -10px;
  margin-bottom: 20px;
}

.forgot-pass a {
  font-size: 0.85rem;
  color: #888;
  text-decoration: none;
  transition: 0.2s;
}

.forgot-pass a:hover {
  color: var(--accent);
}

/* BOTÓN */
.btn-login {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(212, 175, 55, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  margin-top: 25px;
  text-align: center;
  font-size: 0.95rem;
  color: #888;
}

.register-link a {
  color: var(--accent);
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
}

/* NOTIFICACIONES */
.notification {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: bold;
}

.notification.error {
  background: rgba(239, 83, 80, 0.15);
  color: #ef5350;
  border: 1px solid var(--err);
}

.notification.success {
  background: rgba(102, 187, 106, 0.15);
  color: #66bb6a;
  border: 1px solid var(--ok);
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 500px) {
  .login-card {
    padding: 30px 20px;
  }
}
</style>