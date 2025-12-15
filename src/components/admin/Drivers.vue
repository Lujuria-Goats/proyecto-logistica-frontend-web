<template>
  <div class="drivers-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Gestión de Flota</h1>
      <p class="subtitle">Administración de conductores</p>
    </header>

    <!-- PANEL PRINCIPAL -->
    <div class="main-panel">

      <!-- SECCIÓN BUSCADOR -->
      <div class="search-section">
        <div class="input-group">
          <div class="input-wrapper">
            <span class="search-icon">📞</span>
            <input 
              type="text" 
              v-model="searchPhone" 
              placeholder="Número de celular completo..."
              class="main-search-input" 
              @keyup.enter="handleManualHire"
            />
          </div>
          <button class="btn-action-hire" @click="handleManualHire">
            Contratar
          </button>
        </div>

        <transition name="fade">
          <div v-if="searchMessage" :class="['message-box', messageType]">
            {{ searchMessage }}
          </div>
        </transition>
      </div>

      <!-- SECCIÓN LISTA -->
      <div class="list-wrapper">
        <div class="list-header-row">
          <h2 class="panel-subtitle">Mis Conductores</h2>
          <span class="badge">{{ myDrivers.length }} activos</span>
        </div>

        <div class="scroll-area">
          <div v-if="isLoadingMyDrivers" class="state-msg">
            <div class="spinner"></div> Cargando...
          </div>
          <div v-else-if="myDrivers.length === 0" class="state-msg">
            No tienes conductores contratados.
          </div>

          <div v-else class="cards-grid">
            <div v-for="driver in myDrivers" :key="driver.id" class="driver-card">
              <div class="card-content">
                <div class="driver-photo"></div>
                <div class="driver-details">
                  <h3 class="driver-name">{{ driver.name }}</h3>
                  <div class="detail-row">📞 {{ driver.phone }}</div>
                  <div class="detail-row desc">{{ driver.description }}</div>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="btn-card btn-routes" @click="viewRoutes(driver)">
                  📍 Rutas
                </button>
                <button class="btn-card btn-delete" @click="fireDriver(driver)">
                  ✕ Desvincular
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- TELEPORT PARA MODALES -->
    <teleport to="body">
      
      <!-- MODAL CONTRATAR -->
      <transition name="fade">
        <div v-if="showHireModal" class="modal-overlay" @click.self="cancelHire">
          <div class="modal-container">
            <div class="modal-content">
              <div class="modal-icon">🤝</div>
              <h3 class="modal-title">Confirmar Contratación</h3>
              <p>¿Deseas vincular a <strong>{{ driverToHire?.name }}</strong> a tu flota?</p>
              <div class="modal-details-confirm">
                <p>📞 {{ driverToHire?.phone }}</p>
              </div>
              <div class="modal-actions">
                <button class="btn-cancel" @click="cancelHire">Cancelar</button>
                <button class="btn-confirm" @click="confirmHire">Sí, Contratar</button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL DESVINCULAR -->
      <transition name="fade">
        <div v-if="showFireModal" class="modal-overlay" @click.self="cancelFire">
          <div class="modal-container">
            <div class="modal-content">
              <div class="modal-icon">⚠️</div>
              <h3 class="modal-title">Desvincular Conductor</h3>
              <p>¿Seguro que deseas eliminar a <strong>{{ driverToFire?.name }}</strong>?</p>
              <div class="modal-actions">
                <button class="btn-cancel" @click="cancelFire">Cancelar</button>
                <button class="btn-confirm btn-danger-mode" @click="confirmFire">Sí, Desvincular</button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL RUTAS (SOLO RESUMEN) -->
      <transition name="fade">
        <div v-if="showRoutesModal" class="modal-overlay" @click.self="closeRoutesModal">
          <div class="modal-container">
            <div class="modal-content modal-routes"> 
              
              <div class="modal-header-simple">
                <div class="header-text">
                  <h3 class="modal-title-left">Rutas de {{ selectedDriverName }}</h3>
                  <small class="modal-sub">Mostrando {{ driverRoutes.length }} rutas asignadas</small>
                </div>
                <button class="close-x" @click="closeRoutesModal">✕</button>
              </div>
              
              <div class="routes-list-area expanded-area">
                
                <!-- Loading -->
                <div v-if="isLoadingRoutes" class="spinner-wrapper">
                  <div class="spinner-small"></div>
                  <span>Cargando lista de rutas...</span>
                </div>

                <!-- Empty -->
                <div v-else-if="driverRoutes.length === 0" class="empty-routes">
                  <span>📭</span>
                  <p>No tiene rutas asignadas.</p>
                </div>

                <!-- Lista de Rutas (Tarjetas compactas) -->
                <div v-else class="routes-container">
                  <div v-for="route in driverRoutes" :key="route.id" class="route-block compact">
                    
                    <div class="rb-left">
                      <span class="route-icon-large">🗺️</span>
                      <div class="rb-titles">
                        <span class="rb-name">{{ route.routeName || 'Ruta #' + route.id }}</span>
                        <!-- Estado -->
                        <span class="rb-status" :class="route.isActive ? 'st-active' : 'st-done'">
                          {{ route.isActive ? 'En Curso' : 'Finalizada' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="rb-right">
                      <div class="stat-group">
                        <span class="stat-val">{{ route.orderCount || (route.orderIds ? route.orderIds.length : 0) }}</span>
                        <span class="stat-label">Pedidos</span>
                      </div>
                      <div class="stat-id">
                        ID: #{{ route.id }}
                      </div>
                    </div>

                  </div>
                </div>
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
  name: "DriversPage",
  data() {
    return {
      baseUrl: 'https://service.lujuria.crudzaso.com',
      
      searchPhone: "",
      searchMessage: "", 
      messageType: "",
      
      showHireModal: false,
      driverToHire: null,
      showFireModal: false,
      driverToFire: null,

      // Rutas
      showRoutesModal: false,
      driverRoutes: [],
      isLoadingRoutes: false,
      selectedDriverName: "",
      
      isLoadingMyDrivers: false,
      myDrivers: [],       
      allMarketDrivers: [], 
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.fetchMyDrivers();
      this.fetchMarketDrivers();
    },

    // --- CARGAS PRINCIPALES ---
    async fetchMyDrivers() {
      this.isLoadingMyDrivers = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${this.baseUrl}/api/Drivers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          let list = Array.isArray(data) ? data : (data.drivers || data.data || []);
          this.myDrivers = this.normalize(list);
        }
      } catch (e) { console.error(e); }
      finally { this.isLoadingMyDrivers = false; }
    },

    async fetchMarketDrivers() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Users/drivers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          let list = Array.isArray(data) ? data : (data.drivers || data.data || []);
          this.allMarketDrivers = this.normalize(list);
        }
      } catch (e) { console.error(e); }
    },

    // ==============================================================
    // LÓGICA DE RUTAS (SIMPLIFICADA)
    // ==============================================================
    async viewRoutes(driver) {
      this.selectedDriverName = driver.name;
      this.driverRoutes = [];
      this.isLoadingRoutes = true;
      this.showRoutesModal = true;

      try {
        const token = localStorage.getItem('token');
        const url = `${this.baseUrl}/api/Drivers/${driver.id}/routes`;
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Solo guardamos las rutas tal cual vienen del endpoint, sin buscar detalles
          this.driverRoutes = data.routes || [];
        } else {
          console.error("Error al cargar rutas");
        }
      } catch (error) {
        console.error("Error Fetch:", error);
      } finally {
        this.isLoadingRoutes = false;
      }
    },

    closeRoutesModal() {
      this.showRoutesModal = false;
      this.driverRoutes = [];
    },

    // --- OTROS MÉTODOS ---
    handleManualHire() {
      this.searchMessage = "";
      if (!this.searchPhone.trim()) {
        this.searchMessage = "Ingrese un número."; this.messageType = "error"; return;
      }
      const term = this.searchPhone.trim();
      const isMine = this.myDrivers.find(d => d.phone === term);
      if (isMine) {
        this.searchMessage = "Ya pertenece a tu flota."; this.messageType = "info"; return;
      }
      const candidate = this.allMarketDrivers.find(d => d.phone === term);
      if (candidate) {
        this.driverToHire = candidate; this.showHireModal = true;
      } else {
        this.searchMessage = "Conductor no encontrado."; this.messageType = "error";
      }
    },
    cancelHire() { this.showHireModal = false; this.driverToHire = null; },
    async confirmHire() {
      if (!this.driverToHire) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Drivers/link`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: this.driverToHire.phone })
        });
        if (!res.ok) throw new Error("Error al vincular");
        this.myDrivers.push(this.driverToHire);
        this.searchMessage = "Vinculado con éxito."; this.messageType = "info";
        setTimeout(() => this.searchMessage = "", 3000);
        this.cancelHire();
      } catch (e) { alert(e.message); }
    },
    fireDriver(driver) { this.driverToFire = driver; this.showFireModal = true; },
    cancelFire() { this.showFireModal = false; this.driverToFire = null; },
    async confirmFire() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Drivers/${this.driverToFire.id}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al desvincular");
        this.myDrivers = this.myDrivers.filter(d => d.id !== this.driverToFire.id);
        this.cancelFire();
      } catch (e) { alert(e.message); }
    },
    normalize(data) {
      return data.map(d => ({
        id: d.id || d.Id || 0,
        name: d.fullName || d.name || d.userName || "Usuario",
        phone: d.phoneNumber || d.phone || "",
        description: d.description || d.email || "Conductor"
      }));
    }
  }
};
</script>

<style scoped>
/* ============= ESTILOS BASE ============= */
.drivers-page {
  width: 100%; height: 100vh; overflow: hidden; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding-bottom: 5vh; 
  padding-left: 20px; padding-right: 20px; box-sizing: border-box; background: transparent;
}
.page-header { flex-shrink: 0; margin-bottom: 20px; text-align: center; }
.page-title { margin: 0; font-size: 1.8rem; color: #d4af37; }
.subtitle { margin: 5px 0 0; font-size: 0.9rem; color: #888; }

.main-panel {
  width: 100%; max-width: 1150px; height: auto; max-height: 85vh; min-height: 600px;
  display: flex; flex-direction: column; background: rgba(15, 12, 8, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 16px;
  backdrop-filter: blur(12px); box-shadow: 0 30px 80px rgba(0,0,0,0.8); overflow: hidden;
}

/* Buscador */
.search-section {
  flex-shrink: 0; padding: 25px 30px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0) 100%);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}
.input-group { display: flex; gap: 15px; width: 100%; }
.input-wrapper { position: relative; flex: 1; }
.main-search-input {
  width: 100%; height: 100%; padding: 12px 14px 12px 45px; background: #080808;
  border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 1rem; box-sizing: border-box;
}
.main-search-input:focus { outline: none; border-color: #d4af37; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; opacity: 0.6; pointer-events: none; }
.btn-action-hire {
  padding: 0 25px; background: linear-gradient(90deg, #d4af37, #b8860b); border: none;
  border-radius: 8px; color: #000; font-weight: 800; font-size: 1rem; cursor: pointer;
  white-space: nowrap; transition: 0.2s;
}
.btn-action-hire:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(212,175,55,0.4); }

.message-box { margin-top: 15px; padding: 12px; border-radius: 6px; font-size: 0.9rem; text-align: center; }
.message-box.error { background: rgba(220, 50, 50, 0.15); border: 1px solid rgba(220, 50, 50, 0.4); color: #ff8888; }
.message-box.info { background: rgba(50, 100, 220, 0.15); border: 1px solid rgba(50, 100, 220, 0.4); color: #88ccff; }

/* Lista */
.list-wrapper { flex: 1; display: flex; flex-direction: column; padding: 0 30px 30px 30px; min-height: 0; }
.list-header-row { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; padding: 20px 0 15px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.panel-subtitle { margin: 0; color: #d4af37; font-size: 1.2rem; }
.badge { background: rgba(212,175,55,0.15); color: #d4af37; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; }

.scroll-area { flex: 1; overflow-y: auto; margin-top: 15px; padding-right: 10px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; padding: 10px; }

/* Tarjetas */
.driver-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: 0.2s; }
.driver-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(212, 175, 55, 0.4); transform: translateY(-2px); }
.card-content { display: flex; align-items: flex-start; gap: 12px; }
.driver-photo { width: 44px; height: 44px; border-radius: 50%; background: #1a1a1a; border: 2px solid #d4af37; flex-shrink: 0; }
.driver-details { flex: 1; overflow: hidden; }
.driver-name { margin: 0 0 4px 0; color: #fff; font-weight: 600; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.detail-row { font-size: 0.85rem; color: #ccc; }
.desc { color: #888; font-style: italic; }

.card-actions { display: flex; gap: 8px; margin-top: auto; }
.btn-card { flex: 1; border-radius: 6px; padding: 8px 5px; font-size: 0.8rem; cursor: pointer; transition: 0.2s; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.btn-routes { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); color: #d4af37; }
.btn-routes:hover { background: rgba(212, 175, 55, 0.25); color: #fff; }
.btn-delete { background: rgba(200, 50, 50, 0.08); border: 1px solid rgba(200, 50, 50, 0.3); color: #ff6b6b; }
.btn-delete:hover { background: rgba(200, 50, 50, 0.25); color: #fff; }

.state-msg { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; }
.spinner { width: 30px; height: 30px; border: 3px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
@keyframes spin { to {transform: rotate(360deg);} }

/* MODALES */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(5px); }
.modal-content { background: #141414; border: 1px solid #d4af37; padding: 30px; border-radius: 12px; width: 350px; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,1); display: flex; flex-direction: column; }
.modal-icon { font-size: 2.5rem; margin-bottom: 15px; }
.modal-title { margin: 0 0 10px; color: #d4af37; font-size: 1.4rem; }
.modal-details-confirm { background: #222; border-radius: 6px; padding: 10px; margin: 15px 0; color: #d4af37; font-weight: bold; }
.modal-actions { margin-top: 25px; display: flex; gap: 15px; justify-content: center; }
.btn-cancel { background: transparent; border: 1px solid #666; color: #ccc; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-cancel:hover { border-color: #fff; color: #fff; }
.btn-confirm { background: #d4af37; border: none; color: #000; font-weight: bold; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-confirm:hover { background: #ffdb60; }

/* MODAL RUTAS */
.modal-routes {
  width: 95%; max-width: 900px; padding: 0; height: 80vh; text-align: left;
}
.modal-header-simple {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); background: #0f0c08;
}
.modal-title-left { margin: 0; color: #d4af37; font-size: 1.3rem; }
.modal-sub { color: #666; display: block; margin-top: 4px; font-size: 0.85rem; }
.close-x { background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; }
.close-x:hover { color: #fff; }

.expanded-area { flex: 1; background: #111; overflow-y: auto; padding: 20px; }
.spinner-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100px; color: #666; gap: 10px; }
.spinner-small { width: 24px; height: 24px; border: 2px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
.empty-routes { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; gap: 10px; }
.empty-routes span { font-size: 2rem; opacity: 0.5; }

/* DISEÑO DE BLOQUE DE RUTA COMPACTO */
.routes-container { display: flex; flex-direction: column; gap: 15px; }

.route-block.compact {
  background: rgba(255,255,255,0.03); 
  border: 1px solid rgba(212,175,55,0.15); 
  border-radius: 8px; 
  padding: 15px 20px;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  transition: background 0.2s;
}
.route-block.compact:hover {
  background: rgba(255,255,255,0.05);
}

.rb-left { display: flex; align-items: center; gap: 15px; }
.route-icon-large { font-size: 2rem; }
.rb-titles { display: flex; flex-direction: column; gap: 4px; }
.rb-name { font-weight: bold; color: #fff; font-size: 1.1rem; }
.rb-status { font-size: 0.8rem; padding: 3px 8px; border-radius: 4px; display: inline-block; width: fit-content; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
.st-active { background: rgba(50, 200, 100, 0.2); color: #4eff88; }
.st-done { background: rgba(100, 100, 100, 0.3); color: #ccc; }

.rb-right { text-align: right; display: flex; flex-direction: column; gap: 5px; align-items: flex-end; }
.stat-group { display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); }
.stat-val { font-size: 1.1rem; font-weight: bold; color: #d4af37; }
.stat-label { font-size: 0.8rem; color: #aaa; text-transform: uppercase; }
.stat-id { font-family: monospace; color: #555; font-size: 0.8rem; }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #d4af37; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>