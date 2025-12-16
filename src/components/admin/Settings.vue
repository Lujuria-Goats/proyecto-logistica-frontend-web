<template>
  <div class="settings-container">

    <!-- FONDO ANIMADO -->
    <div class="settings-bg"></div>
    <div class="settings-gold"></div>

    <!-- HEADER -->
    <header class="settings-header">
      <h1 class="title">Configuración de la Cuenta</h1>
      <p class="subtitle">Información de sesión y seguridad</p>
    </header>

    <!-- SECCIONES -->
    <section class="settings-grid">

      <!-- 🔹 INFORMACIÓN DEL TOKEN (SOLO LECTURA) -->
      <div class="settings-card info-card">
        <h2 class="section-title">👤 Información Personal</h2>

        <div class="form-row">
          <div class="form-group half">
            <label>ID Usuario</label>
            <input type="text" :value="user.id" readonly class="input-lock" />
          </div>
          <div class="form-group half">
            <label>Rol</label>
            <input type="text" :value="user.role" readonly class="input-lock highlight" />
          </div>
        </div>

        <div class="form-group">
          <label>Nombre Completo</label>
          <input type="text" :value="user.fullName" readonly class="input-lock" />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label>Usuario (User Name)</label>
            <input type="text" :value="user.userName" readonly class="input-lock" />
          </div>
          <div class="form-group half">
            <label>Celular</label>
            <input type="text" :value="user.phoneNumber" readonly class="input-lock" />
          </div>
        </div>

        <div class="form-group">
          <label>Correo Electrónico</label>
          <input type="email" :value="user.email" readonly class="input-lock" />
        </div>
      </div>

      <!-- 🏢 INFORMACIÓN DE EMPRESA (SOLO LECTURA) -->
      <div class="settings-card">
        <h2 class="section-title">🏢 Datos de la Empresa</h2>

        <div class="form-group">
          <label>ID Empresa</label>
          <input type="text" :value="user.companyId" readonly class="input-lock" />
        </div>

        <div class="form-group">
          <label>Nombre de la Empresa</label>
          <input type="text" :value="user.companyName" readonly class="input-lock" />
        </div>

        <div class="form-group">
          <label>NIT / Identificación Fiscal</label>
          <input type="text" :value="user.companyNit" readonly class="input-lock" />
        </div>
      </div>

      <!-- 🔸 CAMBIAR CONTRASEÑA (FUNCIONAL) -->
      <div class="settings-card">
        <h2 class="section-title">🔐 Seguridad</h2>

        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label>Contraseña actual</label>
            <input 
              type="password" 
              v-model="passwordForm.currentPassword" 
              placeholder="••••••••" 
              required
            />
          </div>

          <div class="form-group">
            <label>Nueva contraseña</label>
            <input 
              type="password" 
              v-model="passwordForm.newPassword" 
              placeholder="Nueva contraseña" 
              required
              minlength="6"
            />
          </div>

          <div class="form-group">
            <label>Confirmar nueva contraseña</label>
            <input 
              type="password" 
              v-model="passwordForm.confirmPassword" 
              placeholder="Repite la nueva contraseña" 
              required
            />
          </div>

          <button type="submit" class="btn-save" :disabled="isSubmitting">
            <span v-if="isSubmitting">Actualizando...</span>
            <span v-else>Actualizar contraseña</span>
          </button>
        </form>
      </div>

    </section>

    <!-- ========================================== -->
    <!-- MODAL DE ÉXITO / ERROR (TELEPORT)          -->
    <!-- ========================================== -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <div class="modal-card" :class="{ 'error-mode': modalData.type === 'error' }">
              
              <div class="modal-body">
                <div class="modal-icon">
                  {{ modalData.type === 'success' ? '✨' : '⚠️' }}
                </div>
                <h3 class="modal-title">{{ modalData.title }}</h3>
                <p class="modal-message">{{ modalData.message }}</p>
                
                <button class="btn-modal" @click="closeModal">
                  {{ modalData.type === 'success' ? 'Entendido' : 'Cerrar' }}
                </button>
              </div>

            </div>
          </div>
        </div>
      </transition>
    </teleport>

  </div>
</template>

