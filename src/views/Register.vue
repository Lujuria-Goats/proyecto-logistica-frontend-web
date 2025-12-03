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

        <!-- GLOBAL NOTIFICATION -->
        <div
          v-if="notification.visible"
          class="notification"
          :class="notification.type"
          role="alert"
          aria-live="polite"
        >
          {{ notification.message }}
        </div>

        <label class="input-label">Nombre Completo</label>
        <input
          v-model="form.fullName"
          type="text"
          class="input"
          :class="{ 'input-error': errors.fullName }"
          placeholder="Juan Pérez"
          required
        />
        <span v-if="errors.fullName" class="error-text">{{ errors.fullName }}</span>

        <label class="input-label">Correo Electrónico</label>
        <input
          v-model="form.email"
          type="email"
          class="input"
          :class="{ 'input-error': errors.email }"
          placeholder="correo@ejemplo.com"
          required
        />
        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>

        <!-- CONTRASEÑA CON OJITO -->
        <label class="input-label">Contraseña</label>
        <div class="password-wrapper">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="input input-pass"
            :class="{ 'input-error': errors.password }"
            placeholder="••••••••"
            required
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

        <div class="password-rules">
          <p :class="{ ok: passwordLength }">Mínimo 8 caracteres</p>
          <p :class="{ ok: passwordUpper }">Al menos una mayúscula</p>
          <p :class="{ ok: passwordNumber }">Al menos un número</p>
          <p :class="{ ok: passwordSpecial }">Al menos un carácter especial ($ o &amp;)</p>
        </div>
        <span v-if="errors.password" class="error-text">{{ errors.password }}</span>

        <!-- CAMPO phoneNumber -->
        <label class="input-label">Número Telefónico</label>
        <input
          v-model="form.phoneNumber"
          type="text"
          maxlength="10"
          class="input"
          :class="{ 'input-error': errors.phoneNumber }"
          placeholder="3000000000"
          @input="validatePhone"
          required
        />
        <p class="phone-hint" :class="{ ok: phoneValid }">
          {{ form.phoneNumber.length }}/10 dígitos
        </p>
        <span v-if="errors.phoneNumber" class="error-text">{{ errors.phoneNumber }}</span>

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

        <button
          type="submit"
          class="btn-register"
          :disabled="isLoading || !canSubmit"
        >
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? "Registrando..." : "Registrarme" }}
        </button>

        <!-- LINK LOGIN -->
        <div class="login-link">
          ¿Ya tienes cuenta? 
          <router-link to="/login">Inicia sesión</router-link>
        </div>

      </form>

    </div>
  </div>
</template>

<script>
import { registerUser } from "../api/authApi.js";

