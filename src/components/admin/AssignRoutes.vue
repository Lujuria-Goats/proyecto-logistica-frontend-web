<template>
  <div class="assign-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Gestión de Rutas</h1>
      <p class="subtitle">Administra y asigna las rutas a tu flota</p>
    </header>

    <!-- PANEL PRINCIPAL -->
    <div class="main-panel">

      <div class="list-header-row">
        <h2 class="panel-subtitle">📍 Rutas Disponibles</h2>
        <span class="badge">{{ routes.length }} pendientes</span>
      </div>

      <!-- LISTA DE RUTAS (CARDS) -->
      <div class="scroll-area">
        <div v-if="isLoadingRoutes" class="state-msg">
          <div class="spinner"></div> Buscando rutas...
        </div>

        <div v-else-if="routes.length === 0" class="state-msg">
          No hay rutas pendientes de asignación.
        </div>

        <div v-else class="cards-grid">
          <div v-for="route in routes" :key="route.id" class="route-card">
            <div class="route-header">
              <div class="route-icon">🗺️</div>
              <div class="route-info">
                <h3 class="route-name">{{ route.name }}</h3>
                <p class="route-meta">{{ route.orders.length }} Paradas • {{ route.totalDist }} km est.</p>
              </div>
            </div>
            
            <div class="route-actions">
              <button class="btn-icon-action info" @click="openInfoModal(route)" title="Ver Información">
                ℹ️
              </button>
              <button class="btn-icon-action edit" @click="openEditModal(route)" title="Editar Puntos">
                ✏️
              </button>
              <button class="btn-main-assign" @click="openAssignModal(route)">
                👤 Asignar a Conductor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- MODAL 1: INFORMACIÓN (SOLO LECTURA)               -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showInfoModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card large-card">
              <header class="modal-header">
                <h2 class="modal-title">Detalle de Ruta</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              <div class="modal-body">
                <!-- MAPA -->
                <div class="map-wrapper">
                  <div ref="mapContainerInfo" class="map-container"></div>
                </div>
                <!-- LISTA DE PUNTOS -->
                <div class="points-list">
                  <h3 class="section-title">Puntos de Entrega</h3>
                  <div v-for="(point, index) in selectedRoute?.orders" :key="point.id" class="point-item">
                    <div class="point-index">{{ index + 1 }}</div>
                    <div class="point-data">
                      <p class="p-addr">{{ point.address }}</p>
                      <p class="p-desc">{{ point.description }}</p>
                      <div class="p-meta">
                        <span>🌐 {{ point.lat }}, {{ point.lng }}</span>
                        <span v-if="point.requirePhoto" class="tag-evidence">📸 Requiere Foto</span>
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

    <!-- ================================================= -->
    <!-- MODAL 2: EDICIÓN (ELIMINAR PUNTOS)                -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card large-card">
              <header class="modal-header">
                <h2 class="modal-title">Editar Ruta</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              <div class="modal-body">
                <div class="map-wrapper small-map">
                  <div ref="mapContainerEdit" class="map-container"></div>
                </div>
                <div class="points-list editable">
                  <div v-for="(point, index) in selectedRoute?.orders" :key="point.id" class="point-item">
                    <div class="point-index">{{ index + 1 }}</div>
                    <div class="point-data">
                      <p class="p-addr">{{ point.address }}</p>
                    </div>
                    <button class="btn-remove-point" @click="removeOrderFromRoute(point.id)">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
              <footer class="modal-footer">
                <button class="btn-save" @click="closeModals">Guardar Cambios</button>
              </footer>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ================================================= -->
    <!-- MODAL 3: ASIGNACIÓN (LISTA DE CONDUCTORES)        -->
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
                <p class="instruction-text">Elige a quién asignarás esta ruta de <strong>{{ selectedRoute?.orders.length }} paradas</strong>:</p>
                
                <div v-if="isLoadingDrivers" class="spinner-container"><div class="spinner"></div></div>
                
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

    <!-- OVERLAY DE CARGA GLOBAL -->
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
      routes: [], // Array de objetos { id, name, orders: [] }
      drivers: [],
      
      // Estados de carga
      isLoadingRoutes: false,
      isLoadingDrivers: false,
      isProcessing: false,

      // Modales
      showInfoModal: false,
      showEditModal: false,
      showAssignModal: false,
      
      selectedRoute: null,
      mapInstance: null,
      markers: []
    };
  },
  mounted() {
    this.fetchRoutes();
    this.fetchDrivers();
  },
  methods: {
    // --- 1. CARGA DE DATOS ---
    
    // Simulación de "Rutas": Agrupamos pedidos sin asignar
    async fetchRoutes() {
      this.isLoadingRoutes = true;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const allOrders = await res.json();
          
          // Filtramos solo los pedidos que NO tienen conductor (status != 2 y driverId == 0/null)
          const unassignedOrders = allOrders.filter(o => 
            (!o.driverId || o.driverId === 0) && o.status !== 2
          ).map(o => ({
            id: o.id,
            address: o.address,
            description: o.description,
            lat: o.latitude,
            lng: o.longitude,
            requirePhoto: o.requiresEvidence
          }));

          // CREAMOS UNA RUTA VIRTUAL CON ESTOS PEDIDOS
          // Si tuvieras lógica de agrupación, aquí crearías varios objetos
          if (unassignedOrders.length > 0) {
            this.routes = [{
              id: 'temp-route-1',
              name: 'Ruta Pendiente #1',
              totalDist: (unassignedOrders.length * 1.5).toFixed(1), // Estimado fake
              orders: unassignedOrders
            }];
          } else {
            this.routes = [];
          }
        }
      } catch (e) { console.error(e); } 
      finally { this.isLoadingRoutes = false; }
    },

    async fetchDrivers() {
      this.isLoadingDrivers = true;
      try {
        const token = localStorage.getItem('token');
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

    // --- 2. GESTIÓN DE MODALES ---

    openInfoModal(route) {
      this.selectedRoute = route;
      this.showInfoModal = true;
      nextTick(() => this.initMap(this.$refs.mapContainerInfo));
    },

    openEditModal(route) {
      this.selectedRoute = route;
      this.showEditModal = true;
      nextTick(() => this.initMap(this.$refs.mapContainerEdit));
    },

    openAssignModal(route) {
      this.selectedRoute = route;
      this.showAssignModal = true;
    },

    closeModals() {
      this.showInfoModal = false;
      this.showEditModal = false;
      this.showAssignModal = false;
      this.selectedRoute = null;
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }
    },

    // --- 3. LOGICA DE NEGOCIO ---

    // Eliminar pedido de la ruta (simulado o API delete)
    async removeOrderFromRoute(orderId) {
      if(!confirm("¿Quitar este punto de la ruta? (Se eliminará el pedido)")) return;
      
      try {
        const token = localStorage.getItem('token');
        await fetch(`${this.baseUrl}/api/Orders/${orderId}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Actualizar localmente
        this.selectedRoute.orders = this.selectedRoute.orders.filter(o => o.id !== orderId);
        
        // Refrescar mapa
        this.initMap(this.$refs.mapContainerEdit); 
        
        // Si la ruta queda vacía, refrescar todo
        if(this.selectedRoute.orders.length === 0) {
          this.closeModals();
          this.fetchRoutes();
        }
      } catch (e) { alert("Error al eliminar"); }
    },

    // Asignar toda la ruta al conductor seleccionado
    async assignRouteToDriver(driver) {
      this.isProcessing = true;
      const token = localStorage.getItem("token");
      
      try {
        // Iteramos sobre todos los pedidos de la ruta y los asignamos
        const promises = this.selectedRoute.orders.map(order => 
          fetch(`${this.baseUrl}/api/Orders/${order.id}/assign/${driver.id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        );

        await Promise.all(promises);
        
        // Éxito
        this.closeModals();
        this.fetchRoutes(); // Recargar para que desaparezca la ruta asignada
        alert(`✅ Ruta asignada exitosamente a ${driver.name}`);

      } catch (e) {
        console.error(e);
        alert("Hubo un error asignando algunos pedidos.");
      } finally {
        this.isProcessing = false;
      }
    },

    // --- 4. MAPAS ---
    initMap(container) {
      if (!container || !this.selectedRoute) return;
      
      mapboxgl.accessToken = this.mapboxAccessToken;
      const map = new mapboxgl.Map({
        container: container,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [-75.5658, 6.2476],
        zoom: 11
      });
      this.mapInstance = markRaw(map);

      map.on("load", () => {
        map.resize();
        this.renderMarkers(map);
      });
    },

    renderMarkers(map) {
      const bounds = new mapboxgl.LngLatBounds();
      
      this.selectedRoute.orders.forEach((order, index) => {
        // Marcador personalizado numérico
        const el = document.createElement('div');
        el.className = 'marker-digit';
        el.innerText = index + 1;
        
        new mapboxgl.Marker(el)
          .setLngLat([order.lng, order.lat])
          .addTo(map);
          
        bounds.extend([order.lng, order.lat]);
      });

      if (this.selectedRoute.orders.length > 0) {
        map.fitBounds(bounds, { padding: 50 });
      }
    }
  }
};
</script>

