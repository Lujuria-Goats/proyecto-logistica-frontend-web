<template>
  <div class="register-page theme-dark">

    <!-- FONDO ANIMADO -->
    <canvas id="canvas-bg"></canvas>

    <!-- BOTÓN VOLVER -->
    <button class="btn-back" @click="$router.push('/')">
      ⬅ Volver
    </button>

    <div class="register-card fade-in-up">

      <header class="card-header">
        <h2 class="title">Registro Empresarial</h2>
        <p class="subtitle">Crea tu cuenta administrativa en Apex Vision.</p>
      </header>

      <form @submit.prevent="submitForm">

        <!-- NOTIFICACIONES -->
        <div v-if="notification.visible" class="notification" :class="notification.type">
          {{ notification.message }}
        </div>

        <!-- FILA 1: DATOS EMPRESA -->
        <div class="form-row">
          <div class="form-group">
            <label class="input-label">Nombre Empresa</label>
            <input v-model="form.companyName" type="text" class="input" :class="{ 'input-error': errors.companyName }"
              placeholder="Transportes S.A.S" required />
          </div>
          <div class="form-group">
            <label class="input-label">NIT / RUT</label>
            <input v-model="form.companyNit" type="text" class="input" :class="{ 'input-error': errors.companyNit }"
              placeholder="900.123.456-1" required />
          </div>
        </div>

        <!-- FILA 2: DATOS USUARIO -->
        <div class="form-row">
          <div class="form-group">
            <label class="input-label">Usuario (Login)</label>
            <input v-model="form.userName" type="text" class="input" :class="{ 'input-error': errors.userName }"
              placeholder="admin_user" @input="cleanUsernameInput" required />
          </div>
          <div class="form-group">
            <label class="input-label">Nombre Completo</label>
            <input v-model="form.fullName" type="text" class="input" :class="{ 'input-error': errors.fullName }"
              placeholder="Juan Pérez" required />
          </div>
        </div>

        <!-- FILA 3: CONTACTO -->
        <div class="form-row">
          <div class="form-group">
            <label class="input-label">Email Corporativo</label>
            <input v-model="form.email" type="email" class="input" :class="{ 'input-error': errors.email }"
              placeholder="gerencia@empresa.com" required />
          </div>
          <div class="form-group">
            <label class="input-label">Teléfono</label>
            <input v-model="form.phoneNumber" type="text" maxlength="10" class="input"
              :class="{ 'input-error': errors.phoneNumber }" placeholder="3001234567" @input="cleanPhoneInput"
              required />
          </div>
        </div>

        <!-- FILA 4: CONTRASEÑA (Ancho completo para mayor comodidad) -->
        <div class="form-group full-width">
          <label class="input-label">Contraseña</label>
          <div class="password-wrapper">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input input-pass"
              :class="{ 'input-error': errors.password }" placeholder="••••••••" required />
            <button type="button" class="toggle-pass-btn" @click="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? 'BLOQUEAR' : 'VER' }}
            </button>
          </div>

          <!-- Reglas de contraseña -->
          <div class="password-rules-inline">
            <span :class="{ ok: passwordLength }">8+ Caracteres</span>
            <span :class="{ ok: passwordUpper }">Mayúscula</span>
            <span :class="{ ok: passwordNumber }">Número</span>
            <span :class="{ ok: passwordSpecial }">Símbolo</span>
          </div>
        </div>

        <!-- BOTÓN -->
        <button type="submit" class="btn-register" :disabled="isLoading || !canSubmit">
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? "Procesando Registro..." : "Crear Cuenta Empresarial" }}
        </button>

        <div class="login-link">
          ¿Ya tienes cuenta? <router-link to="/login">Iniciar Sesión</router-link>
        </div>

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
        userName: "",
        companyName: "",
        companyNit: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "Admin"
      },
      showPassword: false,
      isLoading: false,
      errors: {},
      notification: { message: "", type: "", visible: false },
      notificationTimer: null
    };
  },
  computed: {
    passwordLength() { return this.form.password.length >= 8; },
    passwordUpper() { return /[A-Z]/.test(this.form.password); },
    passwordSpecial() { return /[$&]/.test(this.form.password); },
    passwordNumber() { return /\d/.test(this.form.password); },
    passwordValid() { return this.passwordLength && this.passwordUpper && this.passwordNumber && this.passwordSpecial; },
    phoneValid() { return /^\d{10}$/.test(this.form.phoneNumber); },
    canSubmit() {
      return (
        this.form.companyName.trim() && this.form.companyNit.trim() &&
        this.form.userName.trim() && this.form.fullName.trim() &&
        this.form.email.trim() && this.passwordValid && this.phoneValid
      );
    }
  },
  mounted() { this.initAnimatedBG(); },
  methods: {
    cleanPhoneInput() { this.form.phoneNumber = this.form.phoneNumber.replace(/\D/g, ""); },
    cleanUsernameInput() { this.form.userName = this.form.userName.replace(/[^a-zA-Z0-9_]/g, ""); },
    showNotification(message, type = 'error') {
      if (this.notificationTimer) clearTimeout(this.notificationTimer);
      this.notification.message = message; this.notification.type = type; this.notification.visible = true;
      this.notificationTimer = setTimeout(() => { this.notification.visible = false; }, 5000);
    },
    validateForm() {
      this.errors = {}; let isValid = true;
      if (!this.form.companyName.trim()) { this.errors.companyName = true; isValid = false; }
      if (!this.form.companyNit.trim()) { this.errors.companyNit = true; isValid = false; }
      if (!this.form.userName.trim() || this.form.userName.length < 3) { this.errors.userName = true; isValid = false; }
      if (!this.form.fullName.trim()) { this.errors.fullName = true; isValid = false; }
      if (!this.form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) { this.errors.email = true; isValid = false; }
      if (!this.passwordValid) { this.errors.password = true; isValid = false; }
      if (!this.phoneValid) { this.errors.phoneNumber = true; isValid = false; }
      return isValid;
    },
    async submitForm() {
      if (!this.validateForm()) { this.showNotification("Por favor verifica los campos marcados en rojo.", "error"); return; }
      this.isLoading = true;
      try {
        const payload = {
          userName: this.form.userName, fullName: this.form.fullName, email: this.form.email,
          password: this.form.password, phoneNumber: this.form.phoneNumber, role: "Admin",
          companyNit: this.form.companyNit, companyName: this.form.companyName
        };
        const response = await fetch('https://service.apexvision.crudzaso.com/api/Auth/register/admin', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData && errorData.errors) throw new Error(Object.values(errorData.errors).flat().join(", "));
          throw new Error("Error en la solicitud (" + response.status + ")");
        }
        this.showNotification("✅ Empresa registrada exitosamente. Redirigiendo...", "success");
        setTimeout(() => { this.$router.push("/login"); }, 2500);
      } catch (error) {
        this.showNotification("❌ " + error.message, "error");
      } finally { this.isLoading = false; }
    },
    initAnimatedBG() {
      const canvas = document.getElementById("canvas-bg"); if (!canvas) return;
      const ctx = canvas.getContext("2d"); let w, h;
      const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
      resize(); window.addEventListener("resize", resize);
      const dots = Array.from({ length: 70 }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.6, dy: (Math.random() - 0.5) * 0.6
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
  }
};
</script>

