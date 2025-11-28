<template>
  <div class="dashboard-container">
    
    <!-- EFECTO DE FONDO -->
    <div class="dashboard-bg"></div>
    <div class="dashboard-gold"></div>

    <!-- HEADER -->
    <header class="dashboard-header">
      <h1 class="title">Panel General</h1>
      <p class="subtitle">Resumen de operaciones y actividad reciente</p>
    </header>

    <!-- TARJETAS PRINCIPALES -->
    <section class="stats-grid">
      <div class="stat-card">
        <h3>📦 Pedidos Hoy</h3>
        <p class="number">128</p>
        <span class="trend">+12% esta semana</span>
      </div>

      <div class="stat-card">
        <h3>🚚 Transportadores Activos</h3>
        <p class="number">32</p>
        <span class="trend">+3 nuevos</span>
      </div>

      <div class="stat-card">
        <h3>🗺️ Rutas Optimizadas</h3>
        <p class="number">54</p>
        <span class="trend green">98% eficiencia</span>
      </div>

      <div class="stat-card">
        <h3>🤖 Eventos de Auditoría</h3>
        <p class="number">14</p>
        <span class="trend red">+5 urgentes</span>
      </div>
    </section>

    <!-- SECCIÓN DE ACTIVIDAD -->
    <section class="activity">
      <h2 class="section-title">Actividad Reciente</h2>

      <div class="activity-list">
        <div class="activity-item">
          <span class="dot"></span>
          Pedido #9823 fue asignado a un transportador
        </div>

        <div class="activity-item">
          <span class="dot"></span>
          Ruta Cartagena → Barranquilla optimizada exitosamente
        </div>

        <div class="activity-item">
          <span class="dot"></span>
          Transportador *Luis Salazar* inició recorrido
        </div>

        <div class="activity-item">
          <span class="dot"></span>
          Sistema IA detectó retraso potencial en la ruta 18
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: "Dashboard",
};
</script>

<style scoped>

/* ============================ */
/* FONDO ANIMADO DEL DASHBOARD */
/* ============================ */
.dashboard-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, #0b0b0b, #000);
  animation: zoom 14s ease-in-out infinite alternate;
  z-index: -2;
}

@keyframes zoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}

.dashboard-gold {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 85% 75%, rgba(212,175,55,0.18), transparent 60%);
  animation: glow 16s ease-in-out infinite alternate;
  z-index: -1;
}

@keyframes glow {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* ============================ */
/* CONTENEDOR */
/* ============================ */
.dashboard-container {
  color: #fff;
  padding: 35px;
  font-family: "Inter", sans-serif;
}

/* HEADER */
.dashboard-header .title {
  font-size: 32px;
  font-weight: 700;
  color: #D4AF37;
}

.subtitle {
  color: #aaa;
  margin-top: 4px;
}

/* ============================ */
/* TARJETAS PRINCIPALES */
/* ============================ */
.stats-grid {
  margin-top: 35px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 22px;
}

.stat-card {
  padding: 25px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 16px;
  backdrop-filter: blur(6px);
  transition: 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: #D4AF37;
  box-shadow: 0 0 20px rgba(212,175,55,0.12);
}

.stat-card .number {
  font-size: 34px;
  margin-top: 10px;
  font-weight: 700;
}

.trend {
  font-size: 14px;
  color: #D4AF37;
  opacity: 0.9;
}

.trend.red {
  color: #ff5a5a;
}

.trend.green {
  color: #7cff7c;
}

/* ============================ */
/* ACTIVIDAD RECIENTE */
/* ============================ */
.activity {
  margin-top: 55px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #D4AF37;
  margin-bottom: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activity-item {
  padding: 14px 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-item .dot {
  width: 10px;
  height: 10px;
  background: #D4AF37;
  border-radius: 50%;
}

</style>
