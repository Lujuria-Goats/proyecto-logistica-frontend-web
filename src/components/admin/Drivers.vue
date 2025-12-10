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
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchPhone" placeholder="Buscar conductor por teléfono para contratar..."
            class="main-search-input" @focus="showSuggestions = true" @blur="hideSuggestionsDelay" />

          <!-- SUGERENCIAS -->
          <transition name="fade">
            <div v-if="searchPhone && recommendedDrivers.length > 0" class="suggestions-dropdown">
              <div class="suggestion-header">Resultados ({{ recommendedDrivers.length }})</div>
              <div v-for="driver in recommendedDrivers" :key="driver.id" class="suggestion-item">
                <div class="suggestion-info">
                  <span class="mini-icon">👤</span>
                  <div>
                    <p class="sug-name">{{ driver.name }}</p>
                    <p class="sug-phone">{{ driver.phone }}</p>
                  </div>
                </div>
                <!-- Botón abre modal de contratación -->
                <button class="btn-quick-hire" @mousedown.prevent="prepareHire(driver)">
                  Contratar
                </button>
              </div>
            </div>
          </transition>

          <!-- SIN RESULTADOS -->
          <div v-if="searchPhone && recommendedDrivers.length === 0 && !isLoadingMarket" class="no-results">
            No encontrado / Ya contratado
          </div>
        </div>
      </div>

      <!-- SECCIÓN LISTA -->
      <div class="list-wrapper">
        <div class="list-header-row">
          <h2 class="panel-subtitle">Mis Conductores</h2>
          <span class="badge">{{ myDrivers.length }} activos</span>
        </div>

        <div class="scroll-area">
          <!-- LOADING -->
          <div v-if="isLoadingMyDrivers" class="state-msg">
            <div class="spinner"></div> Cargando...
          </div>

          <!-- EMPTY -->
          <div v-else-if="myDrivers.length === 0" class="state-msg">
            No tienes conductores contratados.
          </div>

          <!-- CARDS GRID -->
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
              <!-- BOTÓN DESVINCULAR (Abre Modal) -->
              <button class="btn-delete" @click="fireDriver(driver)">✕ Desvincular</button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- TELEPORT PARA MODALES -->
    <teleport to="body">
      
      <!-- MODAL 1: CONFIRMACIÓN CONTRATACIÓN -->
      <transition name="fade">
        <div v-if="showHireModal" class="modal-overlay" @click.self="cancelHire">
          <div class="modal-container">
            <div class="modal-content">
              <div class="modal-icon">🤝</div>
              <h3 class="modal-title">Confirmar Contratación</h3>
              <p>¿Deseas vincular a <strong>{{ driverToHire?.name }}</strong> a tu flota?</p>
              <div class="modal-actions">
                <button class="btn-cancel" @click="cancelHire">Cancelar</button>
                <button class="btn-confirm" @click="confirmHire">Sí, Contratar</button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL 2: CONFIRMACIÓN DESVINCULACIÓN (NUEVO) -->
      <transition name="fade">
        <div v-if="showFireModal" class="modal-overlay" @click.self="cancelFire">
          <div class="modal-container">
            <div class="modal-content">
              <div class="modal-icon">⚠️</div>
              <h3 class="modal-title">Desvincular Conductor</h3>
              <p>
                ¿Estás seguro de eliminar a <br>
                <strong>{{ driverToFire?.name }}</strong> de tu lista?
              </p>
              <p class="modal-warning-text">Esta acción removerá el acceso del conductor a tus pedidos.</p>
              
              <div class="modal-actions">
                <button class="btn-cancel" @click="cancelFire">Cancelar</button>
                <!-- Botón con estilo consistente -->
                <button class="btn-confirm btn-danger-mode" @click="confirmFire">Sí, Desvincular</button>
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
      
      // Buscador
      searchPhone: "",
      showSuggestions: false,
      
      // Modal Contratar
      showHireModal: false,
      driverToHire: null,

      // Modal Desvincular
      showFireModal: false,
      driverToFire: null,
      
      // Datos
      isLoadingMyDrivers: false,
      isLoadingMarket: false,
      myDrivers: [],       
      allMarketDrivers: [], 
    };
  },
  computed: {
    recommendedDrivers() {
      if (!this.searchPhone) return [];
      const term = this.searchPhone.trim().toLowerCase();
      const myIds = new Set(this.myDrivers.map(d => d.id));
      
      return this.allMarketDrivers.filter(driver => {
        if (myIds.has(driver.id)) return false;
        return driver.phone.includes(term);
      }).slice(0, 5);
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.fetchMyDrivers();
      this.fetchMarketDrivers();
    },

    // --- CARGAS ---
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
      this.isLoadingMarket = true;
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
      finally { this.isLoadingMarket = false; }
    },

    // --- LOGICA CONTRATAR ---
    prepareHire(driver) {
      this.driverToHire = driver;
      this.showHireModal = true;
      this.showSuggestions = false;
    },
    cancelHire() {
      this.showHireModal = false;
      this.driverToHire = null;
    },
    async confirmHire() {
      if (!this.driverToHire) return;
      const btn = document.querySelectorAll('.btn-confirm')[0]; // El primer btn confirm (hack visual simple)
      if (btn) { btn.innerText = "..."; btn.disabled = true; }
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Drivers/link`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: this.driverToHire.phone })
        });
        
        if (!res.ok) throw new Error("Error al contratar");
        
        this.myDrivers.push(this.driverToHire);
        this.searchPhone = "";
        this.cancelHire();
      } catch (e) { alert("⚠️ " + e.message); }
      finally { 
        if (btn) { btn.innerText = "Sí, Contratar"; btn.disabled = false; } 
      }
    },

    // --- LOGICA DESVINCULAR (CON MODAL) ---
    fireDriver(driver) {
      this.driverToFire = driver;
      this.showFireModal = true;
    },
    cancelFire() {
      this.showFireModal = false;
      this.driverToFire = null;
    },
    async confirmFire() {
      if (!this.driverToFire) return;
      
      // Feedback visual en el botón del modal
      const btn = document.querySelector('.btn-danger-mode');
      if (btn) { btn.innerText = "..."; btn.disabled = true; }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Drivers/${this.driverToFire.id}`, {
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || "Error al eliminar");
        }

        // Éxito: Actualizar listas localmente
        const removedDriver = this.driverToFire;
        this.myDrivers = this.myDrivers.filter(d => d.id !== removedDriver.id);
        
        // Devolver al mercado
        const exists = this.allMarketDrivers.find(d => d.id === removedDriver.id);
        if(!exists) {
            this.allMarketDrivers.push(removedDriver);
        }

        this.cancelFire(); // Cerrar modal

      } catch (e) { 
        console.error(e);
        alert("⚠️ Error: " + e.message); 
      } finally {
        if (btn) { btn.innerText = "Sí, Desvincular"; btn.disabled = false; }
      }
    },

    // Helpers
    normalize(data) {
      return data.map(d => ({
        id: d.id || d.Id || 0,
        name: d.fullName || d.name || d.userName || "Usuario",
        phone: d.phoneNumber || d.phone || "",
        description: d.description || d.email || "Conductor"
      }));
    },
    hideSuggestionsDelay() { setTimeout(() => { this.showSuggestions = false; }, 200); }
  }
};
</script>