<style scoped>
/* TEMA OSCURO ELEGANTE */
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

.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
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

/* TARJETA EQUILIBRADA */
.register-card {
  width: 100%;
  max-width: 650px;
  /* Ancho cómodo para 2 columnas */
  padding: 35px 40px;
  /* Espaciado interno generoso */
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid rgba(212, 175, 55, 0.25);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9);
  z-index: 2;
}

.card-header {
  text-align: center;
  margin-bottom: 25px;
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

/* GRID SYSTEM - 2 Columnas */
.form-row {
  display: flex;
  gap: 20px;
  /* Separación horizontal cómoda */
  margin-bottom: 18px;
  /* Separación vertical entre filas */
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.full-width {
  margin-bottom: 18px;
}

/* Para el password */

.input-label {
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: var(--text-sec);
  font-weight: 600;
}

.input {
  width: 100%;
  padding: 12px 14px;
  /* Tamaño de input estándar, fácil de clickear */
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

/* PASSWORD WRAPPER */
.password-wrapper {
  position: relative;
  width: 100%;
}

.input-pass {
  padding-right: 80px;
}

/* Espacio para el botón de texto */
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
  letter-spacing: 0.5px;
}

/* REGLAS PASSWORD */
.password-rules-inline {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #666;
  flex-wrap: wrap;
}

.password-rules-inline span {
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.password-rules-inline span::before {
  content: "•";
  color: #444;
}

.password-rules-inline span.ok {
  color: var(--ok);
}

.password-rules-inline span.ok::before {
  content: "✓";
  color: var(--ok);
}

/* BOTÓN PRINCIPAL */
.btn-register {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 800;
  margin-top: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(212, 175, 55, 0.4);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 0.95rem;
  color: #888;
}

.login-link a {
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

/* RESPONSIVE: EN CELULAR PASA A 1 COLUMNA */
@media (max-width: 700px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 15px;
  }

  .register-card {
    padding: 25px;
    max-width: 100%;
  }
}
</style>