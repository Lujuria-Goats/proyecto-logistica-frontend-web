<template>
  <div class="settings-page text-white">
    <div class="bg-decor" aria-hidden="true"></div>

    <h1 class="title">Configuración de la Empresa</h1>

    <div class="container settings-container">

      <!-- 🏢 Información de la Empresa -->
      <section class="card-section fade-in-up">
        <h3>Información de la Empresa</h3>

        <div class="form-grid">
          <div class="input-group">
            <label>Nombre de la Empresa</label>
            <input type="text" v-model="company.name" />
          </div>

          <div class="input-group">
            <label>NIT / Identificación</label>
            <input type="text" v-model="company.nit" />
          </div>

          <div class="input-group">
            <label>Teléfono</label>
            <input type="text" v-model="company.phone" />
          </div>

          <div class="input-group">
            <label>Correo Empresarial</label>
            <input type="text" v-model="company.email" />
          </div>

          <div class="input-group full">
            <label>Dirección</label>
            <input type="text" v-model="company.address" />
          </div>
        </div>
      </section>

      <!-- 🖼️ Logo de la Empresa -->
      <section class="card-section fade-in-up">
        <h3>Logo de la Empresa</h3>

        <div class="logo-area">
          <img
            v-if="company.logo"
            :src="company.logo"
            alt="Logo"
            class="company-logo"
          />
          <div v-else class="logo-placeholder">Sin Logo</div>

          <input type="file" @change="uploadLogo" />
        </div>
      </section>

      <!-- ⏰ Horarios -->
      <section class="card-section fade-in-up">
        <h3>Horarios de Operación</h3>

        <div class="form-grid">
          <div class="input-group">
            <label>Apertura</label>
            <input type="time" v-model="company.openTime" />
          </div>

          <div class="input-group">
            <label>Cierre</label>
            <input type="time" v-model="company.closeTime" />
          </div>
        </div>
      </section>

      <!-- ⚙️ Parámetros de Operación -->
      <section class="card-section fade-in-up">
        <h3>Parámetros de Operación</h3>

        <div class="form-grid">
          <div class="input-group">
            <label>Capacidad Máxima de Vehículos</label>
            <input type="number" v-model="company.maxUnits" min="1" />
          </div>

          <div class="input-group">
            <label>Tiempo de Espera Máximo (min)</label>
            <input type="number" v-model="company.waitTime" min="1" />
          </div>

          <div class="input-group">
            <label>Tarifa Base (opcional)</label>
            <input type="number" v-model="company.baseFare" min="0" />
          </div>
        </div>
      </section>

      <!-- 🔔 Notificaciones -->
      <section class="card-section fade-in-up">
        <h3>Notificaciones Internas</h3>

        <div class="toggle-item">
          <span>Notificar cuando un conductor complete un viaje</span>
          <input type="checkbox" v-model="company.notifyCompleted" />
        </div>

        <div class="toggle-item">
          <span>Notificar atrasos</span>
          <input type="checkbox" v-model="company.notifyDelays" />
        </div>

        <div class="toggle-item">
          <span>Alertas de capacidad máxima</span>
          <input type="checkbox" v-model="company.alertMax" />
        </div>
      </section>

      <!-- Botón Guardar -->
      <div class="save-area">
        <button class="btn-gold" @click="saveSettings">
          Guardar Configuraciones
        </button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "Settings",

  data() {
    return {
      company: {
        name: "",
        nit: "",
        phone: "",
        email: "",
        address: "",
        logo: null,
        openTime: "",
        closeTime: "",
        maxUnits: 10,
        waitTime: 15,
        baseFare: 0,
        notifyCompleted: true,
        notifyDelays: true,
        alertMax: false,
      },
    };
  },

  methods: {
    uploadLogo(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        this.company.logo = reader.result;
      };
      reader.readAsDataURL(file);
    },

    saveSettings() {
      alert("Configuraciones guardadas correctamente ✔️");
    },
  },
};
</script>

<style scoped>
.settings-page {
  position: relative;
  min-height: 100vh;
  padding: 40px 20px;
}

/* Título */
.title {
  font-size: 2rem;
  margin-bottom: 25px;
  text-align: center;
  color: #efe8c7;
  font-weight: bold;
}

/* Contenedor de secciones */
.settings-container {
  max-width: 1000px;
  margin: auto;
}

/* Tarjetas con tu mismo estilo */
.card-section {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  backdrop-filter: blur(5px);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.04);
}

/* Inputs */
.input-group {
  display: flex;
  flex-direction: column;
}
.input-group label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #cfc6a8;
}
.input-group input {
  background: #1b1b1b;
  border: 1px solid #3a3a3a;
  color: #efe8c7;
  padding: 10px;
  border-radius: 10px;
  outline: none;
}
.input-group input:focus {
  border-color: #c7b37c;
}
.full {
  grid-column: span 2;
}

/* Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

/* Logo */
.logo-area {
  display: flex;
  align-items: center;
  gap: 20px;
}
.company-logo {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  border: 2px solid #c7b37c;
  object-fit: cover;
}
.logo-placeholder {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  background: #222;
  border: 2px dashed #555;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
}

/* Switches */
.toggle-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

/* Botón dorado */
.btn-gold {
  background: #c7b37c;
  color: #1a1a1a;
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
  font-size: 17px;
}
.btn-gold:hover {
  opacity: 0.85;
}

/* Animación */
.fade-in-up {
  animation: fadeUp 0.5s ease;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
