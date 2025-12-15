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

      <!-- 🔸 CAMBIAR CONTRASEÑA (ESTO SÍ ES EDITABLE) -->
      <div class="settings-card">
        <h2 class="section-title">🔐 Seguridad</h2>

        <div class="form-group">
          <label>Contraseña actual</label>
          <input type="password" placeholder="••••••••" />
        </div>

        <div class="form-group">
          <label>Nueva contraseña</label>
          <input type="password" placeholder="Nueva contraseña" />
        </div>

        <div class="form-group">
          <label>Confirmar nueva contraseña</label>
          <input type="password" placeholder="Repite la nueva contraseña" />
        </div>

        <button class="btn-save">Actualizar contraseña</button>
      </div>

    </section>

  </div>
</template>

<script>
export default {
  name: "Settings",
  data() {
    return {
      user: {
        id: "",
        email: "",
        userName: "",
        fullName: "",
        phoneNumber: "",
        companyId: "",
        companyNit: "",
        companyName: "",
        role: ""
      }
    };
  },
  mounted() {
    this.loadDataFromToken();
  },
  methods: {
    loadDataFromToken() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Decodificar Base64 soportando caracteres especiales (tildes)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        // Mapear los datos del JSON que me diste a las variables locales
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

        console.log("Datos cargados:", this.user);

      } catch (error) {
        console.error("Error leyendo token en settings:", error);
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

.btn-save:hover {
  background: #f0c953;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(212,175,55,0.25);
}

</style>