<style scoped>
/* ESTILOS GLOBALES */
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
.page-title { margin: 0; font-size: 1.8rem; color: #d4af37; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8); }
.subtitle { margin: 5px 0 0; font-size: 0.9rem; color: #888; }

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
  padding: 25px;
}

.list-header-row {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 15px;
}
.panel-subtitle { margin: 0; color: #d4af37; font-size: 1.3rem; }
.badge { background: rgba(212, 175, 55, 0.15); color: #d4af37; padding: 4px 10px; border-radius: 12px; font-weight: bold; }

.scroll-area { flex: 1; overflow-y: auto; padding-right: 5px; }

/* CARDS DE RUTA */
.cards-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
}

.route-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex; flex-direction: column; gap: 15px;
  transition: transform 0.2s;
}
.route-card:hover { transform: translateY(-3px); border-color: #d4af37; background: rgba(255, 255, 255, 0.05); }

.route-header { display: flex; align-items: center; gap: 15px; }
.route-icon { font-size: 2rem; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 50%; }
.route-info { flex: 1; }
.route-name { margin: 0; color: #fff; font-size: 1.1rem; }
.route-meta { margin: 5px 0 0; color: #888; font-size: 0.9rem; }

.route-actions {
  display: flex; gap: 10px; margin-top: auto;
}
.btn-icon-action {
  background: rgba(255,255,255,0.1); border: none; border-radius: 8px;
  width: 40px; height: 40px; cursor: pointer; font-size: 1.2rem; transition: 0.2s;
}
.btn-icon-action:hover { background: rgba(255,255,255,0.2); }
.btn-icon-action.edit:hover { background: rgba(212, 175, 55, 0.2); color: #d4af37; }

.btn-main-assign {
  flex: 1; background: #d4af37; border: none; border-radius: 8px;
  color: #000; font-weight: bold; cursor: pointer; transition: 0.2s;
}
.btn-main-assign:hover { background: #ffdb60; }

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

/* SPINNER & GLOBAL LOADER */
.spinner { width: 30px; height: 30px; border: 3px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.global-loader {
  position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 3000;
  display: flex; flex-direction: column; align-items: center; justify-content: center; color: #d4af37;
}
.spinner.large { width: 50px; height: 50px; border-width: 4px; margin-bottom: 15px; }

@keyframes spin { to { transform: rotate(360deg); } }

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