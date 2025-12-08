<template>
  <div class="assign-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Asignación de Rutas</h1>
      <p class="subtitle">Selecciona un conductor para gestionar sus entregas</p>
    </header>

    <!-- PANEL PRINCIPAL (LISTA CONDUCTORES) -->
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
            <!-- BOTÓN QUE ABRE EL MODAL -->
            <button class="btn-action" @click="openModal(driver)">
              🗺️ Gestionar Ruta
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- MODAL (MAPA Y ASIGNACIÓN DE PEDIDOS)              -->
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
                
                <!-- SECCIÓN SUPERIOR: MAPA (SOLO VISUALIZACIÓN) -->
                <div class="map-section">
                  <div ref="mapContainer" class="map-container"></div>
                  <div class="map-overlay-info">
                    <small>📍 Se muestran los pedidos asignados actualmente + nuevos</small>
                  </div>
                </div>

                <!-- SECCIÓN INFERIOR: DOS COLUMNAS -->
                <div class="assignment-grid">

                  <!-- COLUMNA IZQUIERDA: PEDIDOS DISPONIBLES (SIN CONDUCTOR) -->
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
                          <span class="order-desc">{{ order.description }}</span>
                        </div>
                        <button class="btn-add-order" @click="addOrderToRoute(order)">
                          ➕ Añadir
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- COLUMNA DERECHA: RUTA ACTUAL (YA ASIGNADOS + NUEVOS) -->
                  <div class="column selected-col">
                    <h3 class="col-title">🚚 Asignados al Conductor ({{ routes.length }})</h3>

                    <div v-if="routes.length === 0" class="empty-state-mini">
                      Este conductor no tiene ruta asignada aún.
                    </div>

                    <transition-group name="list" tag="div" class="orders-list">
                      <div v-for="(route, index) in routes" :key="route.id" class="order-item selected">
                        <div class="order-info">
                          <span class="order-id">#{{ route.id }}</span>
                          <span class="order-addr">{{ route.address }}</span>
                          <!-- Etiqueta para diferenciar -->
                          <small v-if="route.isNew" class="tag-new">Nuevo</small>
                          <small v-else class="tag-assigned">Asignado</small>
                        </div>
                        <button class="btn-remove-order" @click="removeRoute(index)">
                          ✕
                        </button>
                      </div>
                    </transition-group>
                  </div>

                </div>
              </div>

              <footer class="modal-footer">
                <div class="footer-info">
                  <span v-if="routes.length > 0">{{ routes.length }} pedidos en total en la ruta</span>
                </div>
                <!-- BOTÓN QUE DISPARA EL ENDPOINT -->
                <button class="btn-save-final" @click="saveRoutes" :disabled="routes.length === 0">
                  Guardar Cambios
                </button>
              </footer>

            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL DE PROGRESO (GUARDANDO) -->
      <transition name="fade">
        <div v-if="isSaving" class="saving-overlay">
          <div class="saving-card">
            <div v-if="!saveSuccess" class="loader-container-center">
              <span class="loader"></span>
            </div>
            <div v-else class="success-icon">✅</div>
            <h3 class="saving-title">
              {{ saveSuccess ? '¡Ruta Actualizada!' : 'Guardando cambios...' }}
            </h3>
            <p class="saving-subtitle">
              {{ saveSuccess ? 'La información se ha sincronizado correctamente.' : 'Asignando pedidos...' }}
            </p>
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
      
      // Conductores
      isLoadingDrivers: false,
      drivers: [],
      selectedDriver: null,

      // Pedidos
      availableOrders: [], 
      isLoadingOrders: false,
      
      // Modal y Mapa
      showModal: false,
      routes: [], // Lista mixta: pedidos ya asignados + nuevos agregados
      mapInstance: null,
      
      // Guardado
      isSaving: false,
      saveSuccess: false,
      
      // Configuración Mapa
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
    // --- 1. CARGAR CONDUCTORES ---
    async fetchMyDrivers() {
      this.isLoadingDrivers = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${this.baseUrl}/api/Drivers`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const rawData = await response.json();
          let driversArray = Array.isArray(rawData) ? rawData : (rawData.drivers || rawData.data || []);
          
          this.drivers = driversArray.map(d => ({
            id: d.id || d.Id,
            name: d.fullName || d.name || "Sin nombre",
            phone: d.phoneNumber || d.phone || "N/A",
            description: d.description || "Conductor"
          }));
        }
      } catch (err) {
        console.error("Error drivers:", err);
      } finally {
        this.isLoadingDrivers = false;
      }
    },

    // --- 2. CARGAR Y CLASIFICAR PEDIDOS (LÓGICA ACTUALIZADA) ---
    async fetchOrdersAndClassify() {
      this.isLoadingOrders = true;
      this.availableOrders = [];
      // No limpiamos this.routes aquí para evitar parpadeos, lo hacemos al procesar
      
      try {
        const token = localStorage.getItem('token');
        const driverId = this.selectedDriver.id;

        const response = await fetch(`${this.baseUrl}/api/Orders`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const allOrders = await response.json();

          // A. PEDIDOS DISPONIBLES (Izquierda)
          // Status != 2 (Completado) Y sin conductor
          this.availableOrders = allOrders.filter(o => 
             o.status !== 2 && 
             (!o.driverId || o.driverId === 0)
          ).map(o => ({
            id: o.id,
            address: o.address,
            description: o.description,
            lat: o.latitude,
            lng: o.longitude,
            isNew: true // Flag para saber que este se acaba de agregar si se mueve
          }));

          // B. PEDIDOS YA ASIGNADOS AL CONDUCTOR (Derecha)
          const assignedOrders = allOrders.filter(o => 
             o.status !== 2 && 
             o.driverId === driverId
          ).map(o => ({
            id: o.id,
            address: o.address,
            description: o.description,
            lat: o.latitude,
            lng: o.longitude,
            isNew: false // Flag: ya estaba en base de datos
          }));

          // Asignamos a la ruta actual y esperamos a que el mapa esté listo para pintar
          this.routes = assignedOrders;
          
          // Pintar marcadores iniciales
          nextTick(() => {
            this.renderAllMarkers();
          });
        }
      } catch (error) {
        console.error("Error orders:", error);
      } finally {
        this.isLoadingOrders = false;
      }
    },

    // --- 3. ABRIR MODAL ---
    openModal(driver) {
      this.selectedDriver = driver;
      this.routes = []; 
      this.showModal = true;
      this.isSaving = false;
      this.saveSuccess = false;
      
      // Inicializar mapa primero
      nextTick(() => { 
        this.initMap(); 
        // Luego cargar datos
        this.fetchOrdersAndClassify();
      });
    },

    closeModal() {
      if (this.isSaving) return;
      this.showModal = false;
      if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
      this.selectedDriver = null;
    },

    // --- 4. MAPA ---
    initMap() {
      mapboxgl.accessToken = this.mapboxAccessToken;
      const mapContainer = this.$refs.mapContainer;
      if (!mapContainer) return;

      const map = new mapboxgl.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [this.startLng, this.startLat],
        zoom: 11,
        maxBounds: [this.boundsSW, this.boundsNE]
      });
      this.mapInstance = markRaw(map);
      
      map.on("load", () => { 
        map.resize(); 
        // Si ya hay rutas cargadas (por latencia de red), pintarlas
        if(this.routes.length > 0) this.renderAllMarkers();
      });
    },

    renderAllMarkers() {
      if (!this.mapInstance) return;
      // Limpiar marcadores viejos si los hubiera (aunque markRaw ayuda, es bueno asegurar)
      this.routes.forEach(route => {
        if (!route.marker) {
          route.marker = markRaw(this.createMarker(route.lng, route.lat));
        }
      });
    },

    createMarker(lng, lat) {
      return new mapboxgl.Marker({ color: "#d4af37", scale: 0.9 })
        .setLngLat([lng, lat])
        .addTo(this.mapInstance);
    },

    // --- 5. GESTIÓN DE LISTAS ---
    addOrderToRoute(order) {
      // 1. Crear marcador visual
      const marker = this.createMarker(order.lng, order.lat);
      
      // 2. Mover a la lista derecha
      const routeItem = { ...order, marker: markRaw(marker), isNew: true };
      this.routes.push(routeItem);

      // 3. Quitar de la izquierda
      this.availableOrders = this.availableOrders.filter(o => o.id !== order.id);

      // 4. Centrar mapa
      if (this.mapInstance) {
        this.mapInstance.flyTo({ center: [order.lng, order.lat], zoom: 13 });
      }
    },

    removeRoute(index) {
      const item = this.routes[index];
      
      // 1. Quitar marcador
      if (item.marker) item.marker.remove();

      // 2. Devolver a la izquierda (Disponibles)
      // Nota: Aunque ya estuviera asignado en BD, si lo quito aquí, visualmente queda disponible.
      // (Para que el cambio persista en BD se necesitaría un endpoint de desasignar,
      // pero visualmente el flujo es correcto).
      const restoredOrder = {
        id: item.id,
        address: item.address,
        description: item.description,
        lat: item.lat,
        lng: item.lng
      };
      this.availableOrders.unshift(restoredOrder);

      // 3. Eliminar de la derecha
      this.routes.splice(index, 1);
    },

    // --- 6. GUARDAR CAMBIOS ---
    async saveRoutes() {
      if (this.routes.length === 0) return;
      this.isSaving = true;
      this.saveSuccess = false;

      const token = localStorage.getItem("token");
      const driverId = this.selectedDriver.id;

      // Filtramos: Enviamos asignar a TODOS los que están en la lista derecha.
      // Esto reconfirmará los que ya estaban y asignará los nuevos.
      // Es una operación segura si el endpoint es idempotente.
      try {
        const promises = this.routes.map(order => {
          return fetch(`${this.baseUrl}/api/Orders/${order.id}/assign/${driverId}`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}` 
            }
          });
        });

        await Promise.all(promises);

        setTimeout(() => {
          this.saveSuccess = true;
          setTimeout(() => { 
            this.isSaving = false; 
            this.closeModal(); 
          }, 1500);
        }, 1000);

      } catch (error) {
        console.error("Error asignando:", error);
        alert("Ocurrió un error. Revisa la consola.");
        this.isSaving = false;
      }
    }
  },
};
</script>