export default {
  name: "Register",
  data() {
    return {
      form: {
        fullName: "",
        email: "",
        password: "",
        role: "Driver",
        phoneNumber: ""
      },
      showPassword: false, // Control del ojito
      isLoading: false,
      errors: {
        fullName: "",
        email: "",
        password: "",
        phoneNumber: ""
      }
      ,
      notification: {
        message: "",
        type: "", // 'success' | 'error' | 'info'
        visible: false
      },
      notificationTimer: null
    };
  },

  computed: {
    themeClass() {
      return this.form.role === "Admin" ? "theme-dark" : "theme-light";
    },

    /* ===== VALIDACIONES DINÁMICAS ===== */
    passwordLength() {
      return this.form.password.length >= 8;
    },
    passwordUpper() {
      return /[A-Z]/.test(this.form.password);
    },
    passwordSpecial() {
      return /[$&]/.test(this.form.password);
    },
    passwordNumber() {
      return /\d/.test(this.form.password);
    },
    passwordValid() {
      return this.passwordLength && this.passwordUpper && this.passwordNumber && this.passwordSpecial;
    },

    phoneValid() {
      return /^\d{10}$/.test(this.form.phoneNumber);
    },

    canSubmit() {
      return (
        this.form.fullName.trim() &&
        this.form.email.trim() &&
        this.passwordValid &&
        this.phoneValid
      );
    }
  },

  mounted() {
    this.initAnimatedBG();
  },

  methods: {
    toggleRole() {
      this.form.role = this.form.role === "Driver" ? "Admin" : "Driver";
    },

    validatePhone() {
      this.form.phoneNumber = this.form.phoneNumber.replace(/\D/g, "");
    },

    showNotification(message, type = 'error') {
      if (this.notificationTimer) {
        clearTimeout(this.notificationTimer);
        this.notificationTimer = null;
      }

      this.notification.message = message;
      this.notification.type = type;
      this.notification.visible = true;

      this.notificationTimer = setTimeout(() => {
        this.notification.visible = false;
        this.notification.message = "";
        this.notification.type = "";
        this.notificationTimer = null;
      }, 5000);
    },

    validateForm() {
      this.errors = {
        fullName: "",
        email: "",
        password: "",
        phoneNumber: ""
      };

      let isValid = true;

      if (!this.form.fullName.trim()) {
        this.errors.fullName = "El nombre completo es requerido.";
        isValid = false;
      }

      if (!this.form.email.trim()) {
        this.errors.email = "El correo electrónico es requerido.";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = "El correo electrónico no es válido.";
        isValid = false;
      }

      if (!this.passwordValid) {
        this.errors.password = "La contraseña no cumple los requisitos.";
        isValid = false;
      }

      if (!this.phoneValid) {
        this.errors.phoneNumber = "El teléfono debe tener exactamente 10 dígitos.";
        isValid = false;
      }

      return isValid;
    },

    async submitForm() {
      if (!this.validateForm()) {
        this.showNotification("Por favor, completa correctamente todos los campos.", "error");
        return;
      }

      this.isLoading = true;

      try {
        const response = await registerUser(this.form);

        this.showNotification("✅ Usuario registrado correctamente. Redirigiendo a login...", "success");
        setTimeout(() => {
          this.$router.push("/login");
        }, 5000);

      } catch (error) {
        this.showNotification("❌ " + (error.message || "Error de conexión con el servidor"), "error");
        console.error("Registration error:", error);
      } finally {
        this.isLoading = false;
      }
    },

    /* =============================
       ANIMACIÓN DE FONDO
    ==============================*/
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
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary); /* Se adapta al tema (oscuro/claro) */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-pass-btn:hover {
  color: #D4AF37;
}

/* ==========================
   PASSWORD RULES (COMPACT)
 ===========================*/
.password-rules {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  align-items: center;
  z-index: 3;
}
.password-rules p {
  margin: 0;
  padding: 4px 7px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--rule-invalid-color);
  background: transparent;
  transition: color 0.15s ease, transform 0.12s ease, background 0.15s ease;
}
.password-rules p::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.password-rules p.ok {
  color: var(--rule-valid-color);
  transform: translateY(-1px);
}

/* PHONE HINT */
.phone-hint {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: right;
  margin-top: 4px;
  transition: color 0.3s;
}
.phone-hint.ok {
  color: var(--rule-valid-color);
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

/* LOGIN LINK */
.login-link {
  margin-top: 24px;
  font-size: 0.95rem;
  text-align: center;
  color: var(--text-secondary);
}
.login-link a {
  color: #D4AF37;
  font-weight: 700;
  text-decoration: none;
  margin-left: 5px;
}
.login-link a:hover {
  text-decoration: underline;
}

/* TEMAS */
.theme-dark {
  --card-bg: #1A1A1A;
  --text-primary: #F5F5F5;
  --text-secondary: #A0A0A0;
  --input-bg: #0F0F0F;
  --input-border: #333;
  --rule-invalid-color: #ff6b6b;
  --rule-valid-color: #4CAF50;
  background: #0F0F0F;
  color: #F5F5F5;
}

.theme-light {
  --card-bg: #FAFAFA;
  --text-primary: #202020;
  --text-secondary: #555;
  --input-bg: #F0F0F0;
  --input-border: #DDD;
  --rule-invalid-color: #E53935;
  --rule-valid-color: #4CAF50;
  background: #F5F5F5;
  color: #202020;
}

/* ERROR STYLES */
.error-text {
  display: block;
  color: #E53935;
  font-size: 12px;
  margin-top: 3px;
  margin-bottom: 8px;
  font-weight: 500;
}

/* GLOBAL NOTIFICATION */
.notification {
  width: 100%;
  padding: 10px 14px;
  color: #fff;
  border-radius: 10px;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 13px;
  display: block;
  text-align: center;
  z-index: 3;
}
.notification.error {
  background: linear-gradient(90deg, rgba(229,57,53,1) 0%, rgba(211,47,47,1) 100%);
}
.notification.success {
  background: linear-gradient(90deg, #4caf50 0%, #43a047 100%);
  color: #fff;
}
.notification.info {
  background: linear-gradient(90deg, #2196f3 0%, #1976d2 100%);
}

.input-error {
  border-color: #E53935 !important;
  box-shadow: 0 0 8px rgba(229, 57, 53, 0.3) !important;
}

.input-error:focus {
  border-color: #E53935 !important;
  box-shadow: 0 0 8px rgba(229, 57, 53, 0.4) !important;
}

/* BUTTON DISABLED STATE */
.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-register:disabled:hover {
  transform: none;
}

/* SPINNER */
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
  to { transform: rotate(360deg); }
}
</style>