<script>
export default {
  name: "Settings",
  data() {
    return {
      baseUrl: 'https://service.lujuria.crudzaso.com',
      isSubmitting: false,
      
      // Datos del usuario (Token)
      user: {
        id: "", email: "", userName: "", fullName: "", phoneNumber: "",
        companyId: "", companyNit: "", companyName: "", role: ""
      },

      // Formulario de contraseña
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      },

      // Estado del Modal
      showModal: false,
      modalData: {
        title: "",
        message: "",
        type: "success" // 'success' | 'error'
      }
    };
  },
  mounted() {
    this.loadDataFromToken();
  },
  methods: {
    // --- UTILS TOKEN ---
    getCleanToken() {
      let token = localStorage.getItem('token');
      if (!token) return null;
      token = String(token).replace(/^"|"$/g, '');
      if (token.toLowerCase().startsWith('bearer ')) token = token.slice(7).trim();
      return token;
    },

    loadDataFromToken() {
      const token = this.getCleanToken();
      if (!token) return;

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        this.user = {
          id: payload.nameid || "N/A",
          email: payload.email || "N/A",
          userName: payload.userName || "N/A",
          fullName: payload.fullName || "Usuario",
          phoneNumber: payload.phoneNumber || "N/A",
          companyId: payload.companyId || "N/A",
          companyNit: payload.companyNit || "N/A",
          companyName: payload.companyName || "N/A",
          role: payload.role || "N/A"
        };
      } catch (error) {
        console.error("Error leyendo token en settings:", error);
      }
    },

    // --- MANEJO DEL MODAL ---
    triggerModal(title, message, type = 'success') {
      this.modalData = { title, message, type };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },

    // --- CAMBIAR CONTRASEÑA ---
    async changePassword() {
      // 1. Validaciones Locales con Modal
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        return this.triggerModal("Error", "Las contraseñas nuevas no coinciden.", "error");
      }
      if (this.passwordForm.newPassword.length < 6) {
        return this.triggerModal("Seguridad", "La nueva contraseña debe tener al menos 6 caracteres.", "error");
      }
      if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
        return this.triggerModal("Atención", "La nueva contraseña no puede ser igual a la actual.", "error");
      }

      this.isSubmitting = true;
      const token = this.getCleanToken();

      try {
        const payload = {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        };

        const res = await fetch(`${this.baseUrl}/api/Auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Error ${res.status}`);
        }

        // Éxito
        this.triggerModal("¡Éxito!", "Tu contraseña ha sido actualizada correctamente.", "success");
        
        // Limpiar formulario
        this.passwordForm = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        };

      } catch (error) {
        console.error("Error cambiando password:", error);
        this.triggerModal("Error de Actualización", error.message, "error");
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>

/* ================================ */
/* FONDO ANIMADO */
/* ================================ */
.settings-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, #0c0c0c, #000);
  animation: zoom 14s ease-in-out infinite alternate;
  z-index: -2;
}

.settings-gold {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 80% 80%, rgba(212,175,55,0.18), transparent 60%);
  animation: glow 16s ease-in-out infinite alternate;
  z-index: -1;
}

@keyframes zoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}

@keyframes glow {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* ================================ */
/* CONTENEDOR */
/* ================================ */
.settings-container {
  padding: 35px;
  color: #fff;
  font-family: "Inter", sans-serif;
  padding-bottom: 80px; /* Espacio extra abajo */
}

/* HEADER */
.settings-header .title {
  font-size: 28px;
  color: #D4AF37;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.subtitle {
  color: #aaa;
  margin-top: 5px;
  font-size: 15px;
}

/* ================================ */
/* GRID DE TARJETAS */
/* ================================ */
.settings-grid {
  margin-top: 35px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

/* ================================ */
/* TARJETAS */
/* ================================ */
.settings-card {
  background: rgba(15, 12, 8, 0.7);
  border: 1px solid rgba(212,175,55,0.15);
  border-radius: 14px;
  padding: 25px;
  backdrop-filter: blur(10px);
  transition: 0.25s ease;
  display: flex;
  flex-direction: column;
}

.settings-card:hover {
  border-color: rgba(212,175,55,0.4);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #D4AF37;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 10px;
}

/* ================================ */
/* FORMULARIOS */
/* ================================ */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

/* Filas de dos columnas */
.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

label {
  font-size: 13px;
  margin-bottom: 6px;
  color: #bbb;
  font-weight: 500;
}

input {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 12px 14px;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  transition: 0.2s;
}

/* INPUTS EDITABLES (PASSWORD) */
input:not([readonly]):focus {
  border-color: #D4AF37;
  background: #000;
  box-shadow: 0 0 0 2px rgba(212,175,55,0.1);
}

/* INPUTS READONLY (BLOQUEADOS) */
.input-lock {
  background: rgba(0, 0, 0, 0.4); /* Fondo más oscuro */
  border: 1px dashed rgba(255, 255, 255, 0.15); /* Borde punteado sutil */
  color: #ccc; /* Texto un poco más gris */
  cursor: not-allowed;
  font-family: monospace; /* Fuente tipo código para datos técnicos */
}

.input-lock:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.15);
}

.highlight {
  color: #D4AF37;
  font-weight: bold;
  border-color: rgba(212,175,55,0.3);
}

/* BOTÓN */
.btn-save {
  margin-top: 15px;
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  background: #D4AF37;
  border: none;
  cursor: pointer;
  font-weight: 700;
  color: #000;
  transition: 0.25s;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.btn-save:hover:not(:disabled) {
  background: #f0c953;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(212,175,55,0.25);
}

.btn-save:disabled {
  background: #555;
  color: #999;
  cursor: not-allowed;
  transform: none;
}

/* =========================================
   ESTILOS DEL MODAL
   ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background: #141414;
  border: 1px solid #D4AF37;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

/* Modo Error (Borde rojo) */
.modal-card.error-mode {
  border-color: #ff4d4d;
}
.modal-card.error-mode .modal-icon {
  text-shadow: 0 0 20px rgba(255, 77, 77, 0.4);
}
.modal-card.error-mode .modal-title {
  color: #ff4d4d;
}
.modal-card.error-mode .btn-modal {
  background: #ff4d4d;
  color: #fff;
}
.modal-card.error-mode .btn-modal:hover {
  background: #ff3333;
}

.modal-body {
  padding: 40px 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-title {
  margin: 0 0 10px 0;
  color: #D4AF37;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-message {
  font-size: 1rem;
  color: #ccc;
  margin: 0 0 25px 0;
  line-height: 1.5;
}

.btn-modal {
  background: #D4AF37;
  border: none;
  color: #000;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  text-transform: uppercase;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-modal:hover {
  background: #f0c953;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212,175,55,0.3);
}

/* Animaciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

</style>