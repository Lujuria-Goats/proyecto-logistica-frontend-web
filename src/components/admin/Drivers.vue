<template>
  <div class="drivers-page">

    <!-- HEADER SUPERIOR (Fijo) -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Gestión de Conductores</h1>
        <p class="subtitle">Administración de flota y nuevas contrataciones</p>
      </div>
      <button class="btn-add" @click="openModal">
        + Registrar Nuevo
      </button>
    </div>

    <!-- LAYOUT DE DOS COLUMNAS -->
    <div class="split-layout">
      
      <!-- IZQUIERDA: MIS CONDUCTORES -->
      <div class="panel-section left-panel">
        <header class="panel-header">
          <h2 class="panel-title">🚩 Mis Conductores</h2>
          <span class="badge">{{ myDrivers.length }} activos</span>
        </header>

        <div class="scroll-container">
          <div v-if="myDrivers.length === 0" class="empty-state">
            No tienes conductores asignados.
          </div>

          <div class="cards-list">
            <div
              v-for="driver in myDrivers"
              :key="driver.id"
              class="driver-card my-driver-card"
            >
              <div class="driver-header">
                <div class="driver-photo"></div>
                <div>
                  <h3 class="driver-name">{{ driver.name }}</h3>
                  <p class="driver-id">ID: {{ driver.id }}</p>
                </div>
              </div>

              <div class="driver-info">
                <p><strong>Tel:</strong> {{ driver.phone }}</p>
                <p class="desc-text">{{ driver.description }}</p>
              </div>

              <div class="driver-actions">
                <button class="btn-delete" @click="fireDriver(driver)">Desvincular</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DERECHA: MERCADO (API REMOTA) -->
      <div class="panel-section right-panel">
        <header class="panel-header">
          <h2 class="panel-title">🤝 Contratar Conductores</h2>
          <span v-if="!isLoading" class="badge-outline">{{ filteredHireableDrivers.length }} disponibles</span>
        </header>

        <!-- Input fijo -->
        <div class="search-bar-container">
          <input 
            type="text" 
            v-model="filterText" 
            placeholder="🔍 Buscar por nombre o teléfono..." 
            class="search-input"
            :disabled="isLoading"
          />
        </div>

        <div class="scroll-container">
          
          <!-- LOADING STATE -->
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Conectando con el servidor...</p>
          </div>

          <!-- ERROR STATE -->
          <div v-else-if="errorMsg" class="error-state">
            <p>⚠️ {{ errorMsg }}</p>
            <button class="btn-retry" @click="fetchDrivers">Reintentar</button>
          </div>

          <!-- EMPTY STATE -->
          <div v-else-if="filteredHireableDrivers.length === 0" class="empty-state">
            No se encontraron conductores disponibles.
          </div>

          <!-- LISTA DESDE API -->
          <div v-else class="cards-list">
            <div
              v-for="driver in filteredHireableDrivers"
              :key="driver.id"
              class="driver-card hireable-card"
            >
              <div class="driver-header">
                <div class="driver-photo available-photo"></div>
                <div>
                  <h3 class="driver-name">{{ driver.name }}</h3>
                  <p class="driver-id">ID: {{ driver.id }}</p>
                </div>
              </div>

              <div class="driver-info">
                <p><strong>Tel:</strong> {{ driver.phone }}</p>
                <p class="desc-text">{{ driver.description }}</p>
              </div>

              <div class="driver-actions">
                <button class="btn-hire" @click="hireDriver(driver)">Contratar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <div class="modal-card" ref="modalCard" tabindex="-1">
              <header class="modal-header">
                <h2 class="modal-title">Registrar Nuevo Conductor</h2>
                <button class="modal-close-x" @click="closeModal">✕</button>
              </header>
              <div class="modal-body">
                <div class="form-group">
                  <label>Buscar en base de datos (Teléfono)</label>
                  <input type="text" v-model="searchPhone" @input="searchByPhone" class="input-field" placeholder="Ej: 300123..."/>
                </div>
                <div v-if="searchResult" class="search-result" @click="selectSearchedDriver">
                  <div class="result-photo"></div>
                  <div>
                    <p class="result-name">{{ searchResult.name }}</p>
                    <p class="result-phone">📞 {{ searchResult.phone }}</p>
                  </div>
                </div>
                <hr class="separator" />
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" v-model="form.name" class="input-field">
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input type="text" v-model="form.phone" class="input-field">
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea v-model="form.description" class="input-field" rows="2"></textarea>
                </div>
              </div>
              <footer class="modal-footer">
                <button class="btn-save" @click="saveDriver">Guardar</button>
                <button class="btn-close" @click="closeModal">Cancelar</button>
              </footer>
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
      showModal: false,
      filterText: "",
      
      // Estado de API
      isLoading: false,
      errorMsg: null,

      form: { name: "", phone: "", description: "" },
      searchPhone: "",
      searchResult: null,

      // Mis conductores (Datos locales de ejemplo)
      myDrivers: [
        { id: 999, name: "Luis Salazar", phone: "3001234567",  description: "Transportador con 8 años de experiencia." },
        { id: 888, name: "Carolina Pérez", phone: "3109876543", description: "Confiable y puntual, 5 años en la empresa." },
      ],
      
      // Conductores Disponibles (Se llenará con la API)
      hireableDrivers: [],
    };
  },
  computed: {
    filteredHireableDrivers() {
      if (!this.filterText) return this.hireableDrivers;
      const term = this.filterText.toLowerCase();
      
      return this.hireableDrivers.filter(d => {
        const name = d.name ? d.name.toLowerCase() : "";
        const phone = d.phone ? d.phone : "";
        return name.includes(term) || phone.includes(term);
      });
    }
  },
  mounted() {
    this.fetchDrivers();
  },
  methods: {
    async fetchDrivers() {
      this.isLoading = true;
      this.errorMsg = null;
      this.hireableDrivers = [];

      try {
        // 1. Obtener el token del almacenamiento local
        const token = localStorage.getItem('token'); 

        if (!token) {
          throw new Error("No hay sesión activa. Por favor inicia sesión nuevamente.");
        }

        // 2. Realizar petición con Authorization Header
        const response = await fetch('https://service.lujuria.crudzaso.com/api/Users/drivers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- CLAVE PARA EL ERROR 401
            }
        });
        
        // Manejo de error 401 específico
        if (response.status === 401) {
           throw new Error("Sesión expirada o no autorizada (401).");
        }

        // Verificación de seguridad por si devuelve HTML (index.html) en vez de JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("El servidor devolvió un formato no válido.");
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo obtener la información.`);
        }

        const data = await response.json();

        // Mapeo robusto de datos
        const apiDrivers = data.map(d => ({
          id: d.id, 
          name: d.name || d.Name || d.username || d.UserName || "Sin nombre", 
          phone: d.phone || d.Phone || d.phoneNumber || d.PhoneNumber || "Sin teléfono",
          description: d.description || d.Description || d.email || "Conductor registrado"
        }));

        // Filtrar los que ya están en "Mis Conductores" para no repetirlos
        const myIds = new Set(this.myDrivers.map(m => m.id));
        this.hireableDrivers = apiDrivers.filter(d => !myIds.has(d.id));

      } catch (err) {
        console.error("Error fetching drivers:", err);
        this.errorMsg = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    openModal() {
      this.showModal = true;
      this.$nextTick(() => { try { this.$refs.modalCard.focus(); } catch (e) {} });
    },
    closeModal() {
      this.showModal = false;
      setTimeout(() => {
        this.form = { name: "", phone: "", description: "" };
        this.searchPhone = "";
        this.searchResult = null;
      }, 200);
    },
    saveDriver() {
      if (!this.form.name.trim()) return;
      this.myDrivers.push({
        id: Date.now(),
        name: this.form.name.trim(),
        phone: this.form.phone.trim(),
        description: this.form.description.trim(),
      });
      this.closeModal();
    },
    hireDriver(driver) {
      this.myDrivers.push(driver);
      this.hireableDrivers = this.hireableDrivers.filter(d => d.id !== driver.id);
      this.filterText = "";
    },
    fireDriver(driver) {
      this.myDrivers = this.myDrivers.filter(d => d.id !== driver.id);
      this.hireableDrivers.push(driver);
    },
    searchByPhone() {
      if (!this.searchPhone.trim()) { this.searchResult = null; return; }
      this.searchResult = this.hireableDrivers.find(d => d.phone.includes(this.searchPhone.trim())) || null;
    },
    selectSearchedDriver() {
      if (this.searchResult) {
        this.form.name = this.searchResult.name;
        this.form.phone = this.searchResult.phone;
        this.form.description = this.searchResult.description;
      }
    },
  },
};
</script>

<style scoped>
/* ============= GLOBAL LAYOUT ============= */
.drivers-page {
  height: 100vh;
  width: 100%;
  overflow: hidden; 
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: #f5e9c6;
  background-color: transparent; 
}

/* Header */
.page-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.page-title { margin: 0 0 6px 0; font-size: 2rem; color: #f7e7b5; }
.subtitle { margin: 0; color: #c8b68a; }

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(180deg,#d4af37,#b78f2b);
  border: none;
  border-radius: 8px;
  color: #0e0c06;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
}
.btn-add:hover { filter: brightness(1.1); }

/* ============= SPLIT VIEW ============= */
.split-layout {
  flex: 1;
  display: flex;
  gap: 24px;
  min-height: 0; 
}

.panel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 12, 8, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  height: 100%; 
  box-sizing: border-box;
}

.panel-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}
.panel-title { font-size: 1.3rem; color: #d4af37; margin: 0; }

.badge, .badge-outline {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
.badge { background: rgba(212, 175, 55, 0.15); color: #f5e9c6; }
.badge-outline { border: 1px solid rgba(212, 175, 55, 0.3); color: #d4af37; }

.search-bar-container { flex-shrink: 0; margin-bottom: 16px; }
.search-input {
  width: 100%; padding: 12px; background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 8px; color: #fff; box-sizing: border-box;
}
.search-input:focus { outline: none; border-color: #d4af37; }
.search-input:disabled { opacity: 0.5; cursor: not-allowed; }

/* ============= SCROLL & LIST ============= */
.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px; 
}
.scroll-container::-webkit-scrollbar { width: 6px; }
.scroll-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 3px; }
.scroll-container::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 3px; }

.cards-list { display: flex; flex-direction: column; gap: 14px; }

.driver-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,175,55,0.1);
  padding: 14px;
  border-radius: 10px;
  transition: 0.2s;
}
.driver-card:hover { background: rgba(255,255,255,0.06); }

.driver-header { display: flex; align-items: center; gap: 12px; }
.driver-photo {
  width: 50px; height: 50px; border-radius: 50%;
  background: linear-gradient(180deg,#0e0c06,#14100a);
  border: 2px solid #d4af37;
}
.available-photo { border-color: rgba(255, 255, 255, 0.3); }

.driver-name { margin: 0; font-size: 1rem; color: #f7e7b5; }
.driver-id { margin: 2px 0 0 0; font-size: .75rem; color: #b9a56d; }
.driver-info { margin-top: 10px; font-size: .85rem; color: #ccc; }
.desc-text { margin-top: 4px; color: #888; font-style: italic; font-size: 0.8rem; }

.driver-actions { margin-top: 12px; display: flex; justify-content: flex-end; }
.btn-delete {
  padding: 6px 12px; background: rgba(200, 50, 50, 0.1);
  border: 1px solid rgba(200, 50, 50, 0.4); color: #ffbaba; border-radius: 6px; cursor: pointer;
}
.btn-hire {
  width: 100%; padding: 8px; background: linear-gradient(90deg, #d4af37, #b78f2b);
  border: none; border-radius: 6px; color: #111; font-weight: bold; cursor: pointer;
}

/* ============= STATES ============= */
.loading-state, .error-state, .empty-state {
  text-align: center; padding: 40px 20px; color: #888;
}

.spinner {
  margin: 0 auto 15px; width: 30px; height: 30px;
  border: 3px solid rgba(212,175,55,0.3); border-top-color: #d4af37;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-state { color: #e57373; }
.btn-retry {
  margin-top: 10px; padding: 6px 12px; background: transparent;
  border: 1px solid #e57373; color: #e57373; border-radius: 4px; cursor: pointer;
}
.btn-retry:hover { background: rgba(229, 115, 115, 0.1); }

/* MODAL STYLES */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
.modal-container { width: 100%; max-width: 500px; padding: 20px; }
.modal-card { background: #12100d; border: 1px solid #d4af37; border-radius: 12px; padding: 20px; color: #efe7bf; }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.modal-title { margin: 0; font-size: 1.3rem; color: #d4af37; }
.modal-close-x { background: none; border: none; color: #d4af37; font-size: 20px; cursor: pointer; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; margin-bottom: 4px; color: #b78f2b; font-size: 0.9rem; }
.input-field { width: 100%; padding: 10px; background: #050505; border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; color: #fff; box-sizing: border-box;}
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-save { padding: 8px 16px; background: #d4af37; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-close { padding: 8px 16px; background: transparent; border: 1px solid #555; color: #ccc; border-radius: 6px; cursor: pointer; }
.search-result { display: flex; gap: 10px; padding: 10px; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; cursor: pointer; margin-bottom: 15px; }
.result-photo { width: 40px; height: 40px; background: #000; border-radius: 50%; border: 1px solid #d4af37; }
.separator { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0; }

@media (max-width: 768px) {
  .drivers-page { height: auto; overflow: auto; }
  .split-layout { flex-direction: column; }
  .panel-section { height: 500px; }
}
</style>