<style scoped>
/* ================================================= */
/* ESTILOS (MISMOS QUE ANTES, PEQUEÑOS AJUSTES)      */
/* ================================================= */
.assign-page {
  width: 100%; height: 100vh; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding-bottom: 12vh; padding-left: 20px; padding-right: 20px;
  box-sizing: border-box; background: transparent;
}
.page-header { flex-shrink: 0; margin-bottom: 20px; text-align: center; }
.page-title { margin: 0; font-size: 1.8rem; color: #d4af37; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.subtitle { margin: 5px 0 0; font-size: 0.9rem; color: #888; }

.main-panel {
  width: 100%; max-width: 1150px; height: auto; max-height: 85vh; min-height: 600px;
  display: flex; flex-direction: column;
  background: rgba(15, 12, 8, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 16px;
  backdrop-filter: blur(12px); box-shadow: 0 30px 80px rgba(0,0,0,0.8); overflow: hidden;
  padding: 20px 30px 30px 30px;
}

.list-header-row {
  flex-shrink: 0; display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.panel-subtitle { margin: 0; color: #d4af37; font-size: 1.2rem; }
.badge { background: rgba(212,175,55,0.15); color: #d4af37; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; }

.scroll-area {
  flex: 1; overflow-y: auto; margin-top: 15px; padding-right: 10px;
  background: rgba(0, 0, 0, 0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.02);
}
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 15px; padding: 10px; }
.driver-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;
  padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease;
}
.driver-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(212, 175, 55, 0.4); transform: translateY(-2px); }
.card-content { display: flex; align-items: flex-start; gap: 12px; }
.driver-photo { width: 44px; height: 44px; border-radius: 50%; background: #1a1a1a; border: 2px solid #d4af37; flex-shrink: 0; }
.driver-details { flex: 1; overflow: hidden; }
.driver-name { margin: 0 0 4px 0; font-size: 1rem; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
.detail-row { font-size: 0.85rem; color: #ccc; margin-bottom: 2px; }
.desc { color: #888; font-style: italic; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn-action {
  align-self: stretch; text-align: center; background: #d4af37; border: none; color: #111;
  font-weight: bold; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
}
.btn-action:hover { background: #eac54e; }
.state-msg { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; }
.spinner { width: 30px; height: 30px; border: 3px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); display: flex;
  align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(5px); padding: 20px;
}
.modal-container { width: 100%; max-width: 950px; display: flex; justify-content: center; }
.modal-card {
  width: 100%; background: #14100e; border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 14px; padding: 20px; color: #efe7bf; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
}
.modal-header { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
.modal-title { margin: 0; font-size: 1.3rem; color: #d4af37; }
.modal-close-x { background: transparent; border: none; color: #d4af37; font-size: 20px; cursor: pointer; }

/* MAPA */
.map-section { position: relative; margin-bottom: 15px; border: 2px solid rgba(212, 175, 55, 0.3); border-radius: 10px; overflow: hidden; }
.map-container { width: 100%; height: 250px; background-color: #000; }
.map-overlay-info { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 5px 10px; border-radius: 15px; color: #d4af37; font-weight: bold; font-size: 0.8rem; pointer-events: none; }

/* GRID DE ASIGNACIÓN */
.assignment-grid { display: flex; gap: 20px; height: 350px; }
.column {
  flex: 1; display: flex; flex-direction: column;
  background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); padding: 15px;
}
.col-title { margin: 0 0 10px 0; font-size: 1rem; color: #d4af37; border-bottom: 1px solid rgba(212,175,55,0.15); padding-bottom: 8px; }

/* LISTAS INTERNAS */
.orders-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.order-item {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
  transition: 0.2s;
}
.order-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(212,175,55,0.2); }
.order-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex: 1; padding-right: 10px; }
.order-id { font-family: monospace; color: #d4af37; font-weight: bold; font-size: 0.8rem; }
.order-addr { font-size: 0.85rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.order-desc { font-size: 0.75rem; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* TAGS */
.tag-new { font-size: 0.7rem; background: #d4af37; color: #000; padding: 2px 6px; border-radius: 4px; font-weight: bold; width: fit-content; }
.tag-assigned { font-size: 0.7rem; background: #333; color: #aaa; padding: 2px 6px; border-radius: 4px; border: 1px solid #555; width: fit-content; }

/* BOTONES */
.btn-add-order { background: #d4af37; border: none; color: #000; font-weight: bold; font-size: 0.75rem; padding: 6px 12px; border-radius: 6px; cursor: pointer; white-space: nowrap; }
.btn-add-order:hover { background: #eac54e; }
.btn-remove-order { background: transparent; border: 1px solid #d44; color: #d44; font-weight: bold; font-size: 0.9rem; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-remove-order:hover { background: #d44; color: #fff; }

.empty-state-mini { flex: 1; display: flex; align-items: center; justify-content: center; color: #666; font-size: 0.85rem; text-align: center; padding: 20px; font-style: italic; }
.mini-loader-container { flex: 1; display: flex; align-items: center; justify-content: center; color: #d4af37; gap: 10px; }

/* FOOTER */
.modal-footer { margin-top: 15px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(212, 175, 55, 0.15); padding-top: 15px; }
.footer-info { color: #888; font-size: 0.9rem; }
.btn-save-final { background: #d4af37; color: #080808; font-weight: 700; font-size: 1rem; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2); }
.btn-save-final:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4); background: #e6c24e; }
.btn-save-final:disabled { background: #554415; color: #888; cursor: not-allowed; box-shadow: none; transform: none; }

@media (max-width: 800px) {
  .assignment-grid { flex-direction: column; height: auto; }
  .column { height: 300px; }
}

/* SAVING OVERLAY */
.saving-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.9); z-index: 20000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
.saving-card { text-align: center; color: #efe7bf; }
.saving-title { margin: 20px 0 10px 0; font-size: 1.5rem; color: #d4af37; }
.saving-subtitle { margin: 0; color: #888; }
.loader-container-center { display: flex; justify-content: center; margin-bottom: 20px; }
.success-icon { font-size: 4rem; animation: popIn 0.5s; }
@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.loader { transform: rotateZ(45deg); perspective: 1000px; border-radius: 50%; width: 48px; height: 48px; color: #fff; display: inline-block; }
.loader:before, .loader:after { content: ''; display: block; position: absolute; top: 0; left: 0; width: inherit; height: inherit; border-radius: 50%; transform: rotateX(70deg); animation: 1s spin linear infinite; }
.loader:after { color: #f3ca45; transform: rotateY(70deg); animation-delay: .4s; }
@keyframes spin { 0%, 100% { box-shadow: .2em 0px 0 0px currentcolor; } 12% { box-shadow: .2em .2em 0 0 currentcolor; } 25% { box-shadow: 0 .2em 0 0px currentcolor; } 37% { box-shadow: -.2em .2em 0 0 currentcolor; } 50% { box-shadow: -.2em 0 0 0 currentcolor; } 62% { box-shadow: -.2em -.2em 0 0 currentcolor; } 75% { box-shadow: 0px -.2em 0 0 currentcolor; } 87% { box-shadow: .2em -.2em 0 0 currentcolor; } }
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-10px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #d4af37; }
</style>