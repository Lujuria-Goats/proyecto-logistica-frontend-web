<template>
  <div class="notifications-page">

    <!-- EFECTO DE FONDO -->
    <div class="page-bg"></div>
    <div class="page-gold"></div>

    <div class="content-container">
      
      <!-- HEADER DE LA PÁGINA -->
      <header class="page-header">
        <h1 class="title">Centro de Notificaciones</h1>
        <p class="subtitle">Historial completo de actividades y alertas</p>
      </header>

      <!-- PANEL PRINCIPAL -->
      <div class="logs-panel fade-in">

        <!-- HEADER DEL PANEL -->
        <div class="logs-header">
          <div class="header-left">
            <h2 class="panel-title">📋 Actividad Reciente</h2>
            <span class="badge">{{ filteredLogs.length }} registros</span>
          </div>

          <!-- FILTROS DINÁMICOS -->
          <div class="filter-wrapper">
            <span class="filter-label">Filtrar por:</span>
            <select v-model="currentFilter" class="filter-select">
              <option value="all">🌐 Todas</option>
              <option value="assign">👤 Asignaciones</option>
              <option value="create">✨ Rutas Nuevas</option>
              <option value="route-complete">🏁 Rutas Completadas</option> <!-- NUEVO FILTRO -->
              <option value="delete">🗑️ Eliminaciones</option>
              <option value="success">📦 Entregas</option>
            </select>
          </div>
        </div>

        <!-- ZONA DE CONTENIDO SCROLLABLE -->
        <div class="scroll-area">
          
          <!-- LOADING -->
          <div v-if="isLoading" class="state-container">
            <div class="spinner"></div>
            <p>Cargando historial...</p>
          </div>

          <!-- EMPTY STATE -->
          <div v-else-if="filteredLogs.length === 0" class="state-container">
            <span class="empty-icon">📭</span>
            <p>No se encontraron notificaciones en esta categoría.</p>
          </div>

          <!-- LISTA DE LOGS -->
          <div v-else class="logs-list">
            <transition-group name="list">
              <div
                class="log-item"
                v-for="log in filteredLogs"
                :key="log.id"
                :class="log.details.cssClass"
              >
                <!-- ICONO DINÁMICO -->
                <div class="log-icon">
                  {{ log.details.icon }}
                </div>

                <!-- CONTENIDO -->
                <div class="log-content">
                  <div class="log-top">
                    <h3 class="log-title">{{ log.details.title }}</h3>
                    <span class="log-time">{{ timeAgo(log.timestamp) }}</span>
                  </div>
                  
                  <p class="log-message" v-html="formatMessage(log.message)"></p>
                  
                  <!-- SUBTEXTO (CONDUCTOR) -->
                  <small v-if="log.subtext" class="log-subtext">👤 {{ log.subtext }}</small>
                </div>
              </div>
            </transition-group>
          </div>

        </div> <!-- Fin scroll-area -->

      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "Notifications",
  data() {
    return {
      baseUrl: 'https://service.lujuria.crudzaso.com',
      logs: [],
      isLoading: false,
      currentFilter: 'all',
      refreshInterval: null
    };
  },
  computed: {
    filteredLogs() {
      if (this.currentFilter === 'all') return this.logs;
      return this.logs.filter(log => log.details.type === this.currentFilter);
    }
  },
  mounted() {
    this.fetchLogs();
    this.refreshInterval = setInterval(this.fetchLogs, 60000);
  },
  beforeUnmount() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  },
  methods: {
    getCleanToken() {
      let token = localStorage.getItem('token');
      if (!token) return null;
      token = String(token).replace(/^"|"$/g, '');
      if (token.toLowerCase().startsWith('bearer ')) token = token.slice(7).trim();
      return token;
    },

    async fetchLogs() {
      this.isLoading = true;
      const token = this.getCleanToken();
      if (!token) return;

      try {
        const res = await fetch(`${this.baseUrl}/api/Dashboard/admin-summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          const activities = data.recentActivity || [];
          
          this.logs = activities.map((item, index) => ({
            id: index,
            message: item.message,
            timestamp: item.date,
            subtext: item.subtext, // Guardamos el nombre del conductor
            type: item.type,       // Guardamos el tipo original del backend
            details: this.getLogDetails(item.message, item.type)
          }));
        } else {
          console.warn("Error al cargar datos.");
          this.logs = [];
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // --- LÓGICA DE ICONOS Y COLORES ---
    getLogDetails(message, typeFromBackend) {
      const msg = (message || "").toLowerCase();
      const type = (typeFromBackend || "").toLowerCase();

      // 1. NUEVO TIPO: RUTA COMPLETADA
      if (type.includes('ruta completada') || msg.includes('finalizada') || msg.includes('ruta completada')) {
        return { 
          type: 'route-complete', 
          title: 'Ruta Finalizada', 
          icon: '🏁', 
          cssClass: 'type-route-complete' // Verde especial
        };
      }

      // 2. ASIGNACIÓN
      if (msg.includes('asignada') || msg.includes('conductor')) {
        return { type: 'assign', title: 'Nueva Asignación', icon: '👤', cssClass: 'type-assign' };
      }

      // 3. CREACIÓN
      if (msg.includes('creada') || msg.includes('agregado') || msg.includes('registrada')) {
        return { type: 'create', title: 'Registro Creado', icon: '✨', cssClass: 'type-create' };
      }

      // 4. ELIMINACIÓN
      if (msg.includes('eliminada') || msg.includes('borrada')) {
        return { type: 'delete', title: 'Elemento Eliminado', icon: '🗑️', cssClass: 'type-delete' };
      }

      // 5. ENTREGAS (PEDIDOS)
      if (msg.includes('pedido') || msg.includes('entrega') || type.includes('entrega')) {
        return { type: 'success', title: 'Entrega Exitosa', icon: '📦', cssClass: 'type-success' };
      }
      
      // DEFAULT
      return { type: 'info', title: 'Sistema', icon: '🔔', cssClass: 'type-info' };
    },

    formatMessage(text) {
      if (!text) return "";
      return text.replace(/'([^']*)'/g, '<strong style="color: #d4af37;">\'$1\'</strong>');
    },

    timeAgo(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return "Hace " + Math.floor(interval) + " años";
      interval = seconds / 2592000;
      if (interval > 1) return "Hace " + Math.floor(interval) + " meses";
      interval = seconds / 86400;
      if (interval > 1) return "Hace " + Math.floor(interval) + " días";
      interval = seconds / 3600;
      if (interval > 1) return "Hace " + Math.floor(interval) + " h";
      interval = seconds / 60;
      if (interval > 1) return "Hace " + Math.floor(interval) + " min";
      return "Hace un momento";
    }
  }
};
</script>

<style scoped>
/* ================================ */
/* FONDO */
/* ================================ */
.page-bg { position: fixed; inset: 0; background: radial-gradient(circle at 30% 20%, #0c0c0c, #000); animation: zoom 14s infinite alternate; z-index: -2; }
.page-gold { position: fixed; inset: 0; background: radial-gradient(circle at 80% 80%, rgba(212,175,55,0.15), transparent 60%); animation: glow 16s infinite alternate; z-index: -1; }
@keyframes zoom { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
@keyframes glow { 0% { opacity: 0.5; } 100% { opacity: 1; } }

/* ================================ */
/* LAYOUT */
/* ================================ */
.notifications-page {
  height: 100vh;
  padding: 35px;
  color: #fff;
  font-family: "Inter", sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}
.title { font-size: 2rem; font-weight: 700; color: #D4AF37; margin: 0; }
.subtitle { color: #888; margin-top: 5px; font-size: 0.95rem; }

/* PANEL PRINCIPAL */
.logs-panel {
  background: rgba(15, 12, 8, 0.85);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  padding: 25px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin-bottom: 20px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 15px;
  flex-shrink: 0;
}

.panel-title { margin: 0; font-size: 1.2rem; color: #fff; }
.badge { background: rgba(212,175,55,0.1); color: #D4AF37; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; margin-left: 10px; border: 1px solid rgba(212,175,55,0.3); }

.filter-wrapper { display: flex; align-items: center; gap: 10px; }
.filter-label { color: #888; font-size: 0.9rem; }
.filter-select { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #eee; padding: 8px 12px; border-radius: 8px; outline: none; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
.filter-select:hover { border-color: #D4AF37; }

/* ÁREA DE SCROLL */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
}

.scroll-area::-webkit-scrollbar { width: 6px; }
.scroll-area::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 3px; }
.scroll-area::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
.scroll-area::-webkit-scrollbar-thumb:hover { background: #D4AF37; }

/* STATES */
.state-container {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #666; min-height: 200px;
}
.spinner { width: 35px; height: 35px; border: 3px solid #D4AF37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
.empty-icon { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5; }

/* LOG ITEMS */
.logs-list { display: flex; flex-direction: column; gap: 12px; }

.log-item {
  display: flex; align-items: flex-start; gap: 15px; padding: 16px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; transition: all 0.2s ease; border-left: 4px solid transparent;
}
.log-item:hover { background: rgba(255,255,255,0.06); transform: translateX(5px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }

/* COLORES POR TIPO */
.type-assign  { border-left-color: #D4AF37; }
.type-create  { border-left-color: #2ecc71; }
.type-delete  { border-left-color: #e74c3c; }
.type-success { border-left-color: #3498db; }
.type-info    { border-left-color: #95a5a6; }

/* NUEVO: ESTILO PARA RUTAS COMPLETADAS (Verde Brillante + Fondo Sutil) */
.type-route-complete { 
  border-left-color: #00e676; 
  background: rgba(0, 230, 118, 0.05);
}

.log-icon { font-size: 1.5rem; min-width: 40px; text-align: center; padding-top: 2px; }
.log-content { flex: 1; }
.log-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.log-title { margin: 0; font-size: 1rem; font-weight: 600; color: #fff; }
.log-time { font-size: 0.75rem; color: #666; white-space: nowrap; }
.log-message { margin: 0; font-size: 0.9rem; color: #ccc; line-height: 1.4; }
.log-subtext { display: block; margin-top: 6px; font-size: 0.8rem; color: #888; font-style: italic; }

/* ANIMACIONES */
.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
</style>