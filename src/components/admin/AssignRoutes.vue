<template>
  <div class="assign-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Gestión de Rutas</h1>
      <p class="subtitle">Administra y asigna las rutas a tu flota</p>
    </header>

    <!-- PANEL PRINCIPAL -->
    <div class="main-panel">

      <!-- LAYOUT DIVIDIDO (IZQUIERDA / DERECHA) -->
      <div class="split-layout">

        <!-- ================= SECCIÓN IZQUIERDA: RUTAS PENDIENTES ================= -->
        <div class="panel-section left-panel">
          <header class="panel-header">
            <h2 class="panel-title">📍 Rutas Pendientes</h2>
            <span class="badge warning">{{ unassignedRoutes.length }} sin conductor</span>
          </header>

          <div class="scroll-container">
            <!-- LOADING -->
            <div v-if="isLoadingRoutes" class="state-msg">
              <div class="spinner"></div> Cargando...
            </div>

            <!-- EMPTY -->
            <div v-else-if="unassignedRoutes.length === 0" class="state-msg">
              No hay rutas pendientes por asignar.
            </div>

            <!-- LISTA -->
            <div v-else class="cards-list">
              <div v-for="route in unassignedRoutes" :key="route.id" class="route-card">
                <div class="route-header">
                  <div class="route-icon">🗺️</div>
                  <div class="route-info">
                    <h3 class="route-name">{{ route.name }}</h3>
                    <p class="route-meta">{{ route.orderIds.length }} Paradas • {{ route.totalDist }} km</p>
                  </div>
                </div>
                
                <div class="route-actions">
                  <button class="btn-icon-action info" @click="openInfoModal(route)" title="Ver Información">
                    ℹ️
                  </button>
                  <button class="btn-icon-action edit" @click="openEditModal(route)" title="Ver Puntos">
                    ✏️
                  </button>
                  <button class="btn-main-assign" @click="openAssignModal(route)">
                    👤 Asignar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= SECCIÓN DERECHA: RUTAS ASIGNADAS ================= -->
        <div class="panel-section right-panel">
          <header class="panel-header">
            <h2 class="panel-title">✅ Rutas Asignadas</h2>
            <span class="badge success">{{ assignedRoutes.length }} en curso</span>
          </header>

          <div class="scroll-container">
            <!-- LOADING -->
            <div v-if="isLoadingRoutes" class="state-msg">
              <div class="spinner"></div>
            </div>

            <!-- EMPTY -->
            <div v-else-if="assignedRoutes.length === 0" class="state-msg">
              No hay rutas en curso actualmente.
            </div>

            <!-- LISTA -->
            <div v-else class="cards-list">
              <div v-for="route in assignedRoutes" :key="route.id" class="route-card assigned">
                <div class="route-header">
                  <div class="route-icon success-icon">🚚</div>
                  <div class="route-info">
                    <h3 class="route-name">{{ route.name }}</h3>
                    <p class="route-meta">Conductor: <strong>{{ route.driverName }}</strong></p>
                    <p class="route-submeta">📞 {{ route.driverPhone }}</p>
                  </div>
                </div>
                
                <div class="route-actions">
                  <button class="btn-icon-action info" @click="openInfoModal(route)" title="Ver Información">
                    ℹ️
                  </button>
                  <!-- Botón informativo -->
                  <button class="btn-assigned-status" disabled>
                    En Curso
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ================================================= -->
    <!-- MODAL 1: INFORMACIÓN DETALLADA                    -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showInfoModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card large-card">
              <header class="modal-header">
                <h2 class="modal-title">Detalle de Ruta: {{ selectedRoute?.name }}</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              <div class="modal-body">
                <!-- MAPA -->
                <div class="map-wrapper">
                  <div ref="mapContainerInfo" class="map-container"></div>
                  <div class="map-overlay-info">
                    <small>{{ selectedRouteDetails.length }} Puntos encontrados</small>
                  </div>
                </div>
                <!-- LISTA DE PUNTOS -->
                <div class="points-list">
                  <h3 class="section-title">Puntos de Entrega (Ordenados)</h3>
                  <div v-if="selectedRouteDetails.length === 0" class="empty-state-mini">
                    ⚠️ Cargando información...
                  </div>
                  <div v-for="(point, index) in selectedRouteDetails" :key="point.id" class="point-item">
                    <div class="point-index">{{ index + 1 }}</div>
                    <div class="point-data">
                      <p class="p-addr">📍 {{ point.address }}</p>
                      <p class="p-desc">📦 {{ point.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ================================================= -->
    <!-- MODAL 2: EDICIÓN (VISUAL)                         -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card large-card">
              <header class="modal-header">
                <h2 class="modal-title">Visualizar Puntos</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              <div class="modal-body">
                <div class="map-wrapper small-map">
                  <div ref="mapContainerEdit" class="map-container"></div>
                </div>
                <div class="points-list editable">
                  <div v-for="(point, index) in selectedRouteDetails" :key="point.id" class="point-item">
                    <div class="point-index">{{ index + 1 }}</div>
                    <div class="point-data">
                      <p class="p-addr">{{ point.address }}</p>
                    </div>
                    <button class="btn-remove-point disabled" title="Solo lectura">🔒</button>
                  </div>
                </div>
              </div>
              <footer class="modal-footer">
                <button class="btn-save" @click="closeModals">Cerrar</button>
              </footer>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ================================================= -->
    <!-- MODAL 3: ASIGNACIÓN                               -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showAssignModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card">
              <header class="modal-header">
                <h2 class="modal-title">Seleccionar Conductor</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              
              <div class="modal-body driver-selection-body">
                <p class="instruction-text">
                  Asignar ruta <strong>{{ selectedRoute?.name }}</strong> 
                  ({{ selectedRoute?.orderIds.length }} paradas)
                </p>
                
                <div v-if="isLoadingDrivers" class="spinner-container"><div class="spinner"></div></div>
                <div v-else-if="drivers.length === 0" class="empty-state-mini">No hay conductores disponibles.</div>
                
                <div v-else class="drivers-grid-select">
                  <div 
                    v-for="driver in drivers" 
                    :key="driver.id" 
                    class="driver-select-card"
                    @click="assignRouteToDriver(driver)"
                  >
                    <div class="driver-avatar"></div>
                    <div class="driver-info-mini">
                      <span class="d-name">{{ driver.name }}</span>
                      <span class="d-phone">📞 {{ driver.phone }}</span>
                    </div>
                    <div class="hover-indicator">Asignar ➔</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ================================================= -->
    <!-- MODAL 4: MENSAJES (EXITO/ERROR)                   -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
          <div class="modal-container">
            <div class="modal-card small-modal text-center">
              <div class="modal-body success-body">
                <div class="success-icon">{{ messageType === 'success' ? '✅' : '⚠️' }}</div>
                <h2 class="modal-title success-title">{{ messageTitle }}</h2>
                <p class="success-text">{{ messageBody }}</p>
                <button class="btn-confirm-modal full-width" @click="closeMessageModal">Aceptar</button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- OVERLAY DE CARGA -->
    <transition name="fade">
      <div v-if="isProcessing" class="global-loader">
        <div class="spinner large"></div>
        <p>Procesando asignación...</p>
      </div>
    </transition>

  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { markRaw, nextTick } from "vue";
import "mapbox-gl/dist/mapbox-gl.css";

export default {
  name: "AssignRoutes",
  data() {
    return {
      baseUrl: 'https://service.lujuria.crudzaso.com',
      mapboxAccessToken: "pk.eyJ1IjoianZlbGV6MDAwIiwiYSI6ImNtaWkzOHZ5dTAxbnkzZHE3Mmo2c2VnbjQifQ.R-ikqyiMMZVwUHOH9CJ6mg",

      // Data Principal
      unassignedRoutes: [],
      assignedRoutes: [],
      drivers: [],
      
      ordersMap: new Map(),
      
      selectedRoute: null,
      selectedRouteDetails: [], 

      isLoadingRoutes: false,
      isLoadingDrivers: false,
      isProcessing: false,

      // Modales
      showInfoModal: false,
      showEditModal: false,
      showAssignModal: false,
      
      // Modal Mensajes
      showMessageModal: false,
      messageTitle: '',
      messageBody: '',
      messageType: 'success',

      mapInstance: null,
      markers: []
    };
  },
  async mounted() {
    await this.fetchAllOrders(); 
    this.fetchRoutes();
    this.fetchDrivers();
  },
  methods: {
    getCleanToken() {
      let token = localStorage.getItem('token');
      if (!token) return null;
      token = String(token).replace(/^"|"$/g, '');
      if (token.toLowerCase().startsWith('bearer ')) token = token.slice(7).trim();
      return token;
    },

    // --- MENSAJES ---
    openMessage(title, body, type = 'success') {
      this.messageTitle = title;
      this.messageBody = body;
      this.messageType = type;
      this.showMessageModal = true;
    },
    closeMessageModal() {
      this.showMessageModal = false;
    },

    // --- 1. CARGA DE DATOS ---
    async fetchAllOrders() {
      try {
        const token = this.getCleanToken();
        if(!token) return;
        const res = await fetch(`${this.baseUrl}/api/Orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          data.forEach(order => {
             const info = {
                id: order.id || order.Id,
                address: order.address || order.Address,
                description: order.description || order.Description,
                lat: order.latitude || order.Latitude,
                lng: order.longitude || order.Longitude,
                requirePhoto: order.requiresEvidence || order.RequiresEvidence
             };
             this.ordersMap.set(info.id, info);
          });
        }
      } catch (e) { console.error("Error catálogo pedidos:", e); }
    },

    async fetchRoutes() {
      this.isLoadingRoutes = true;
      try {
        const token = this.getCleanToken();
        const res = await fetch(`${this.baseUrl}/api/Routes/all`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          this.unassignedRoutes = (data.templates || []).map(this.mapRouteData).reverse();

          this.assignedRoutes = (data.assignedRoutes || []).map(r => {
             const base = this.mapRouteData(r);
             if (r.driver) {
               base.driverName = r.driver.fullName || r.driver.name;
               base.driverPhone = r.driver.phoneNumber;
             }
             return base;
          }).reverse();
          
        } else {
          console.error("Error al cargar rutas:", res.status);
        }
      } catch (e) { console.error(e); } 
      finally { this.isLoadingRoutes = false; }
    },

    mapRouteData(r) {
      return {
        id: r.routeId || r.id, 
        name: r.routeName || r.RouteName || "Ruta sin nombre",
        totalDist: (r.totalDistance || r.TotalDistance || 0).toFixed(2),
        orderIds: r.orderIds || [] 
      };
    },

    async fetchDrivers() {
      this.isLoadingDrivers = true;
      try {
        const token = this.getCleanToken();
        const res = await fetch(`${this.baseUrl}/api/Drivers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.drivers || []);
          this.drivers = list.map(d => ({
            id: d.id, name: d.fullName || d.name, phone: d.phoneNumber
          }));
        }
      } catch (e) { console.error(e); } 
      finally { this.isLoadingDrivers = false; }
    },

    // --- 2. MODALES ---
    resolveRouteDetails(route) {
      this.selectedRouteDetails = [];
      if (!route || !route.orderIds) return;
      route.orderIds.forEach(orderId => {
        const details = this.ordersMap.get(orderId);
        if (details) this.selectedRouteDetails.push(details);
      });
    },

    openInfoModal(route) {
      this.selectedRoute = route;
      this.resolveRouteDetails(route);
      this.showInfoModal = true;
      nextTick(() => this.initMap(this.$refs.mapContainerInfo));
    },

    openEditModal(route) {
      this.selectedRoute = route;
      this.resolveRouteDetails(route);
      this.showEditModal = true;
      nextTick(() => this.initMap(this.$refs.mapContainerEdit));
    },

    openAssignModal(route) {
      this.selectedRoute = route;
      this.resolveRouteDetails(route);
      this.showAssignModal = true;
    },

    closeModals() {
      this.showInfoModal = false;
      this.showEditModal = false;
      this.showAssignModal = false;
      this.selectedRoute = null;
      this.selectedRouteDetails = [];
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }
    },

    // --- 3. ASIGNACIÓN ---
    async assignRouteToDriver(driver) {
      if(!this.selectedRoute) return;
      
      const routeName = this.selectedRoute.name;
      const driverName = driver.name;

      this.isProcessing = true;
      const token = this.getCleanToken();
      
      try {
        const cleanPhone = String(driver.phone).replace(/[^0-9+]/g, '');
        const routeId = this.selectedRoute.id;
        const url = `${this.baseUrl}/api/Routes/saved/${routeId}/assign`;
        
        const res = await fetch(url, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ driverPhoneNumber: cleanPhone })
        });

        if (!res.ok) {
           const txt = await res.text();
           if (res.status === 401) throw new Error("⛔ 401: Permiso denegado. Verifica que la ruta pertenezca a tu usuario.");
           throw new Error(txt || `Error ${res.status}`);
        }
        
        this.closeModals();
        await this.fetchRoutes(); 
        
        this.openMessage("Asignación Exitosa", `La ruta "${routeName}" ha sido asignada a ${driverName}.`, "success");

      } catch (e) {
        console.error(e);
        this.openMessage("Error de Asignación", e.message, "error");
      } finally {
        this.isProcessing = false;
      }
    },

    // --- 4. MAPAS ---
    initMap(container) {
      if (!container || this.selectedRouteDetails.length === 0) return;
      const firstPoint = this.selectedRouteDetails[0];
      mapboxgl.accessToken = this.mapboxAccessToken;
      const map = new mapboxgl.Map({
        container: container,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [firstPoint.lng, firstPoint.lat],
        zoom: 11
      });
      this.mapInstance = markRaw(map);
      map.on("load", () => {
        map.resize();
        this.renderMarkers(map);
      });
    },

    renderMarkers(map) {
      if (this.markers.length > 0) {
        this.markers.forEach(m => m.remove());
        this.markers = [];
      }
      const bounds = new mapboxgl.LngLatBounds();
      this.selectedRouteDetails.forEach((order, index) => {
        const el = document.createElement('div');
        el.className = 'marker-digit';
        el.innerText = index + 1;
        const marker = new mapboxgl.Marker(el)
          .setLngLat([order.lng, order.lat])
          .addTo(map);
        this.markers.push(marker);
        bounds.extend([order.lng, order.lat]);
      });
      map.fitBounds(bounds, { padding: 50 });
    }
  }
};
</script>