<style scoped>
/* ============= ESTRUCTURA MAESTRA (IGUAL A ASSIGN ROUTES) ============= */
.drivers-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  /* Ajuste visual vertical */
  padding-bottom: 5vh; 
  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  background: transparent;
}

/* Header */
.page-header {
  flex-shrink: 0;
  margin-bottom: 20px;
  text-align: center;
}
.page-title { margin: 0; font-size: 1.8rem; color: #d4af37; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.subtitle { margin: 5px 0 0; font-size: 0.9rem; color: #888; }

/* ============= PANEL PRINCIPAL (TAMAÑO AUMENTADO) ============= */
.main-panel {
  width: 100%;
  max-width: 1150px; 
  height: auto;
  max-height: 85vh;
  min-height: 600px;
  
  display: flex;
  flex-direction: column;
  
  background: rgba(15, 12, 8, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px rgba(0,0,0,0.8);
  overflow: hidden;
}

/* ============= SECCIÓN BUSCADOR (FIJA ARRIBA) ============= */
.search-section {
  flex-shrink: 0;
  padding: 25px 30px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0) 100%);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  z-index: 20;
}

.search-wrapper { position: relative; display: flex; align-items: center; }

.main-search-input {
  width: 100%;
  padding: 14px 14px 14px 45px;
  background: #080808;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s;
}
.main-search-input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
}

.search-icon { position: absolute; left: 15px; font-size: 1.1rem; opacity: 0.6; pointer-events: none; }

