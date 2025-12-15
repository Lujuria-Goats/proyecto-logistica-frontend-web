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

    <!-- LOADING STATE -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando métricas...</p>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="error" class="error-container">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchDashboardData" class="btn-retry">Reintentar</button>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div v-else class="dashboard-content fade-in">
      
      <!-- TARJETAS PRINCIPALES -->
      <section class="stats-grid">
        
        <!-- CARD 1: PEDIDOS HOY -->
        <div class="stat-card">
          <div class="card-icon">📦</div>
          <div class="card-info">
            <h3>Pedidos Hoy</h3>
            <p class="number">{{ stats.orders.today }}</p>
            <span class="trend neutral">
              {{ stats.orders.pending }} pendientes por asignar
            </span>
          </div>
        </div>

        <!-- CARD 2: EN CURSO -->
        <div class="stat-card">
          <div class="card-icon">🚀</div>
          <div class="card-info">
            <h3>En Curso</h3>
            <p class="number">{{ stats.orders.inTransit }}</p>
            <span class="trend">
              {{ stats.routes.active }} rutas activas
            </span>
          </div>
        </div>

        <!-- CARD 3: EFECTIVIDAD -->
        <div class="stat-card">
          <div class="card-icon">🎯</div>
          <div class="card-info">
            <h3>Efectividad Hoy</h3>
            <p class="number">{{ efficiencyPercentage }}%</p>
            <span class="trend" :class="efficiencyClass">
              {{ stats.orders.completedToday }} entregados
            </span>
          </div>
        </div>

        <!-- CARD 4: CONDUCTORES -->
        <div class="stat-card">
          <div class="card-icon">🚚</div>
          <div class="card-info">
            <h3>Conductores</h3>
            <p class="number">{{ stats.drivers.activeToday }} <span class="small">/ {{ stats.drivers.totalLinked }}</span></p>
            <span class="trend green">
              Activos hoy
            </span>
          </div>
        </div>
      </section>

      <!-- SECCIÓN DE ACTIVIDAD -->
      <section class="activity">
        <h2 class="section-title">Actividad Reciente</h2>

        <div v-if="recentActivity.length === 0" class="empty-activity">
          No hay actividad reciente registrada.
        </div>

        <div v-else class="activity-list">
          <div v-for="(item, index) in recentActivity" :key="index" class="activity-item">
            <div class="activity-icon">
              {{ item.type === 'Entrega' ? '📦' : '🗺️' }}
            </div>
            <div class="activity-content">
              <p class="act-message">{{ item.message }}</p>
              <small class="act-subtext">
                👤 {{ item.subtext }} • 🕒 {{ formatDate(item.date) }}
              </small>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  data() {
    return {
      baseUrl: 'https://service.lujuria.crudzaso.com',
      isLoading: true,
      error: null,
      
      // Estructura inicial para evitar errores de renderizado antes de cargar
      stats: {
        orders: { total: 0, today: 0, pending: 0, inTransit: 0, completedToday: 0, canceled: 0 },
        drivers: { totalLinked: 0, activeToday: 0 },
        routes: { total: 0, active: 0 }
      },
      recentActivity: []
    };
  },
  computed: {
    efficiencyPercentage() {
      if (this.stats.orders.today === 0) return 0;
      const pct = (this.stats.orders.completedToday / this.stats.orders.today) * 100;
      return pct.toFixed(0);
    },
    efficiencyClass() {
      const val = this.efficiencyPercentage;
      if (val >= 80) return 'green';
      if (val >= 50) return 'neutral';
      return 'red';
    }
  },
  mounted() {
    this.fetchDashboardData();
  },
  methods: {
    getCleanToken() {
      let token = localStorage.getItem('token');
      if (!token) return null;
      token = String(token).replace(/^"|"$/g, '');
      if (token.toLowerCase().startsWith('bearer ')) token = token.slice(7).trim();
      return token;
    },

    async fetchDashboardData() {
      this.isLoading = true;
      this.error = null;

      try {
        const token = this.getCleanToken();
        if (!token) {
          // Si no hay token, redirigir al login (ajusta la ruta según tu router)
          this.$router.push('/login'); 
          return;
        }

        const res = await fetch(`${this.baseUrl}/api/Dashboard/admin-summary`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
          throw new Error("Sesión expirada.");
        }

        if (!res.ok) {
          throw new Error(`Error del servidor (${res.status})`);
        }

        const data = await res.json();
        
        // Actualizar estado
        this.stats = data.stats;
        this.recentActivity = data.recentActivity || [];

      } catch (e) {
        console.error("Dashboard Error:", e);
        this.error = e.message || "No se pudieron cargar las estadísticas.";
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      // Formato relativo simple o hora local
      const now = new Date();
      const diffMin = Math.floor((now - date) / 60000);

      if (diffMin < 1) return "Hace un momento";
      if (diffMin < 60) return `Hace ${diffMin} min`;
      
      // Si fue hace más de una hora, mostrar hora local
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
};
</script>

<style scoped>
/* ============================ */
/* FONDO ANIMADO */
/* ============================ */
.dashboard-bg {
  position: fixed; inset: 0; background: radial-gradient(circle at 30% 20%, #0b0b0b, #000);
  animation: zoom 14s ease-in-out infinite alternate; z-index: -2;
}
@keyframes zoom { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }

.dashboard-gold {
  position: fixed; inset: 0; background: radial-gradient(circle at 85% 75%, rgba(212,175,55,0.18), transparent 60%);
  animation: glow 16s ease-in-out infinite alternate; z-index: -1;
}
@keyframes glow { 0% { opacity: 0.5; } 100% { opacity: 1; } }

/* ============================ */
/* CONTENEDOR */
/* ============================ */
.dashboard-container {
  color: #fff; padding: 35px; font-family: "Inter", sans-serif; min-height: 100vh;
}

/* HEADER */
.dashboard-header .title { font-size: 32px; font-weight: 700; color: #D4AF37; margin: 0; }
.subtitle { color: #888; margin-top: 5px; font-size: 0.95rem; }

/* LOADING & ERROR */
.loading-container, .error-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 300px; color: #888;
}
.spinner {
  width: 40px; height: 40px; border: 3px solid #D4AF37; border-top-color: transparent;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn-retry {
  margin-top: 10px; background: #D4AF37; border: none; padding: 8px 16px; 
  border-radius: 6px; cursor: pointer; font-weight: bold; color: #000;
}

/* ============================ */
/* TARJETAS PRINCIPALES */
/* ============================ */
.stats-grid {
  margin-top: 35px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 22px;
}

.stat-card {
  padding: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.2);
  border-radius: 16px; backdrop-filter: blur(10px); transition: 0.25s ease;
  display: flex; align-items: flex-start; gap: 15px;
}

.stat-card:hover {
  transform: translateY(-4px); border-color: #D4AF37; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  background: rgba(255,255,255,0.05);
}

.card-icon {
  font-size: 2rem; background: rgba(212,175,55,0.1); padding: 10px; border-radius: 12px;
  width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;
}

.card-info h3 { margin: 0; font-size: 0.9rem; color: #aaa; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-card .number { font-size: 28px; margin: 5px 0; font-weight: 700; color: #fff; }
.stat-card .number .small { font-size: 16px; color: #666; font-weight: 400; }

.trend { font-size: 0.8rem; color: #D4AF37; display: block; }
.trend.red { color: #ff5a5a; }
.trend.green { color: #66bb6a; }
.trend.neutral { color: #bbb; }

/* ============================ */
/* ACTIVIDAD RECIENTE */
/* ============================ */
.activity { margin-top: 55px; }
.section-title { font-size: 20px; font-weight: 600; color: #D4AF37; margin-bottom: 20px; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 10px; display: inline-block; }

.empty-activity { color: #666; font-style: italic; }

.activity-list { display: flex; flex-direction: column; gap: 12px; }

.activity-item {
  padding: 12px 18px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; display: flex; align-items: center; gap: 15px; transition: 0.2s;
}
.activity-item:hover { background: rgba(212,175,55,0.05); border-color: rgba(212,175,55,0.2); }

.activity-icon { font-size: 1.5rem; }

.activity-content { flex: 1; }
.act-message { margin: 0 0 4px 0; font-weight: 500; color: #e0e0e0; font-size: 0.95rem; }
.act-subtext { color: #888; font-size: 0.8rem; display: block; }

/* ANIMACIÓN DE ENTRADA */
.fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr; }
  .dashboard-header .title { font-size: 26px; }
}
</style>