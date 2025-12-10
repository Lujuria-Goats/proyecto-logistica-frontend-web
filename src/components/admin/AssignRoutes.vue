<template>
  <div class="assign-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Asignación de Rutas</h1>
      <p class="subtitle">Selecciona un conductor para gestionar sus entregas</p>
    </header>

    <!-- PANEL PRINCIPAL -->
    <div class="main-panel">

      <div class="list-header-row">
        <h2 class="panel-subtitle">Flota Disponible</h2>
        <span class="badge">{{ drivers.length }} activos</span>
      </div>

      <!-- LISTA DE CONDUCTORES -->
      <div class="scroll-area">
        <div v-if="isLoadingDrivers" class="state-msg">
          <div class="spinner"></div> Cargando conductores...
        </div>

        <div v-else-if="drivers.length === 0" class="state-msg">
          No tienes conductores vinculados.<br>
          Ve a "Gestión de Conductores" para contratar.
        </div>

        <div v-else class="cards-grid">
          <div v-for="driver in drivers" :key="driver.id" class="driver-card">
            <div class="card-content">
              <div class="driver-photo"></div>
              <div class="driver-details">
                <h3 class="driver-name">{{ driver.name }}</h3>
                <div class="detail-row">📞 {{ driver.phone }}</div>
                <div class="detail-row desc">{{ driver.description }}</div>
              </div>
            </div>
            <button class="btn-action" @click="openModal(driver)">
              🗺️ Gestionar Ruta
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- MODAL DE GESTIÓN DE RUTA                          -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <div class="modal-card" ref="modalCard" tabindex="-1">

              <header class="modal-header">
                <h2 class="modal-title">Ruta de {{ selectedDriver?.name }}</h2>
                <button class="modal-close-x" @click="closeModal">✕</button>
              </header>

              <div class="modal-body">

                <!-- MAPA -->
                <div class="map-section">
                  <div ref="mapContainer" class="map-container"></div>
                  <div class="map-overlay-info">
                    <small>📍 Mapa de entregas</small>
                  </div>
                </div>

                <!-- GRID DE ASIGNACIÓN -->
                <div class="assignment-grid">

                  <!-- COLUMNA IZQUIERDA: DISPONIBLES -->
                  <div class="column available-col">
                    <h3 class="col-title">📦 Pedidos Sin Asignar</h3>
                    <div v-if="isLoadingOrders" class="mini-loader-container">
                      <span class="loader"></span> Cargando...
                    </div>
                    <div v-else-if="availableOrders.length === 0" class="empty-state-mini">
                      No hay pedidos libres.
                    </div>
                    <div v-else class="orders-list">
                      <div v-for="order in availableOrders" :key="order.id" class="order-item">
                        <div class="order-info">
                          <span class="order-id">#{{ order.id }}</span>
                          <span class="order-addr">{{ order.address }}</span>
                        </div>
                        <button class="btn-add-order" @click="addOrderToRoute(order)">➕</button>
                      </div>
                    </div>
                  </div>

                  <!-- COLUMNA DERECHA: ASIGNADOS -->
                  <div class="column selected-col">
                    <div class="col-header-flex">
                      <h3 class="col-title">🚚 Ruta Actual ({{ routes.length }})</h3>

                      <!-- BOTÓN OPTIMIZAR -->
                      <button class="btn-optimize" @click="optimizeRoute" :disabled="routes.length < 2 || isOptimizing"
                        title="Reordenar automáticamente para ahorrar distancia">
                        <span v-if="isOptimizing" class="spinner-tiny"></span>
                        <span v-else>⚡ Optimizar</span>
                      </button>
                    </div>

                    <div v-if="routes.length === 0" class="empty-state-mini">
                      Agrega pedidos desde la izquierda.
                    </div>

                    <transition-group name="list" tag="div" class="orders-list">
                      <div v-for="(route, index) in routes" :key="route.id" class="order-item selected">
                        <div class="order-sequence">{{ index + 1 }}</div>
                        <div class="order-info">
                          <span class="order-id">#{{ route.id }}</span>
                          <span class="order-addr">{{ route.address }}</span>
                        </div>
                        <button class="btn-remove-order" @click="removeRoute(index)">✕</button>
                      </div>
                    </transition-group>
                  </div>

                </div>

                <!-- SECCIÓN DE RESULTADO DE OPTIMIZACIÓN (NUEVO) -->
                <transition name="slide-up">
                  <div v-if="optimizedData" class="optimization-result">
                    <div class="opt-header">
                      <h4>✨ Ruta Optimizada Encontrada</h4>
                      <div class="opt-stats">
                        <span>📏 Distancia Total: <strong>{{ optimizedData.totalDistanceKm }} km</strong></span>
                      </div>
                    </div>

                    <div class="opt-preview-list">
                      <div v-for="(step, i) in optimizedData.displayList" :key="step.id" class="opt-step">
                        <span class="step-num">{{ i + 1 }}</span>
                        <div class="step-info">
                          <span class="step-addr">{{ step.address }}</span>
                        </div>
                        <span class="step-arrow" v-if="i < optimizedData.displayList.length - 1">⬇</span>
                      </div>
                    </div>

                    <div class="opt-actions">
                      <button class="btn-cancel-opt" @click="optimizedData = null">Descartar</button>
                      <button class="btn-apply-opt" @click="applyOptimization">✅ Aplicar este orden</button>
                    </div>
                  </div>
                </transition>

              </div>

              <footer class="modal-footer">
                <button class="btn-save-final" @click="saveRoutes" :disabled="routes.length === 0">
                  Guardar Cambios
                </button>
              </footer>

            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL DE PROGRESO -->
      <transition name="fade">
        <div v-if="isSaving" class="saving-overlay">
          <div class="saving-card">
            <div v-if="!saveSuccess" class="loader-container-center">
              <span class="loader"></span>
            </div>
            <div v-else class="success-icon">✅</div>
            <h3 class="saving-title">
              {{ saveSuccess ? '¡Ruta Guardada!' : 'Guardando cambios...' }}
            </h3>
          </div>
        </div>
      </transition>
    </teleport>

  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { markRaw, nextTick } from "vue";