/* SUGERENCIAS DROPDOWN */
.suggestions-dropdown {
  position: absolute; top: 100%; left: 0; right: 0;
  background: #111; border: 1px solid #d4af37; border-radius: 0 0 8px 8px;
  margin-top: 5px; max-height: 220px; overflow-y: auto;
  box-shadow: 0 15px 40px rgba(0,0,0,0.95);
}
.suggestion-header { padding: 8px 15px; font-size: 0.75rem; color: #888; background: #050505; }
.suggestion-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px; border-bottom: 1px solid #222; transition: background 0.2s;
}
.suggestion-item:hover { background: rgba(212, 175, 55, 0.15); }
.suggestion-info { display: flex; align-items: center; gap: 12px; }
.mini-icon { font-size: 1.4rem; }
.sug-name { margin: 0; font-size: 0.95rem; font-weight: bold; color: #fff; }
.sug-phone { margin: 0; font-size: 0.85rem; color: #d4af37; }
.btn-quick-hire {
  background: #d4af37; border: none; padding: 6px 14px; border-radius: 6px; 
  font-weight: bold; font-size: 0.8rem; cursor: pointer; color: #000;
}
.btn-quick-hire:hover { background: #ffdb60; }
.no-results {
  position: absolute; top: 100%; left: 0; background: #222; color: #aaa;
  padding: 10px; font-size: 0.9rem; border-radius: 6px; margin-top: 8px; border: 1px solid #444;
}

/* ============= LISTA Y SCROLL ============= */
.list-wrapper {
  flex: 1; 
  display: flex; flex-direction: column;
  padding: 0 30px 30px 30px;
  min-height: 0; 
}

.list-header-row {
  flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 0 15px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.panel-subtitle { margin: 0; color: #d4af37; font-size: 1.2rem; }
.badge { background: rgba(212,175,55,0.15); color: #d4af37; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; }

.scroll-area {
  flex: 1; 
  overflow-y: auto;
  margin-top: 15px;
  padding-right: 10px;
  background: rgba(0, 0, 0, 0.2); 
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.02);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 15px;
  padding: 10px;
}

.driver-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.2s ease;
}
.driver-card:hover { 
  background: rgba(255,255,255,0.06); 
  border-color: rgba(212, 175, 55, 0.4); 
  transform: translateY(-2px);
}

.card-content { display: flex; align-items: flex-start; gap: 12px; }
.driver-photo {
  width: 44px; height: 44px; border-radius: 50%; background: #1a1a1a; border: 2px solid #d4af37; flex-shrink: 0;
}
.driver-details { flex: 1; overflow: hidden; }
.driver-name { margin: 0 0 4px 0; font-size: 1rem; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
.detail-row { font-size: 0.85rem; color: #ccc; margin-bottom: 2px; }
.desc { color: #888; font-style: italic; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Botón Desvincular */
.btn-delete {
  align-self: flex-end; width: 100%; text-align: center;
  background: rgba(200, 50, 50, 0.08); border: 1px solid rgba(200, 50, 50, 0.3);
  color: #ff6b6b; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: 0.2s;
}
.btn-delete:hover { background: rgba(200, 50, 50, 0.25); border-color: #ff4444; color: #fff; }

.state-msg { 
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: #666; 
}
.spinner { width: 30px; height: 30px; border: 3px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
@keyframes spin { to {transform: rotate(360deg);} }

/* MODAL GLOBAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
  backdrop-filter: blur(5px);
}
.modal-content {
  background: #141414; border: 1px solid #d4af37; padding: 30px; border-radius: 12px; width: 350px; text-align: center;
  box-shadow: 0 30px 60px rgba(0,0,0,1);
}
.modal-icon { font-size: 2.5rem; margin-bottom: 15px; }
.modal-title { margin: 0 0 10px; color: #d4af37; font-size: 1.4rem; }
.modal-warning-text { color: #888; font-size: 0.85rem; margin: 10px 0 0 0; }

.modal-actions { margin-top: 25px; display: flex; gap: 15px; justify-content: center; }
.btn-cancel { background: transparent; border: 1px solid #666; color: #ccc; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-cancel:hover { border-color: #fff; color: #fff; }
.btn-confirm { background: #d4af37; border: none; color: #000; font-weight: bold; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-confirm:hover { background: #ffdb60; }

/* Scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; border: 2px solid transparent; background-clip: content-box; }
::-webkit-scrollbar-thumb:hover { background-color: #d4af37; }

/* Animaciones */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>