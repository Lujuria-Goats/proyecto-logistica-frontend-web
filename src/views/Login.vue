<template>
  <div class="login-container">

    <!-- FONDO ANIMADO -->
    <canvas id="canvas-bg"></canvas>

    <!-- BOTÓN VOLVER -->
    <button class="btn-back" @click="$router.push('/')">
      ⬅ Volver
    </button>

    <div class="card">
      <h2 class="title">Iniciar Sesión</h2>
      <p class="subtitle">Accede a Apex Vision y continúa tu operación.</p>

      <!-- INPUT CORREO -->
      <div class="form-group">
        <label>Correo Electrónico</label>
        <input
          v-model="email"
          type="email"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <!-- INPUT CONTRASEÑA CON OJITO -->
      <div class="form-group">
        <label>Contraseña</label>
        <div class="password-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="********"
            class="input-pass"
          />
          <button 
            type="button" 
            class="toggle-pass-btn" 
            @click="showPassword = !showPassword"
            tabindex="-1"
          >
            <!-- ÍCONO OJO CERRADO (Mostrar contraseña) -->
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            
            <!-- ÍCONO OJO ABIERTO (Ocultar contraseña) -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>

      <!-- LINK OLVIDASTE CONTRASEÑA -->
      <div class="forgot-pass">
        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>

      <!-- NOTIFICACIÓN -->
      <div
        v-if="notification.visible"
        :class="['notification', notification.type]"
      >
        {{ notification.message }}
      </div>

      <!-- BOTÓN LOGIN -->
      <button class="btn-login" @click="loginUser" :disabled="loading">
        <span v-if="!loading">Ingresar</span>
        <span v-else class="spinner"></span>
      </button>

      <!-- LINK REGISTRO -->
      <div class="register-link">
        ¿No tienes cuenta? 
        <router-link to="/register">Regístrate</router-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false, // Variable para controlar el ojito
      loading: false,
      apiUrl: "https://service.lujuria.crudzaso.com/api/Auth/login",

      notification: {
        visible: false,
        message: "",
        type: "success",
        timer: null,
      },
    };
  },

  mounted() {
    this.initAnimatedBG();
  },

  methods: {
    /* ------------------------------
       NOTIFICACIONES
    --------------------------------*/
    showNotification(message, type = "success") {
      if (this.notification.timer) clearTimeout(this.notification.timer);

      this.notification = {
        visible: true,
        message,
        type,
        timer: setTimeout(() => {
          this.notification.visible = false;
        }, 3500),
      };
    },

    /* ------------------------------
       ANIMACIÓN FONDO
    --------------------------------*/
    initAnimatedBG() {
      const canvas = document.getElementById("canvas-bg");
      const ctx = canvas.getContext("2d");

      let w, h;
      const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener("resize", resize);

      const numDots = 90;
      const dots = [];

      class Dot {
        constructor() {
          this.x = Math.random() * w;
          this.y = Math.random() * h;
          this.r = Math.random() * 2 + 1;
          this.dx = (Math.random() - 0.5) * 0.7;
          this.dy = (Math.random() - 0.5) * 0.7;
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.fill();
        }
        move() {
          if (this.x < 0 || this.x > w) this.dx *= -1;
          if (this.y < 0 || this.y > h) this.dy *= -1;
          this.x += this.dx;
          this.y += this.dy;
        }
      }

      for (let i = 0; i < numDots; i++) dots.push(new Dot());

      const animate = () => {
        ctx.clearRect(0, 0, w, h);
        dots.forEach((d) => {
          d.move();
          d.draw();
        });
        requestAnimationFrame(animate);
      };

      animate();
    },

    /* ------------------------------
       DECODIFICAR TOKEN JWT
    --------------------------------*/
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

    /* ------------------------------
       LOGIN
    --------------------------------*/
    async loginUser() {
      if (!this.email || !this.password) {
        this.showNotification("Llena todos los campos.", "error");
        return;
      }

      this.loading = true;

      try {
        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        if (!res.ok) {
          this.loading = false;
          this.showNotification("Correo o contraseña incorrectos.", "error");
          return;
        }

        const data = await res.json();

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // 🔥 Decodifica el token
        const decoded = this.decodeToken(data.token);

        if (!decoded || !decoded.role) {
          this.showNotification("Token inválido.", "error");
          return;
        }

        const role = decoded.role;

        this.showNotification("Inicio de sesión exitoso ✔", "success");

        // 🔥 REDIRECCIÓN SEGÚN ROL
        setTimeout(() => {
          if (role === "Admin") {
            this.$router.push("/admin/dashboard");
          } else if (role === "Driver") {
            this.$router.push("/driver/dashboard");
          } else {
            this.showNotification("Rol desconocido.", "error");
          }
        }, 900);

      } catch (error) {
        console.error("Error general:", error);
        this.showNotification("No se pudo conectar con el servidor.", "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
:root {
  --gold: #d4af37;
  --gold-dark: #b8952f;
  --light-gray: #e8e8e8;
  --text-dark: #222;
}

/* CANVAS FONDO */
#canvas-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #000;
}

/* NOTIFICACIONES */
.notification {
  top: 20px;
  right: 20px;
  padding: 14px 20px;
  border-radius: 14px;
  font-weight: 600;
  color: white;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  animation: fadeIn 0.25s ease-out;
}

.notification.success {
  background: #28a745;
}

.notification.error {
  background: #e63946;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* CONTENEDOR */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* BOTÓN VOLVER */
.btn-back {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #000;
  border-radius: 10px;
  border: none;
  background: #fff;
  box-shadow: 0px 0px 3px #D4AF37;
  padding: 8px 12px;
  font-size: 0.95rem;
  cursor: pointer;
  z-index: 2;
}

/* CARD */
.card {
  background: #fff;
  width: 420px;
  padding: 40px 35px;
  border-radius: 20px;
  box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 2;
  text-align: center;
}

/* TITULOS */
.title {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--text-dark);
}

.subtitle {
  margin-bottom: 32px;
  color: #777;
}

/* INPUTS */
.form-group {
  margin-bottom: 20px;
  text-align: left;
}

input {
  width: 100%;
  margin-top: 6px;
  padding: 12px;
  font-size: 1rem;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: var(--light-gray);
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--gold);
}

/* WRAPPER PARA INPUT DE CONTRASEÑA Y OJITO */
.password-wrapper {
  position: relative;
  width: 100%;
}

.input-pass {
  padding-right: 40px; /* Espacio para el ícono */
}

/* BOTÓN OJITO */
.toggle-pass-btn {
  position: absolute;
  right: 12px;
  bottom: 12px; /* Alineado verticalmente considerando el padding del input */
  background: none;
  border: none;
  cursor: pointer;
  color: #777;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-pass-btn:hover {
  color: var(--gold-dark);
}

/* OLVIDASTE CONTRASEÑA */
.forgot-pass {
  text-align: right;
  margin-top: -10px;
  margin-bottom: 20px;
}
.forgot-pass a {
  color: #777;
  font-size: 0.9rem;
  text-decoration: none;
  transition: 0.2s;
}
.forgot-pass a:hover {
  color: #D4AF37;
}

/* BOTÓN LOGIN */
.btn-login {
  margin-top: 0px;
  width: 100%;
  background: #D4AF37;
  color: #000;
  padding: 12px;
  border-radius: 12px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: 0.25s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-login:hover:not(:disabled) {
  background: #e2c770;
  transform: translateY(-2px);
}

/* REGISTRATE */
.register-link {
  margin-top: 24px;
  font-size: 0.95rem;
  color: #666;
}
.register-link a {
  color: #D4AF37;
  font-weight: 700;
  text-decoration: none;
  margin-left: 5px;
}
.register-link a:hover {
  text-decoration: underline;
}

/* 🔥 SPINNER */
.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #000;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>