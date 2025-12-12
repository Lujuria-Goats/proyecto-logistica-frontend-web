<template>
  <div class="drivers-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Gestión de Flota</h1>
      <p class="subtitle">Administración de conductores</p>
    </header>

    <!-- PANEL PRINCIPAL -->
    <div class="main-panel">

      <!-- SECCIÓN BUSCADOR (MODIFICADA: INPUT + BOTÓN) -->
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
          <!-- BOTÓN PARA CONTRATAR DIRECTAMENTE -->
          <button class="btn-action-hire" @click="handleManualHire">
            Contratar
          </button>
        </div>

        <!-- DIV DE ADVERTENCIA (SOLO SI HAY ERROR) -->
        <transition name="fade">
          <div v-if="searchMessage" :class="['message-box', messageType]">
            {{ searchMessage }}
          </div>
        </transition>
      </div>

      <!-- SECCIÓN LISTA (MIS CONDUCTORES) -->
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

      <!-- MODAL 2: CONFIRMACIÓN DESVINCULACIÓN -->
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
              
              <div class="modal-actions">
                <button class="btn-cancel" @click="cancelFire">Cancelar</button>
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
      
      // Buscador manual
      searchPhone: "",
      searchMessage: "", // Mensaje de error o info
      messageType: "",   // 'error' o 'info'
      
      // Modales
      showHireModal: false,
      driverToHire: null,
      showFireModal: false,
      driverToFire: null,
      
      // Datos
      isLoadingMyDrivers: false,
      myDrivers: [],       
      allMarketDrivers: [], // Se carga para validar si el número existe
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

    // --- CARGAS DE DATOS ---
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

    // --- LOGICA DEL BOTÓN DE BUSQUEDA/CONTRATAR ---
    handleManualHire() {
      // 1. Limpiar mensajes previos
      this.searchMessage = "";
      this.messageType = "";

      if (!this.searchPhone.trim()) {
        this.searchMessage = "Por favor ingrese un número de teléfono.";
        this.messageType = "error";
        return;
      }

      const term = this.searchPhone.trim();

      // 2. Verificar si ya es mío
      const isMine = this.myDrivers.find(d => d.phone === term);
      if (isMine) {
        this.searchMessage = `El conductor ${isMine.name} ya pertenece a tu flota.`;
        this.messageType = "info";
        return;
      }

      // 3. Verificar si existe en el mercado
      // NOTA: Comparamos el número exacto o si está contenido, según prefieras.
      // Aquí uso includes para ser flexible, pero si quieres exacto usa ===
      const candidate = this.allMarketDrivers.find(d => d.phone === term);

      if (candidate) {
        // SI EXISTE: Abrir modal
        this.driverToHire = candidate;
        this.showHireModal = true;
      } else {
        // NO EXISTE: Mostrar advertencia en el div
        this.searchMessage = "No hay ningún conductor registrado con ese número.";
        this.messageType = "error";
      }
    },

    // --- LOGICA CONFIRMAR CONTRATACIÓN ---
    cancelHire() {
      this.showHireModal = false;
      this.driverToHire = null;
    },
    async confirmHire() {
      if (!this.driverToHire) return;
      const btn = document.querySelectorAll('.btn-confirm')[0]; 
      if (btn) { btn.innerText = "..."; btn.disabled = true; }
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Drivers/link`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: this.driverToHire.phone })
        });
        
        if (!res.ok) throw new Error("No se pudo vincular.");
        
        // Agregar a mis conductores y limpiar
        this.myDrivers.push(this.driverToHire);
        this.searchPhone = "";
        this.searchMessage = "Conductor vinculado exitosamente.";
        this.messageType = "info"; // Usamos estilo info para éxito temporal
        
        // Borrar mensaje de éxito después de 3 seg
        setTimeout(() => { 
            if(this.messageType === 'info') this.searchMessage = ""; 
        }, 3000);

        this.cancelHire();
      } catch (e) { 
        alert("⚠️ Error: " + e.message); 
      } finally { 
        if (btn) { btn.innerText = "Sí, Contratar"; btn.disabled = false; } 
      }
    },

    // --- LOGICA DESVINCULAR ---
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
      const btn = document.querySelector('.btn-danger-mode');
      if (btn) { btn.innerText = "..."; btn.disabled = true; }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Drivers/${this.driverToFire.id}`, {
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al eliminar");

        this.myDrivers = this.myDrivers.filter(d => d.id !== this.driverToFire.id);
        this.cancelFire(); 

      } catch (e) { 
        alert("⚠️ Error: " + e.message); 
      } finally {
        if (btn) { btn.innerText = "Sí, Desvincular"; btn.disabled = false; }
      }
    },

    // Helper normalización
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
/* ============= ESTRUCTURA MAESTRA ============= */
.drivers-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 5vh; 
  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  background: transparent;
}

.page-header {
  flex-shrink: 0;
  margin-bottom: 20px;
  text-align: center;
}
.page-title { margin: 0; font-size: 1.8rem; color: #d4af37; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.subtitle { margin: 5px 0 0; font-size: 0.9rem; color: #888; }

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

/* ============= SECCIÓN BUSCADOR (NUEVO DISEÑO) ============= */
.search-section {
  flex-shrink: 0;
  padding: 25px 30px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0) 100%);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  z-index: 20;
}

.input-group {
  display: flex;
  gap: 15px;
  align-items: stretch;
  width: 100%;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.main-search-input {
  width: 100%;
  height: 100%;
  padding: 12px 14px 12px 45px;
  background: #080808;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s;
}
.main-search-input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.15);
}

.search-icon { 
  position: absolute; left: 15px; top: 50%; transform: translateY(-50%); 
  font-size: 1.1rem; opacity: 0.6; pointer-events: none; 
}

/* BOTÓN DE ACCIÓN LATERAL */
.btn-action-hire {
  padding: 0 25px;
  background: linear-gradient(90deg, #d4af37, #b8860b);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(212,175,55,0.25);
  white-space: nowrap;
}
.btn-action-hire:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(212,175,55,0.4);
}
.btn-action-hire:active {
  transform: translateY(0);
}

/* MENSAJE DE ADVERTENCIA / ERROR */
.message-box {
  margin-top: 15px;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
}
.message-box.error {
  background: rgba(220, 50, 50, 0.15);
  border: 1px solid rgba(220, 50, 50, 0.4);
  color: #ff8888;
}
.message-box.info {
  background: rgba(50, 100, 220, 0.15);
  border: 1px solid rgba(50, 100, 220, 0.4);
  color: #88ccff;
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
.modal-details-confirm { background: #222; border-radius: 6px; padding: 10px; margin: 15px 0; color: #d4af37; font-weight: bold; }

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