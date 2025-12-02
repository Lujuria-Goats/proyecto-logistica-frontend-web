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

      <!-- INPUTS -->
      <div class="form-group">
        <label>Correo Electrónico</label>
        <input
          v-model="email"
          type="email"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <input
          v-model="password"
          type="password"
          placeholder="********"
        />
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
      loading: false,
      apiUrl: "http://localhost:5132/api/Auth/login",

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
       LOGIN
    --------------------------------*/
    async loginUser() {
      if (!this.email || !this.password) {
        this.showNotification("Llena todos los campos.", "error");
        return;
      }

      this.loading = true; // 🔥 Activar spinner

      try {
        const res = await fetch(this.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });

        let errorData = null;
        if (!res.ok) {
          errorData = await res.json().catch(() => null);
          console.error("Error Login:", errorData);

          this.loading = false;  
          this.showNotification("Correo o contraseña incorrectos.", "error");
          return;
        }

        const data = await res.json();
        console.log("Respuesta login:", data);

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        this.showNotification("Inicio de sesión exitoso ✔", "success");

        setTimeout(() => {
          this.$router.push("/admin/dashboard");
        }, 900);

      } catch (error) {
        console.error("Error general de conexión:", error);
        this.showNotification("No se pudo conectar con el servidor.", "error");
      } finally {
        this.loading = false; // 🔥 Apagar spinner siempre
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
}

input:focus {
  outline: none;
  border-color: var(--gold);
}

/* BOTÓN LOGIN */
.btn-login {
  margin-top: 10px;
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