<style scoped>
/* ============= GLOBAL LAYOUT ============= */
.assign-page {
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
  margin-bottom: 20px;
  text-align: center;
}
.page-title { margin: 0; font-size: 1.8rem; color: #d4af37; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8); }
.subtitle { margin: 5px 0 0; font-size: 0.9rem; color: #888; }

/* PANEL PRINCIPAL (NO SCROLL INTERNO GLOBAL, SOLO FLEXBOX) */
.main-panel {
  flex: 1; /* Ocupa el espacio restante */
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0; /* CRÍTICO para que el contenido no desborde */
}

/* ============= SPLIT VIEW CORREGIDO ============= */
.split-layout {
  display: flex;
  gap: 24px;
  flex: 1; /* Ocupa todo el alto del main-panel */
  min-height: 0; /* Permite que los hijos tengan scroll */
}

.panel-section {
  flex: 1; /* Ambas columnas 50% */
  display: flex;
  flex-direction: column;
  background: rgba(15, 12, 8, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 16px;
  height: 90%;
  padding: 0; /* Padding interno manejado por scroll-container */
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  overflow: hidden; /* Corta contenido sobrante */
  border-bottom: 2px solid rgba(212, 175, 55, 0.4); /* Borde inferior visible */
}

.panel-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  background: rgba(255, 255, 255, 0.02);
}

.panel-title {
  font-size: 1.2rem;
  color: #d4af37;
  margin: 0;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
.badge.warning { background: rgba(255, 193, 7, 0.15); color: #ffc107; border: 1px solid #ffc107; }
.badge.success { background: rgba(76, 175, 80, 0.15); color: #66bb6a; border: 1px solid #66bb6a; }

/* SCROLL AREA CORREGIDA */
.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.scroll-container::-webkit-scrollbar { width: 6px; }
.scroll-container::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
.scroll-container::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 3px; }

/* LISTA DE TARJETAS */
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.route-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s;
}

.route-card:hover { 
  transform: translateY(-2px); 
  background: rgba(255, 255, 255, 0.06); 
}

.route-card.assigned { border-color: #66bb6a; }
.route-card.assigned:hover { background: rgba(76, 175, 80, 0.05); }

.route-header { display: flex; align-items: center; gap: 12px; }
.route-icon { font-size: 1.8rem; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 50%; }
.success-icon { color: #66bb6a; }

.route-info { flex: 1; overflow: hidden; }
.route-name { margin: 0; color: #fff; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.route-meta { margin: 4px 0 0; color: #888; font-size: 0.85rem; }
.route-submeta { margin: 2px 0 0; color: #666; font-size: 0.8rem; }

.route-actions {
  display: flex; gap: 8px; margin-top: auto;
}
.btn-icon-action {
  background: rgba(255,255,255,0.1); border: none; border-radius: 6px;
  width: 36px; height: 36px; cursor: pointer; font-size: 1.1rem; transition: 0.2s; color: #ccc;
}
.btn-icon-action:hover { background: rgba(255,255,255,0.2); color: #fff; }
.btn-icon-action.edit:hover { color: #d4af37; }

.btn-main-assign {
  flex: 1; background: #d4af37; border: none; border-radius: 6px;
  color: #000; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 0.9rem;
}
.btn-main-assign:hover { background: #ffdb60; }

.btn-assigned-status {
  flex: 1; background: rgba(76, 175, 80, 0.2); border: 1px solid #66bb6a; color: #66bb6a;
  border-radius: 6px; font-weight: bold; cursor: default; font-size: 0.85rem; padding: 8px;
}

/* MODALES */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(5px);
}
.modal-container { width: 100%; display: flex; justify-content: center; padding: 20px; }
.modal-card {
  width: 100%; max-width: 500px; background: #141414; border: 1px solid #d4af37;
  border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;
}
.large-card { max-width: 800px; }
.small-modal { max-width: 380px; }

.modal-header {
  padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex; justify-content: space-between; align-items: center; background: #0f0c08;
}
.modal-title { margin: 0; color: #d4af37; font-size: 1.2rem; }
.modal-close-x { background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; }
.modal-close-x:hover { color: #fff; }

.modal-body { padding: 0; overflow-y: auto; flex: 1; display: flex; flex-direction: column; }

/* MAPA EN MODAL */
.map-wrapper { width: 100%; height: 300px; position: relative; }
.map-overlay-info {
  position: absolute; top: 10px; left: 10px;
  background: rgba(0,0,0,0.7); color: #d4af37; padding: 5px 10px; border-radius: 6px; font-size: 0.8rem;
}
.small-map { height: 200px; }
.map-container { width: 100%; height: 100%; }

/* LISTA DE PUNTOS EN MODAL */
.points-list { padding: 20px; background: #1a1a1a; flex: 1; }
.section-title { margin: 0 0 15px 0; color: #d4af37; font-size: 1rem; border-bottom: 1px solid #333; padding-bottom: 5px; }

.point-item { display: flex; gap: 15px; margin-bottom: 15px; align-items: flex-start; }
.point-index { 
  background: #333; color: #d4af37; width: 24px; height: 24px; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; flex-shrink: 0;
}
.point-data { flex: 1; }
.p-addr { margin: 0 0 4px; color: #fff; font-weight: 500; font-size: 0.95rem; }
.p-desc { margin: 0 0 6px; color: #888; font-size: 0.85rem; }
.p-meta { font-size: 0.8rem; color: #666; font-family: monospace; display: flex; gap: 10px; }
.tag-evidence { color: #d4af37; border: 1px solid #d4af37; padding: 0 4px; border-radius: 4px; }

.btn-remove-point {
  background: rgba(200, 50, 50, 0.1); border: 1px solid #d44; color: #d44;
  border-radius: 6px; padding: 5px 10px; cursor: pointer;
}
.btn-remove-point:hover { background: #d44; color: #fff; }
.btn-remove-point.disabled { opacity: 0.3; cursor: not-allowed; border-color: #666; color: #666; }

/* MODAL SELECCION CONDUCTOR */
.driver-selection-body { padding: 20px; background: #111; }
.instruction-text { text-align: center; color: #ccc; margin-bottom: 20px; }
.drivers-grid-select { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }

.driver-select-card {
  background: rgba(255,255,255,0.05); border: 1px solid #333; border-radius: 10px;
  padding: 15px; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.driver-select-card:hover { border-color: #d4af37; background: rgba(212,175,55,0.1); }

.driver-avatar { width: 50px; height: 50px; background: #000; border: 2px solid #d4af37; border-radius: 50%; margin-bottom: 10px; }
.driver-info-mini { display: flex; flex-direction: column; }
.d-name { color: #fff; font-weight: bold; margin-bottom: 2px; }
.d-phone { color: #888; font-size: 0.8rem; }

.hover-indicator {
  position: absolute; bottom: 0; left: 0; right: 0; background: #d4af37; color: #000;
  font-weight: bold; font-size: 0.8rem; padding: 4px; transform: translateY(100%); transition: 0.2s;
}
.driver-select-card:hover .hover-indicator { transform: translateY(0); }

/* FOOTER MODAL */
.modal-footer { padding: 15px; background: #0f0c08; border-top: 1px solid #333; text-align: right; }
.btn-save { background: #d4af37; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-save:hover { background: #ffdb60; }

/* MENSAJES EXITOSOS */
.success-body { padding: 30px 20px; display: flex; flex-direction: column; align-items: center; }
.success-icon { font-size: 3rem; margin-bottom: 15px; }
.success-title { color: #d4af37; margin: 0 0 10px 0; font-size: 1.4rem; }
.success-text { font-size: 1rem; margin: 5px 0 20px 0; color: #ccc; }
.btn-confirm-modal { background: #d4af37; border: none; color: #000; padding: 8px 24px; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%; }
.btn-confirm-modal:hover { background: #ffdb60; }

/* SPINNER */
.spinner { width: 30px; height: 30px; border: 3px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.global-loader { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #d4af37; }
.spinner.large { width: 50px; height: 50px; border-width: 4px; margin-bottom: 15px; }
.state-msg { text-align: center; color: #666; padding: 20px; }

@keyframes spin { to { transform: rotate(360deg); } }

/* MEDIA QUERIES */
@media (max-width: 900px) {
  .split-layout { flex-direction: column; height: auto; }
  .panel-section { height: 500px; }
  .assign-page { height: auto; overflow: auto; }
}

/* CLASE GLOBAL PARA MARCADOR MAPBOX (NO SCOPED) */
</style>

<style>
/* Estilo del marcador numérico en Mapbox */
.marker-digit {
  background: #d4af37;
  color: #000;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  border: 2px solid #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}
</style>