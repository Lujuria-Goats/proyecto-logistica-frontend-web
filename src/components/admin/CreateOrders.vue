<template>
  <div class="orders-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Creación de Ruta</h1>
      <p class="subtitle">Agrega los pedidos que conformarán la nueva ruta</p>
    </header>

    <!-- PANEL PRINCIPAL -->
    <div class="main-panel">

      <div class="split-content">

        <!-- IZQUIERDA: LISTA DE LA RUTA ACTUAL (75%) -->
        <div class="table-section">
          
          <div class="section-header">
            <div class="header-left">
              <h2 class="panel-subtitle">📦 Pedidos en Cola</h2>
              <span class="badge">{{ orders.length }} paradas</span>
            </div>
            
            <!-- BOTÓN DE OPTIMIZAR -->
            <button 
              class="btn-optimize" 
              @click="generateRoute"
              :disabled="orders.length < 2 || isOptimizing"
              :title="orders.length < 2 ? 'Necesitas al menos 2 pedidos' : 'Crear ruta'"
            >
              <span v-if="isOptimizing" class="spinner-tiny"></span>
              <span v-else>⚡ Generar Ruta Optimizada</span>
            </button>
          </div>

          <!-- INPUT: NOMBRE DE LA RUTA -->
          <div class="route-name-wrapper">
            <input 
              type="text" 
              v-model="routeName" 
              class="input-field route-input" 
              placeholder="Nombre de la Ruta (Ej: Repartos Norte - Lunes)"
            />
          </div>

          <div class="table-scroll-area">
            <table class="custom-table">
              <thead>
                <tr>
                  <th class="col-id">#</th>
                  <th>Dirección</th>
                  <th>Descripción</th>
                  <th class="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="orders.length === 0">
                  <td colspan="4" class="empty-cell">
                    <div class="empty-content">
                      <span class="empty-icon">📍</span>
                      <p>La lista de ruta está vacía.</p>
                      <small>El primer pedido agregado será el punto de partida (Depósito).</small>
                    </div>
                  </td>
                </tr>
                <tr v-for="(order, index) in orders" :key="order.id" class="fade-in-row">
                  <td class="col-id">{{ index + 1 }}</td>
                  <td>{{ order.address }}</td>
                  <td class="desc-cell">
                    <span v-if="order.requirePhoto" title="Requiere Foto" class="photo-badge">📸</span>
                    {{ order.description }}
                  </td>
                  <td class="col-actions">
                    <div class="action-buttons">
                      <button class="btn-icon view" @click="openInfoModal(order)" title="Ver Ubicación">
                        👁️
                      </button>
                      <button class="btn-icon delete" @click="deleteOrder(order.id)" title="Quitar de la ruta">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- DERECHA: FORMULARIO DE AGREGAR -->
        <div class="form-section">
          <h3 class="form-title">Agregar Parada</h3>

          <form @submit.prevent="addOrder" class="order-form">

            <!-- INPUT DIRECCIÓN -->
            <div class="form-group search-group">
              <label>Dirección de Entrega *</label>
              
              <div class="input-wrapper">
                <input type="text" v-model="searchQuery" class="input-field" placeholder="Buscar dirección..."
                  @input="onSearchInput" required>
                <div v-if="isSearching" class="input-loader"></div>

                <ul v-if="suggestions.length > 0" class="suggestions-list">
                  <li v-for="item in suggestions" :key="item.id" class="suggestion-item"
                    @click="selectSuggestion(item)">
                    <span class="sug-icon">📍</span>
                    <div class="sug-text">
                      <span class="sug-main">{{ item.place_name.split(',')[0] }}</span>
                      <span class="sug-sub">{{ getShortAddress(item.place_name) }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- MAPA INTEGRADO (NUEVO) -->
            <div class="form-group map-group">
               <label>Ubicación (Click en el mapa para ajustar)</label>
               <div class="inline-map-wrapper">
                  <div ref="inlineMapContainer" class="map-container"></div>
               </div>
            </div>

            <div class="form-group">
              <label>Descripción *</label>
              <textarea v-model="form.description" class="input-field textarea" rows="2"
                placeholder="Ej: Caja pequeña, dejar en portería..." required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Latitud</label>
                <input type="text" v-model="form.lat" class="input-field readonly" readonly placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Longitud</label>
                <input type="text" v-model="form.lng" class="input-field readonly" readonly placeholder="0.00">
              </div>
            </div>

            <!-- SWITCH EVIDENCIA -->
            <div class="form-group switch-group">
              <label class="switch-container">
                <input type="checkbox" v-model="form.requirePhoto">
                <span class="slider"></span>
                <span class="switch-text">Requiere foto</span>
              </label>
            </div>

            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-mini"></span>
              {{ isSubmitting ? 'Agregando...' : 'Agregar a Ruta' }}
            </button>

          </form>
        </div>

      </div>
    </div>

    <!-- MODALES -->
    <teleport to="body">
      
      <!-- 1. INFO MODAL -->
      <transition name="fade">
        <div v-if="showInfoModal" class="modal-overlay" @click.self="closeInfoModal">
          <div class="modal-container">
            <div class="modal-card" ref="infoModalCard">
              <header class="modal-header">
                <h2 class="modal-title">Detalle de Parada</h2>
                <button class="modal-close-x" @click="closeInfoModal">✕</button>
              </header>
              <div class="modal-body">
                <div class="map-wrapper">
                  <div ref="infoMapContainer" class="map-container"></div>
                </div>
                <div class="order-info">
                  <div class="info-row"><span class="label">📍 Dirección:</span><span class="value">{{ selectedOrder?.address }}</span></div>
                  <div class="info-row"><span class="label">📦 Nota:</span><span class="value">{{ selectedOrder?.description }}</span></div>
                </div>
              </div>
              <footer class="modal-footer">
                <button class="btn-close-modal" @click="closeInfoModal">Cerrar</button>
              </footer>
            </div>
          </div>
        </div>
      </transition>

      <!-- 3. RUTA GENERADA MODAL -->
      <transition name="fade">
        <div v-if="showRouteModal" class="modal-overlay" @click.self="showRouteModal = false">
          <div class="modal-container">
            <div class="modal-card small-modal text-center">
              <div class="modal-body success-body">
                <div class="success-icon">🚀</div>
                <h2 class="modal-title success-title">¡Ruta Generada!</h2>
                <p class="success-text">Hemos optimizado y guardado la ruta.</p>
                <p class="success-subtext">Nombre: <strong>{{ routeName }}</strong></p>
                <p class="success-subtext">Distancia Total: <strong>{{ routeDistance.toFixed(2) }} km</strong></p>
                <button class="btn-confirm-modal full-width" @click="showRouteModal = false">Entendido</button>
              </div>
            </div>
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
  name: "CreateOrders",
  data() {
    return {
      baseUrl: 'http://service.apexvision.crudzaso.com',
      mapboxAccessToken: "pk.eyJ1IjoianZlbGV6MDAwIiwiYSI6ImNtaWkzOHZ5dTAxbnkzZHE3Mmo2c2VnbjQifQ.R-ikqyiMMZVwUHOH9CJ6mg",

      orders: [], 
      routeName: "", 
      
      isSubmitting: false,
      isOptimizing: false,
      isLoadingList: false,

      form: {
        address: "",
        description: "",
        lat: 0,
        lng: 0,
        requirePhoto: false
      },
      searchQuery: "",
      suggestions: [],
      isSearching: false,
      searchTimeout: null,

      // Mapa Integrado
      inlineMapInstance: null,
      inlineMarker: null,

      // Modales
      showInfoModal: false,
      selectedOrder: null,
      infoMapInstance: null,
      showRouteModal: false,
      routeDistance: 0
    };
  },
  mounted() {
    // Inicializar el mapa del formulario al cargar
    this.initInlineMap();
  },
  methods: {
    // --- 🔑 UTILS TOKEN ---
    getCleanToken() {
      let token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const parsed = JSON.parse(token);
        if (typeof parsed === 'object' && parsed.token) token = parsed.token;
        else if (typeof parsed === 'string') token = parsed;
      } catch (e) {}
      token = String(token).replace(/^"|"$/g, '');
      if (token.toLowerCase().startsWith('bearer ')) token = token.slice(7).trim();
      return token;
    },

    getUserIdFromToken(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.nameid || payload.companyId || "default-fleet";
      } catch (error) { 
        return "default-fleet"; 
      }
    },

    // --- MAPA INTEGRADO (INLINE) ---
    initInlineMap() {
      mapboxgl.accessToken = this.mapboxAccessToken;
      const startCenter = [-75.5658, 6.2476]; // Medellín por defecto

      const map = new mapboxgl.Map({
        container: this.$refs.inlineMapContainer,
        style: "mapbox://styles/mapbox/dark-v11",
        center: startCenter,
        zoom: 12
      });

      this.inlineMapInstance = markRaw(map);
      
      map.on("load", () => {
        map.resize();
        // Click en el mapa actualiza el formulario
        map.on("click", (e) => this.handleInlineMapClick(e.lngLat));
      });
    },

    async handleInlineMapClick(lngLat) {
      const { lng, lat } = lngLat;
      
      // Actualizar Formulario
      this.form.lat = lat;
      this.form.lng = lng;
      this.searchQuery = "Cargando ubicación...";
      
      // Mover Marcador
      this.updateInlineMarker(lng, lat);

      // Geocodificación Inversa
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxAccessToken}&types=address,poi`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.features?.length > 0) {
          const placeName = data.features[0].place_name;
          this.form.address = placeName;
          this.searchQuery = placeName.split(',')[0]; // Mostrar nombre corto en input
        } else {
          this.form.address = "Ubicación seleccionada en mapa";
          this.searchQuery = "Ubicación manual";
        }
      } catch (e) { 
        this.form.address = "Ubicación manual";
        this.searchQuery = "Ubicación manual";
      }
    },

    updateInlineMarker(lng, lat) {
      if (this.inlineMarker) this.inlineMarker.remove();
      this.inlineMarker = new mapboxgl.Marker({ color: "#d4af37", draggable: false })
        .setLngLat([lng, lat])
        .addTo(this.inlineMapInstance);
        
      // Centrar mapa suavemente
      this.inlineMapInstance.flyTo({ center: [lng, lat], zoom: 14 });
    },

    // --- 1. AGREGAR A LA RUTA ---
    async addOrder() {
      if (!this.form.address && this.searchQuery) {
        this.form.address = this.searchQuery;
      }
      if (!this.form.address || !this.form.description) {
        return alert("⚠️ Faltan datos obligatorios.");
      }

      this.isSubmitting = true;
      const payload = {
        description: this.form.description.trim(),
        latitude: parseFloat(Number(this.form.lat).toFixed(6)),
        longitude: parseFloat(Number(this.form.lng).toFixed(6)),
        address: this.form.address.substring(0, 200).trim(),
        requiresEvidence: !!this.form.requirePhoto
      };

      try {
        const token = this.getCleanToken();
        if (!token) throw new Error("Sesión expirada");

        // Guardar en BD para obtener ID real
        const res = await fetch(`${this.baseUrl}/api/Orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Error ${res.status}`);
        }

        const responseData = await res.json();
        const realId = responseData.orderId || responseData.id || responseData.Id;
        
        if (!realId) {
          throw new Error("El pedido se creó pero no se recibió un ID válido.");
        }

        // Agregar a lista local VISUAL
        const mappedOrder = {
          id: realId, 
          address: payload.address,
          description: payload.description,
          lat: payload.latitude,
          lng: payload.longitude,
          requirePhoto: payload.requiresEvidence
        };

        this.orders.push(mappedOrder);
        this.resetForm();

      } catch (error) {
        console.error(error);
        alert("⚠️ No se pudo agregar: " + error.message);
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.form = { address: "", description: "", lat: 0, lng: 0, requirePhoto: false };
      this.searchQuery = "";
      // Limpiar mapa
      if (this.inlineMarker) this.inlineMarker.remove();
      if (this.inlineMapInstance) this.inlineMapInstance.flyTo({ center: [-75.5658, 6.2476], zoom: 12 });
    },

    // --- 2. GENERAR RUTA (CORREGIDO PARA EL BACKEND) ---
    async generateRoute() {
      if (!this.routeName || !this.routeName.trim()) return alert("⚠️ Por favor, ingresa un nombre para la ruta.");
      if (this.orders.length < 2) return alert("Agrega al menos 2 pedidos para crear una ruta.");
      
      this.isOptimizing = true;
      const token = this.getCleanToken();
      const fleetId = String(this.getUserIdFromToken(token));

      // 1. Crear mapa temporal y payload para el Optimizador
      const tempMap = new Map();
      const locationsPayload = this.orders.map((order, index) => {
        // Usamos un ID temporal simple (1, 2, 3...) para el algoritmo
        const simpleId = index + 1; 
        tempMap.set(String(simpleId), order); 
        return {
          id: simpleId, 
          latitude: Number(parseFloat(order.lat).toFixed(6)),
          longitude: Number(parseFloat(order.lng).toFixed(6))
        };
      });

      console.log("🚀 Enviando a optimizar:", { fleetId, locations: locationsPayload });

      try {
        // --- PASO A: OPTIMIZAR (JAVA) ---
        const resOptimize = await fetch(`${this.baseUrl}/api/Optimizer/optimize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fleetId, locations: locationsPayload })
        });

        if (!resOptimize.ok) {
           const txt = await resOptimize.text();
           throw new Error(txt.includes("<!doctype") ? "Error del servidor de optimización" : txt);
        }

        const optimizedData = await resOptimize.json();
        this.routeDistance = optimizedData.totalDistanceKm || 0;

        // --- PASO B: REORDENAR Y PREPARAR DATOS ---
        
        // 1. Obtener la secuencia y ordenarla por número de secuencia
        const sortedSequence = optimizedData.optimizedOrder || [];
        sortedSequence.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
        
        // 2. Reconstruir la lista visual (this.orders) en el NUEVO ORDEN
        // Esto es vital: actualizamos la vista primero para que coincida con lo que se guarda
        const newOrderedOrders = [];
        sortedSequence.forEach(item => {
           const originalOrder = tempMap.get(String(item.id));
           if (originalOrder) {
             newOrderedOrders.push(originalOrder);
           }
        });

        // 3. Actualizar la variable reactiva
        this.orders = newOrderedOrders;

        // 4. Extraer los IDs REALES de la lista ya ordenada
        const orderedRealIds = this.orders.map(o => o.id);

        console.log("✅ IDs Reales ordenados para guardar:", orderedRealIds);

        if (orderedRealIds.length === 0) throw new Error("Error interno al procesar los IDs.");

        // --- PASO C: GUARDAR RUTA (.NET) ---
        const savePayload = {
          routeName: this.routeName.trim(),
          orderIds: orderedRealIds // Enviamos [ID_1, ID_2, ID_3] en el orden correcto
        };

        const resSave = await fetch(`${this.baseUrl}/api/Routes/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(savePayload)
        });

        if (!resSave.ok) {
           if (resSave.status === 401) throw new Error("⛔ 401 NO AUTORIZADO.");
           const txt = await resSave.text();
           throw new Error("Error guardando ruta: " + txt);
        }

        this.orders = []; 
        this.routeName = ""; 
        this.showRouteModal = true;

      } catch (error) {
        console.error("Error proceso ruta:", error);
        alert("⚠️ " + error.message);
      } finally {
        this.isOptimizing = false;
      }
    },

    // --- 3. QUITAR DE LA LISTA ---
    async deleteOrder(id) {
      if (String(id).length < 15) { 
        try {
          const token = this.getCleanToken();
          await fetch(`${this.baseUrl}/api/Orders/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (e) { console.error(e); }
      }
      this.orders = this.orders.filter(o => o.id !== id);
    },

    // --- UTILS MAPBOX (Autocomplete) ---
    onSearchInput() {
      if (!this.searchQuery) { this.form.address = ""; this.form.lat = 0; this.form.lng = 0; }
      clearTimeout(this.searchTimeout);
      if (this.searchQuery.length < 3) { this.suggestions = []; return; }
      this.isSearching = true;
      this.searchTimeout = setTimeout(() => { this.fetchSuggestions(); }, 350);
    },
    async fetchSuggestions() {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json?access_token=${this.mapboxAccessToken}&country=co&proximity=-75.56,6.25&types=address,poi&limit=5`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        this.suggestions = data.features || [];
      } catch (e) { } finally { this.isSearching = false; }
    },
    selectSuggestion(item) {
      this.searchQuery = item.place_name.split(',')[0];
      this.form.address = item.place_name;
      this.form.lng = item.center[0];
      this.form.lat = item.center[1];
      this.suggestions = [];
      // Sincronizar con el mapa inline
      this.updateInlineMarker(this.form.lng, this.form.lat);
    },
    getShortAddress(full) { return full.split(',').slice(1).join(',').trim(); },

    // Modales
    openInfoModal(order) {
      this.selectedOrder = order;
      this.showInfoModal = true;
      nextTick(() => { this.initInfoMap(order); });
    },
    closeInfoModal() {
      this.showInfoModal = false;
      if (this.infoMapInstance) { this.infoMapInstance.remove(); this.infoMapInstance = null; }
    },
    initInfoMap(order) {
      const hasCoords = order.lat && order.lng;
      const center = hasCoords ? [order.lng, order.lat] : [-75.5658, 6.2476];
      mapboxgl.accessToken = this.mapboxAccessToken;
      const map = new mapboxgl.Map({
        container: this.$refs.infoMapContainer,
        style: "mapbox://styles/mapbox/dark-v11",
        center: center,
        zoom: 15
      });
      this.infoMapInstance = markRaw(map);
      new mapboxgl.Marker({ color: "#d4af37" }).setLngLat(center).addTo(map);
    },
  }
};
</script>

<style scoped>
/* =========================================
   LAYOUT PRINCIPAL
   ========================================= */
.orders-page {
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

.main-panel {
  width: 100%;
  max-width: 1250px;
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
}

.split-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  /* El media query abajo controla la dirección en móviles */
}

/* =========================================
   SECCIÓN IZQUIERDA (TABLA)
   ========================================= */
.table-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  padding: 25px;
  border-right: 1px solid rgba(212, 175, 55, 0.1);
  min-width: 0; /* Evita desbordamiento en flex */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
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

/* Input Nombre de Ruta */
.route-name-wrapper {
  margin-bottom: 15px;
}

.route-input {
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  box-sizing: border-box;
  transition: all 0.2s;
}

.route-input:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.1);
}

.route-input::placeholder {
  color: #777;
  font-style: italic;
}

/* Botón Optimizar */
.btn-optimize {
  background: linear-gradient(90deg, #d4af37, #b8860b);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 800;
  padding: 8px 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 0.9rem;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-optimize:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(212, 175, 55, 0.4);
}

.btn-optimize:disabled {
  background: #2a2515;
  color: #666;
  cursor: not-allowed;
  box-shadow: none;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

/* Tabla y Scroll */
.table-scroll-area {
  flex: 1;
  overflow-y: auto;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.custom-table th {
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  padding: 12px;
  text-align: left;
  position: sticky;
  top: 0;
  backdrop-filter: blur(5px);
  z-index: 10;
  font-weight: 600;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.custom-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #ccc;
  vertical-align: middle;
}

.custom-table tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.col-id {
  width: 40px;
  color: #666;
  font-family: monospace;
  text-align: center;
}

.desc-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #999;
}

.col-actions {
  width: 90px;
  text-align: center;
}

/* Estados vacíos */
.empty-cell {
  text-align: center;
  padding: 50px;
  color: #666;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}

/* Badges y botones de acción */
.photo-badge {
  margin-right: 5px;
  cursor: help;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-icon {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-icon.view:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #d4af37;
}

.btn-icon.delete:hover {
  background: rgba(255, 80, 80, 0.2);
  border-color: #ff5050;
}

/* =========================================
   SECCIÓN DERECHA (FORMULARIO)
   ========================================= */
.form-section {
  flex: 1.2;
  background: rgba(212, 175, 55, 0.02);
  padding: 25px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-top: none; 
}

.form-title {
  margin: 0 0 20px 0;
  color: #d4af37;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding-bottom: 10px;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-row .form-group {
  flex: 1;
}

label {
  font-size: 0.8rem;
  color: #aaa;
  margin-left: 2px;
}

/* Inputs generales */
.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 10px;
  background: #080808;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #d4af37;
  background: #0f0c08;
}

.readonly {
  color: #666;
  cursor: default;
  border-color: #222;
}

.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* Loader dentro del input */
.input-loader {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 14px;
  height: 14px;
  border: 2px solid #d4af37;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Lista de sugerencias (Autocompletar) */
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #121212;
  border: 1px solid #d4af37;
  border-top: none;
  border-radius: 0 0 8px 8px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.9);
  padding: 0;
  margin: 0;
  list-style: none;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #222;
  cursor: pointer;
  align-items: center;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: rgba(212, 175, 55, 0.15);
}

.sug-icon {
  font-size: 1.1rem;
}

.sug-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sug-main {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sug-sub {
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mapa Inline en el Formulario */
.inline-map-wrapper {
  width: 100%;
  height: 220px; /* Tamaño mejorado */
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 5px;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  background: #111;
}

/* Switch */
.switch-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
}

.switch-container input {
  display: none;
}

.slider {
  position: relative;
  width: 36px;
  height: 20px;
  background-color: #333;
  border-radius: 20px;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked+.slider {
  background-color: #d4af37;
}

input:checked+.slider:before {
  transform: translateX(16px);
}

.switch-text {
  font-size: 0.85rem;
  color: #ccc;
}

/* Botón Submit */
.btn-submit {
  margin-top: 10px;
  padding: 12px;
  background: #d4af37;
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.btn-submit:hover:not(:disabled) {
  background: #ffdb60;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.btn-submit:disabled {
  background: #665522;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* =========================================
   MODALES
   ========================================= */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 600px;
  background: #141414;
  border: 1px solid #d4af37;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 1);
  display: flex;
  flex-direction: column;
}

.small-modal {
  max-width: 380px;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f0c08;
}

.modal-title {
  margin: 0;
  color: #d4af37;
  font-size: 1.2rem;
}

.modal-close-x {
  background: transparent;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-close-x:hover {
  color: #fff;
}

.modal-body {
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Cuerpo modal de éxito */
.success-body {
  padding: 30px 20px;
  align-items: center;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.success-title {
  color: #d4af37;
  margin: 0 0 10px 0;
}

.success-text {
  font-size: 1.1rem;
  margin: 5px 0;
  color: #fff;
}

.success-subtext {
  font-size: 0.9rem;
  color: #888;
  margin: 5px 0 25px 0;
}

/* Modal con mapa */
.map-wrapper {
  width: 100%;
  height: 300px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  position: relative;
}

.order-info {
  padding: 20px;
  background: #1a1a1a;
}

.info-row {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.info-row .label {
  color: #d4af37;
  font-weight: 600;
  min-width: 80px;
}

.info-row .value {
  color: #ccc;
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: right;
  background: #0f0c08;
}

.btn-close-modal {
  background: transparent;
  border: 1px solid #d4af37;
  color: #d4af37;
  padding: 8px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.btn-close-modal:hover {
  background: rgba(212, 175, 55, 0.15);
  color: #fff;
}

.btn-confirm-modal {
  background: #d4af37;
  border: none;
  color: #000;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: 0.2s;
  text-transform: uppercase;
}

.btn-confirm-modal:hover {
  background: #ffdb60;
}

/* =========================================
   UTILIDADES Y ANIMACIONES
   ========================================= */
.spinner-tiny {
  width: 16px;
  height: 16px;
  border: 2px solid #000;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.spinner-mini {
  width: 16px;
  height: 16px;
  border: 2px solid #000;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeInRow {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.fade-in-row {
  animation: fadeInRow 0.3s ease forwards;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Scrollbars Personalizados */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d4af37;
}

/* =========================================
   RESPONSIVE (Mejora de tamaños)
   ========================================= */
@media (max-width: 1000px) {
  .split-content {
    flex-direction: column;
    overflow-y: auto; /* Permite scroll vertical en toda el área */
  }

  .table-section {
    flex: none;
    height: 50%; /* Mitad para tabla */
    border-right: none;
    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  }

  .form-section {
    flex: none;
    height: 50%; /* Mitad para formulario */
  }
  
  .desc-cell {
    max-width: 150px; /* Reducir ancho texto en móvil */
  }
}
</style>