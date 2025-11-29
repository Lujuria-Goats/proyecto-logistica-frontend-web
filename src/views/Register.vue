<template>
  <div
    class="register-page"
    :class="themeClass"
  >

    <!-- FONDO ANIMADO -->
    <canvas id="canvas-bg"></canvas>

    <!-- BOTÓN VOLVER -->
    <button class="btn-back" @click="$router.push('/')">
      ⬅  Volver
    </button>

    <div class="register-card fade-in-up">

      <!-- TÍTULO -->
      <h2 class="title">Crear cuenta</h2>
      <p class="subtitle">Únete a Apex Vision y optimiza tu operación.</p>

      <form @submit.prevent="submitForm">

        <label class="input-label">Nombre Completo</label>
        <input
          v-model="form.fullName"
          type="text"
          class="input"
          placeholder="Juan Pérez"
          required
        />

        <label class="input-label">Correo Electrónico</label>
        <input
          v-model="form.email"
          type="email"
          class="input"
          placeholder="correo@ejemplo.com"
          required
        />

        <label class="input-label">Contraseña</label>
        <input
          v-model="form.password"
          type="password"
          class="input"
          placeholder="••••••••"
          required
        />

        <div class="role-container">
          <span :class="['role-text', form.role === 'Driver' ? 'active-text' : '']">
            Transportador
          </span>

          <div class="role-switch" @click="toggleRole">
            <div class="switch-handle" :class="{ right: form.role === 'Admin' }"></div>
          </div>

          <span :class="['role-text', form.role === 'Admin' ? 'active-text' : '']">
            Administrador
          </span>
        </div>

        <button type="submit" class="btn-register">Registrarme</button>

      </form>

    </div>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      form: {
        fullName: "",
        email: "",
        password: "",
        role: "Driver"
      }
    };
  },
  computed: {
    themeClass() {
      return this.form.role === "Admin" ? "theme-dark" : "theme-light";
    }
  },

  mounted() {
    this.initAnimatedBG();
  },

  methods: {
    toggleRole() {
      this.form.role = this.form.role === "Driver" ? "Admin" : "Driver";
    },

    submitForm() {
      console.log("Formulario listo para enviar:", this.form);
      alert("Registro enviado (simulado)");
    },

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

      function animate() {
        ctx.clearRect(0, 0, w, h);
        dots.forEach((d) => {
          d.move();
          d.draw();
        });
        requestAnimationFrame(animate);
      }

      animate();
    }
  }
};
</script>

<style scoped>
/* ===== CANVAS DE FONDO ===== */
#canvas-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #000;
}

/* ===== BOTÓN VOLVER ===== */
.btn-back {
  position: absolute;
  top: 25px;
  left: 25px;
  background: #ffffff;
  box-shadow: 0px 0px 3px #D4AF37;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s ease;
  color: #0c0909;
  z-index: 2;
}

.btn-back:hover {
  background: #d4d4d4;
}

/* ======= CONTENEDOR GENERAL ======= */
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.4s ease, color 0.4s ease;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* FADE */
.fade-in-up {
  animation: fadeUp 0.8s ease forwards;
  opacity: 0;
}

@keyframes fadeUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

/* CARD */
.register-card {
  width: 420px;
  padding: 35px;
  border-radius: 22px;
  background: var(--card-bg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  transition: background 0.4s ease, box-shadow 0.4s ease;
  z-index: 2;
}

.title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  margin-bottom: 25px;
  color: var(--text-secondary);
}

.input-label {
  display: block;
  margin-top: 12px;
  margin-bottom: 5px;
  color: var(--text-primary);
  font-size: 14px;
}

.input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
}

/* ROLE SWITCH */
.role-container {
  margin: 25px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.role-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.active-text {
  color: #D4AF37;
  font-weight: 600;
}

.role-switch {
  width: 65px;
  height: 30px;
  border-radius: 20px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  display: flex;
  align-items: center;
  padding: 3px;
  cursor: pointer;
}

.switch-handle {
  width: 24px;
  height: 24px;
  background: #D4AF37;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.switch-handle.right {
  transform: translateX(32px);
}

/* BOTÓN */
.btn-register {
  width: 100%;
  padding: 12px;
  background: #D4AF37;
  color: #000;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  margin-top: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(212,175,55,0.4);
}

/* TEMAS */
.theme-dark {
  --card-bg: #1A1A1A;
  --text-primary: #F5F5F5;
  --text-secondary: #A0A0A0;
  --input-bg: #0F0F0F;
  --input-border: #333;
  background: #0F0F0F;
  color: #F5F5F5;
}

.theme-light {
  --card-bg: #FAFAFA;
  --text-primary: #202020;
  --text-secondary: #555;
  --input-bg: #F0F0F0;
  --input-border: #DDD;
  background: #F5F5F5;
  color: #202020;
}
</style>