import "mapbox-gl/dist/mapbox-gl.css";

export default {
  name: "AsignarRutas",
  data() {
    return {
      baseUrl: 'https://service.lujuria.crudzaso.com',
      mapboxAccessToken: "pk.eyJ1IjoianZlbGV6MDAwIiwiYSI6ImNtaWkzOHZ5dTAxbnkzZHE3Mmo2c2VnbjQifQ.R-ikqyiMMZVwUHOH9CJ6mg",

      isLoadingDrivers: false,
      drivers: [],
      selectedDriver: null,

      availableOrders: [],
      isLoadingOrders: false,

      showModal: false,
      routes: [],
      mapInstance: null,
      markers: [], // Array para gestionar marcadores y borrarlos

      isSaving: false,
      saveSuccess: false,

      // OPTIMIZACIÓN
      isOptimizing: false,
      optimizedData: null, // Guardará el resultado { totalDistanceKm, displayList: [] }

      boundsSW: [-75.70, 6.02],
      boundsNE: [-75.30, 6.55],
      startLat: 6.2476,
      startLng: -75.5658,
    };
  },
  mounted() {
    this.fetchMyDrivers();
  },
  methods: {
    // --- 1. CARGA DE DATOS ---
    async fetchMyDrivers() {
      this.isLoadingDrivers = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${this.baseUrl}/api/Drivers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.drivers || []);
          this.drivers = list.map(d => ({
            id: d.id, name: d.fullName || d.name, phone: d.phoneNumber, description: d.description
          }));
        }
      } catch (e) { console.error(e); } finally { this.isLoadingDrivers = false; }
    },

    async fetchOrdersAndClassify() {
      this.isLoadingOrders = true;
      this.availableOrders = [];
      try {
        const token = localStorage.getItem('token');
        const driverId = this.selectedDriver.id;
        const res = await fetch(`${this.baseUrl}/api/Orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const allOrders = await res.json();

          this.availableOrders = allOrders.filter(o =>
            o.status !== 2 && (!o.driverId || o.driverId === 0)
          ).map(this.mapOrder);

          this.routes = allOrders.filter(o =>
            o.status !== 2 && o.driverId === driverId
          ).map(this.mapOrder);

          nextTick(() => { this.renderAllMarkers(); });
        }
      } catch (e) { console.error(e); } finally { this.isLoadingOrders = false; }
    },

    mapOrder(o) {
      return {
        id: o.id,
        address: o.address,
        description: o.description,
        lat: o.latitude,
        lng: o.longitude,
      };
    },

    // --- 2. OPTIMIZACIÓN (NUEVO) ---
     async optimizeRoute() {
      if (this.routes.length < 2) return;
      this.isOptimizing = true;
      this.optimizedData = null;

      // 1. Preparar Payload
      const payload = {
        fleetId: this.selectedDriver.id.toString(),
        locations: this.routes.map(r => ({
          id: r.id,
          latitude: r.lat,
          longitude: r.lng
        }))
      };

      try {
        const token = localStorage.getItem('token');
        
        // CORRECCIÓN: Endpoint actualizado
        const res = await fetch(`${this.baseUrl}/api/Orders/my-route/optimize`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
            // Intenta leer el error si el backend lo envía
            const errText = await res.text();
            throw new Error(errText || `Error ${res.status}`);
        }

        const data = await res.json();
        
        // 2. Mapear respuesta
        const orderedList = data.optimizedOrder.map(optItem => {
          return this.routes.find(r => r.id === optItem.id);
        }).filter(Boolean);

        this.optimizedData = {
          totalDistanceKm: data.totalDistanceKm,
          displayList: orderedList
        };

      } catch (error) {
        console.error(error);
        alert("⚠️ No se pudo optimizar la ruta. Verifica que el backend tenga implementada la lógica matemática en ese endpoint.");
      } finally {
        this.isOptimizing = false;
      }
    },

    applyOptimization() {
      if (!this.optimizedData) return;

      // Reemplazamos la ruta actual con la ordenada
      this.routes = [...this.optimizedData.displayList];

      // Actualizamos marcadores para reflejar el nuevo orden (números)
      this.renderAllMarkers();

      // Cerramos panel de optimización
      this.optimizedData = null;
    },

    // --- 3. GESTIÓN DE MAPA Y MARCADORES ---
    initMap() {
      mapboxgl.accessToken = this.mapboxAccessToken;
      const map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [this.startLng, this.startLat],
        zoom: 11
      });
      this.mapInstance = markRaw(map);
      map.on("load", () => {
        map.resize();
        if (this.routes.length > 0) this.renderAllMarkers();
      });
    },

    renderAllMarkers() {
      if (!this.mapInstance) return;

      // Limpiar marcadores anteriores
      this.markers.forEach(m => m.remove());
      this.markers = [];

      // Crear nuevos marcadores numerados según el orden en la lista
      this.routes.forEach((route, index) => {
        // Crear elemento HTML personalizado para el marcador numérico
        const el = document.createElement('div');
        el.className = 'marker-number';
        el.innerText = index + 1; // 1, 2, 3...
        el.style.backgroundColor = '#d4af37';
        el.style.color = '#000';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '12px';
        el.style.border = '2px solid white';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([route.lng, route.lat])
          .addTo(this.mapInstance);

        this.markers.push(marker);
      });

      // Ajustar vista del mapa
      if (this.routes.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        this.routes.forEach(r => bounds.extend([r.lng, r.lat]));
        this.mapInstance.fitBounds(bounds, { padding: 50 });
      }
    },

    // --- 4. GESTIÓN LISTAS ---
    addOrderToRoute(order) {
      this.routes.push(order);
      this.availableOrders = this.availableOrders.filter(o => o.id !== order.id);
      this.renderAllMarkers();
    },
    removeRoute(index) {
      const item = this.routes[index];
      this.availableOrders.unshift(item);
      this.routes.splice(index, 1);
      this.renderAllMarkers();
    },

    // --- 5. MODAL Y GUARDADO ---
    openModal(driver) {
      this.selectedDriver = driver;
      this.routes = [];
      this.optimizedData = null;
      this.showModal = true;
      nextTick(() => { this.initMap(); this.fetchOrdersAndClassify(); });
    },
    closeModal() {
      if (this.isSaving) return;
      this.showModal = false;
      if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
    },
    async saveRoutes() {
      if (this.routes.length === 0) return;
      this.isSaving = true;
      this.saveSuccess = false;
      const token = localStorage.getItem("token");
      const driverId = this.selectedDriver.id;

      try {
        const promises = this.routes.map(order =>
          fetch(`${this.baseUrl}/api/Orders/${order.id}/assign/${driverId}`, {
            method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
          })
        );
        await Promise.all(promises);
        setTimeout(() => {
          this.saveSuccess = true;
          setTimeout(() => { this.isSaving = false; this.closeModal(); }, 1500);
        }, 1000);
      } catch (e) { this.isSaving = false; alert("Error al guardar"); }
    }
  }
};
</script>

<style scoped>
/* ESTILOS BASE */
.assign-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 5vh;
  padding: 20px;
  box-sizing: border-box;
  background: transparent;
}

.page-header {
  flex-shrink: 0;
  margin-bottom: 20px;
  text-align: center;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #d4af37;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

.subtitle {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #888;
}

/* PANEL PRINCIPAL */
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
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  padding: 20px 30px 30px 30px;
}

.list-header-row {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-subtitle {
  margin: 0;
  color: #d4af37;
  font-size: 1.2rem;
}

.badge {
  background: rgba(212, 175, 55, 0.15);
  color: #d4af37;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  margin-top: 15px;
  padding-right: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 15px;
  padding: 10px;
}

.driver-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.driver-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.driver-photo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid #d4af37;
  flex-shrink: 0;
}

.driver-details {
  flex: 1;
  overflow: hidden;
}

.driver-name {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-row {
  font-size: 0.85rem;
  color: #ccc;
  margin-bottom: 2px;
}

.desc {
  color: #888;
  font-style: italic;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-action {
  align-self: stretch;
  text-align: center;
  background: #d4af37;
  border: none;
  color: #111;
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-action:hover {
  background: #eac54e;
}

.state-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #d4af37;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 950px;
  display: flex;
  justify-content: center;
}

.modal-card {
  width: 100%;
  background: #14100e;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 14px;
  padding: 20px;
  color: #efe7bf;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.3rem;
  color: #d4af37;
}

.modal-close-x {
  background: transparent;
  border: none;
  color: #d4af37;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* MAPA */
.map-section {
  position: relative;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  overflow: hidden;
  height: 250px;
  flex-shrink: 0;
}

.map-container {
  width: 100%;
  height: 100%;
  background-color: #000;
}

.map-overlay-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
  border-radius: 15px;
  color: #d4af37;
  font-weight: bold;
  font-size: 0.8rem;
  pointer-events: none;
}

/* GRID ASIGNACIÓN */
.assignment-grid {
  display: flex;
  gap: 20px;
  min-height: 300px;
  flex: 1;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px;
}

.col-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  padding-bottom: 8px;
}

.col-title {
  margin: 0;
  font-size: 1rem;
  color: #d4af37;
}

/* BOTÓN OPTIMIZAR */
.btn-optimize {
  background: linear-gradient(90deg, #512da8, #673ab7);
  border: none;
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-optimize:hover {
  filter: brightness(1.2);
}

.btn-optimize:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.spinner-tiny {
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* LISTAS */
.orders-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: 0.2s;
}

.order-sequence {
  background: #d4af37;
  color: #000;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  margin-right: 10px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  flex: 1;
}

.order-id {
  font-family: monospace;
  color: #d4af37;
  font-weight: bold;
  font-size: 0.8rem;
}

.order-addr {
  font-size: 0.85rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-add-order {
  background: #d4af37;
  border: none;
  color: #000;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-remove-order {
  background: transparent;
  border: 1px solid #d44;
  color: #d44;
  font-weight: bold;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* SECCIÓN RUTA OPTIMIZADA */
.optimization-result {
  background: linear-gradient(180deg, #1a1a1a, #111);
  border: 1px solid #d4af37;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.5);
}

.opt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.opt-header h4 {
  margin: 0;
  color: #d4af37;
}

.opt-stats {
  font-size: 0.9rem;
  color: #ccc;
}

.opt-preview-list {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.opt-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  text-align: center;
}

.step-num {
  background: #333;
  border: 1px solid #d4af37;
  color: #d4af37;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.step-info {
  background: rgba(255, 255, 255, 0.05);
  padding: 5px;
  border-radius: 4px;
  width: 100%;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-arrow {
  color: #555;
  margin-top: 5px;
  font-size: 0.8rem;
  transform: rotate(-90deg);
}

.opt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel-opt {
  background: transparent;
  border: 1px solid #666;
  color: #ccc;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-apply-opt {
  background: #d4af37;
  border: none;
  color: #000;
  font-weight: bold;
  padding: 6px 15px;
  border-radius: 6px;
  cursor: pointer;
}

/* FOOTER */
.modal-footer {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(212, 175, 55, 0.15);
  padding-top: 15px;
  flex-shrink: 0;
}

.btn-save-final {
  background: #d4af37;
  color: #080808;
  font-weight: 700;
  font-size: 1rem;
  padding: 10px 25px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save-final:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  background: #e6c24e;
}

.btn-save-final:disabled {
  background: #554415;
  color: #888;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* TRANSICIONES */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* SAVING OVERLAY */
.saving-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}

.saving-card {
  text-align: center;
  color: #efe7bf;
}

.loader-container-center {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.success-icon {
  font-size: 4rem;
  animation: popIn 0.5s;
}

@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {

  0%,
  100% {
    box-shadow: .2em 0px 0 0px currentcolor;
  }

  12% {
    box-shadow: .2em .2em 0 0 currentcolor;
  }

  25% {
    box-shadow: 0 .2em 0 0px currentcolor;
  }

  37% {
    box-shadow: -.2em .2em 0 0 currentcolor;
  }

  50% {
    box-shadow: -.2em 0 0 0 currentcolor;
  }

  62% {
    box-shadow: -.2em -.2em 0 0 currentcolor;
  }

  75% {
    box-shadow: 0px -.2em 0 0 currentcolor;
  }

  87% {
    box-shadow: .2em -.2em 0 0 currentcolor;
  }
}

.loader {
  transform: rotateZ(45deg);
  perspective: 1000px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  color: #fff;
  display: inline-block;
}

.loader:before,
.loader:after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: inherit;
  height: inherit;
  border-radius: 50%;
  transform: rotateX(70deg);
  animation: 1s spin linear infinite;
}

.loader:after {
  color: #f3ca45;
  transform: rotateY(70deg);
  animation-delay: .4s;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d4af37;
}
</style>