<template>
  <div class="settings-container">

    <!-- FONDO ANIMADO -->
    <div class="settings-bg"></div>
    <div class="settings-gold"></div>

    <!-- HEADER -->
    <header class="settings-header">
      <h1 class="title">Configuración de la Cuenta</h1>
      <p class="subtitle">Gestiona tu información personal y seguridad</p>
    </header>

    <!-- SECCIONES -->
    <section class="settings-grid">

      <!-- 🔹 INFORMACIÓN GENERAL -->
      <div class="settings-card">
        <h2 class="section-title">Información de la Cuenta</h2>

        <div class="form-group">
          <label>Nombre completo</label>
          <input type="text" placeholder="Tu nombre" />
        </div>

        <div class="form-group">
          <label>Correo electrónico</label>
          <input type="email" placeholder="correo@ejemplo.com" />
        </div>

        <div class="form-group">
          <label>Número de contacto</label>
          <input type="text" placeholder="+57 300 000 0000" />
        </div>

        <button class="btn-save">Guardar cambios</button>
      </div>

      <!-- 🔸 CAMBIAR CONTRASEÑA -->
      <div class="settings-card">
        <h2 class="section-title">Cambiar Contraseña</h2>

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
}

/* HEADER */
.settings-header .title {
  font-size: 28px;
  color: #D4AF37;
  font-weight: 700;
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
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 25px;
}

/* ================================ */
/* TARJETAS */
/* ================================ */
.settings-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 14px;
  padding: 22px;
  backdrop-filter: blur(6px);
  transition: 0.25s ease;
}

.settings-card:hover {
  transform: translateY(-3px);
  border-color: #D4AF37;
  box-shadow: 0 0 20px rgba(212,175,55,0.15);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #D4AF37;
  margin-bottom: 15px;
}

/* ================================ */
/* FORMULARIOS */
/* ================================ */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

label {
  font-size: 14px;
  margin-bottom: 4px;
  opacity: 0.85;
}

input {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(212,175,55,0.3);
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  outline: none;
  transition: 0.2s;
}

input:focus {
  border-color: #D4AF37;
  background: rgba(255,255,255,0.12);
}

/* BOTÓN */
.btn-save {
  margin-top: 10px;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: #D4AF37;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s;
}

.btn-save:hover {
  background: #e2c75e;
  box-shadow: 0 0 15px rgba(212,175,55,0.35);
}

</style>
