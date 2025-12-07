<template>
  <div class="orders-page">

    <!-- HEADER -->
    <header class="page-header">
      <h1 class="page-title">Gestión de Pedidos</h1>
      <p class="subtitle">Historial y creación de nuevas solicitudes</p>
    </header>

    <!-- PANEL PRINCIPAL -->
    <div class="main-panel">
      
      <div class="split-content">

        <!-- IZQUIERDA: TABLA (75%) -->
        <div class="table-section">
          <div class="section-header">
            <h2 class="panel-subtitle">📦 Listado de Pedidos</h2>
            <span class="badge">{{ orders.length }} registros</span>
          </div>

          <div class="table-scroll-area">
            
            <!-- LOADING STATE -->
            <div v-if="isLoadingList" class="state-msg">
              <div class="spinner"></div> Cargando historial...
            </div>

            <table v-else class="custom-table">
              <thead>
                <tr>
                  <th class="col-id">ID</th>
                  <th>Dirección</th>
                  <th>Descripción</th>
                  <th class="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="orders.length === 0">
                  <td colspan="4" class="empty-cell">No hay pedidos registrados.</td>
                </tr>
                <tr v-for="order in orders" :key="order.id">
                  <td class="col-id">#{{ order.id }}</td>
                  <td>{{ order.address }}</td>
                  <td class="desc-cell">
                    <span v-if="order.requirePhoto" title="Requiere Foto" class="photo-badge">📸</span>
                    {{ order.description }}
                  </td>
                  <td class="col-actions">
                    <div class="action-buttons">
                      <button class="btn-icon view" @click="openInfoModal(order)" title="Ver Mapa">
                        👁️
                      </button>
                      <button class="btn-icon delete" @click="deleteOrder(order.id)" title="Eliminar Pedido">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- DERECHA: FORMULARIO -->
        <div class="form-section">
          <h3 class="form-title">Nuevo Pedido</h3>
          
          <form @submit.prevent="addOrder" class="order-form">
            
            <!-- INPUT DIRECCIÓN -->
            <div class="form-group search-group">
              <label>Dirección de Entrega *</label>
              
              <button type="button" class="btn-open-map" @click="openPickerModal">
                🗺️ Seleccionar en Mapa
              </button>

              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  class="input-field" 
                  placeholder="Escribe para buscar..." 
                  @input="onSearchInput"
                  required
                >
                <div v-if="isSearching" class="input-loader"></div>

                <ul v-if="suggestions.length > 0" class="suggestions-list">
                  <li v-for="item in suggestions" :key="item.id" class="suggestion-item" @click="selectSuggestion(item)">
                    <span class="sug-icon">📍</span>
                    <div class="sug-text">
                      <span class="sug-main">{{ item.place_name.split(',')[0] }}</span>
                      <span class="sug-sub">{{ getShortAddress(item.place_name) }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div class="form-group">
              <label>Descripción *</label>
              <textarea v-model="form.description" class="input-field textarea" rows="3" placeholder="Detalles del paquete..." required></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Latitud <small>(Auto)</small></label>
                <input type="text" v-model="form.lat" class="input-field readonly" readonly placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Longitud <small>(Auto)</small></label>
                <input type="text" v-model="form.lng" class="input-field readonly" readonly placeholder="0.00">
              </div>
            </div>

            <!-- SWITCH EVIDENCIA -->
            <div class="form-group switch-group">
              <label class="switch-container">
                <input type="checkbox" v-model="form.requirePhoto">
                <span class="slider"></span>
                <span class="switch-text">¿Requiere evidencia fotográfica?</span>
              </label>
            </div>

            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-mini"></span>
              {{ isSubmitting ? 'Guardando...' : 'Guardar Pedido' }}
            </button>

          </form>
        </div>

      </div>
    </div>

    <!-- MODALES -->
    <teleport to="body">
      <!-- INFO MODAL -->
      <transition name="fade">
        <div v-if="showInfoModal" class="modal-overlay" @click.self="closeInfoModal">
          <div class="modal-container">
            <div class="modal-card" ref="infoModalCard">
              <header class="modal-header">
                <h2 class="modal-title">Detalle del Pedido #{{ selectedOrder?.id }}</h2>
                <button class="modal-close-x" @click="closeInfoModal">✕</button>
              </header>
              <div class="modal-body">
                <div class="map-wrapper">
                  <div ref="infoMapContainer" class="map-container"></div>
                </div>
                <div class="order-info">
                  <div class="info-row"><span class="label">📍 Dirección:</span><span class="value">{{ selectedOrder?.address }}</span></div>
                  <div class="info-row"><span class="label">📦 Descripción:</span><span class="value">{{ selectedOrder?.description }}</span></div>
                  <div class="info-row coords"><span class="label">🌐 Coordenadas:</span><span class="value">{{ selectedOrder?.lat }}, {{ selectedOrder?.lng }}</span></div>
                  <div class="info-row" v-if="selectedOrder?.requirePhoto">
                    <span class="label">📸 Evidencia:</span>
                    <span class="value highlight-gold">Requiere fotografía</span>
                  </div>
                </div>
              </div>
              <footer class="modal-footer">
                <button class="btn-close-modal" @click="closeInfoModal">Cerrar Ventana</button>
              </footer>
            </div>
          </div>
        </div>
      </transition>

      <!-- PICKER MODAL -->
      <transition name="fade">
        <div v-if="showPickerModal" class="modal-overlay" @click.self="closePickerModal">
          <div class="modal-container">
            <div class="modal-card large-modal">
              <header class="modal-header">
                <h2 class="modal-title">Seleccionar Ubicación</h2>
                <button class="modal-close-x" @click="closePickerModal">✕</button>
              </header>
              <div class="modal-body">
                <div class="map-wrapper large-map">
                  <div ref="pickerMapContainer" class="map-container"></div>
                  <div class="map-tooltip">📍 Haz clic en el mapa para ubicar el punto</div>
                </div>
                <div class="picker-info">
                  <p class="picker-label">Ubicación seleccionada:</p>
                  <p class="picker-address">{{ pickerTemp.address || 'Haz clic en el mapa...' }}</p>
                  <p class="picker-coords" v-if="pickerTemp.lat">Lat: {{ pickerTemp.lat.toFixed(5) }} | Lng: {{ pickerTemp.lng.toFixed(5) }}</p>
                </div>
              </div>
              <footer class="modal-footer">
                <button class="btn-cancel-modal" @click="closePickerModal">Cancelar</button>
                <button class="btn-confirm-modal" @click="confirmPickerSelection" :disabled="!pickerTemp.lat">Usar esta ubicación</button>
              </footer>
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
  name: "OrdersPage",
  data() {
    return {
      baseUrl: 'https://service.lujuria.crudzaso.com',
      mapboxAccessToken: "pk.eyJ1IjoianZlbGV6MDAwIiwiYSI6ImNtaWkzOHZ5dTAxbnkzZHE3Mmo2c2VnbjQifQ.R-ikqyiMMZVwUHOH9CJ6mg",
      
      orders: [], 
      isLoadingList: false,
      isSubmitting: false,
      
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

      showInfoModal: false,
      selectedOrder: null,
      infoMapInstance: null,

      showPickerModal: false,
      pickerMapInstance: null,
      pickerMarker: null,
      pickerTemp: { address: "", lat: null, lng: null },
    };
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    // --- 1. OBTENER PEDIDOS (GET) ---
    async fetchOrders() {
      this.isLoadingList = true;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${this.baseUrl}/api/Orders`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          this.orders = data.map(o => ({
            id: o.id,
            address: o.address,
            description: o.description,
            lat: o.latitude,
            lng: o.longitude,
            requirePhoto: o.requiresEvidence
          })).reverse();
        }
      } catch (err) {
        console.error("Error cargando pedidos:", err);
      } finally {
        this.isLoadingList = false;
      }
    },

    // --- 2. CREAR PEDIDO (POST CORREGIDO) ---
    async addOrder() {
      // 1. Sincronización básica
      if (!this.form.address && this.searchQuery) {
        this.form.address = this.searchQuery;
      }

      if (!this.form.address || !this.form.description) {
        return alert("⚠️ Dirección y descripción son obligatorias.");
      }

      this.isSubmitting = true;

      // 2. Limpieza de Decimales (Vital para evitar overflow en BD)
      // Usamos .toFixed(6) y volvemos a número
      const latFixed = parseFloat(Number(this.form.lat).toFixed(6)) || 0;
      const lngFixed = parseFloat(Number(this.form.lng).toFixed(6)) || 0;

      // 3. RECORTAR STRING (Seguridad contra desbordamiento VARCHAR)
      // Si tu BD tiene VARCHAR(100), esto evita el error 500
      const safeAddress = this.form.address.substring(0, 200).trim(); 
      const safeDescription = this.form.description.substring(0, 500).trim();

      // 4. Payload Estrictamente Tipado (camelCase)
      const payload = {
        description: safeDescription,
        latitude: latFixed,
        longitude: lngFixed,
        address: safeAddress,
        requiresEvidence: !!this.form.requirePhoto // Force boolean
      };

      console.log("🚀 Payload Final:", JSON.stringify(payload));

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Sesión no válida");

        const res = await fetch(`${this.baseUrl}/api/Orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Error ${res.status}`);
        }

        const newOrderData = await res.json();

        // 5. Actualizar UI
        const newOrderLocal = {
          id: newOrderData.id || Date.now(),
          address: newOrderData.address || payload.address,
          description: newOrderData.description || payload.description,
          lat: newOrderData.latitude || payload.latitude,
          lng: newOrderData.longitude || payload.longitude,
          requirePhoto: newOrderData.requiresEvidence || payload.requiresEvidence
        };

        this.orders.unshift(newOrderLocal);
        this.resetForm();

      } catch (error) {
        console.error("Error completo:", error);
        alert("⚠️ Error al guardar: " + error.message);
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.form = { address: "", description: "", lat: 0, lng: 0, requirePhoto: false };
      this.searchQuery = "";
    },

    // --- 3. ELIMINAR PEDIDO ---
    async deleteOrder(id) {
      if (!confirm("¿Estás seguro de eliminar este pedido?")) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.baseUrl}/api/Orders/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          this.orders = this.orders.filter(o => o.id !== id);
        } else {
          alert("No se pudo eliminar.");
        }
      } catch (error) {
        console.error(error);
      }
    },

    // --- AUTOCOMPLETADO ---
    onSearchInput() {
      if (!this.searchQuery) {
        this.form.address = ""; this.form.lat = 0; this.form.lng = 0;
      }
      clearTimeout(this.searchTimeout);
      if (this.searchQuery.length < 3) { this.suggestions = []; return; }
      
      this.isSearching = true;
      this.searchTimeout = setTimeout(() => { this.fetchSuggestions(); }, 350);
    },

    async fetchSuggestions() {
      // Limitar a Colombia (co)
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json?access_token=${this.mapboxAccessToken}&country=co&proximity=-75.56,6.25&types=address,poi&limit=5`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        this.suggestions = data.features || [];
      } catch (e) { console.error(e); } finally { this.isSearching = false; }
    },

    selectSuggestion(item) {
      this.searchQuery = item.place_name.split(',')[0]; 
      this.form.address = item.place_name; 
      this.form.lng = item.center[0];
      this.form.lat = item.center[1];
      this.suggestions = []; 
    },

    getShortAddress(fullAddress) {
      const parts = fullAddress.split(',');
      return parts.slice(1).join(',').trim();
    },

    // --- MODALES (MAPAS DARK-V11) ---
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
      const hasCoords = order.lat && order.lng && (order.lat !== 0 || order.lng !== 0);
      const center = hasCoords ? [order.lng, order.lat] : [-75.5658, 6.2476];
      mapboxgl.accessToken = this.mapboxAccessToken;
      const map = new mapboxgl.Map({
        container: this.$refs.infoMapContainer,
        style: "mapbox://styles/mapbox/dark-v11",
        center: center,
        zoom: hasCoords ? 15 : 11
      });
      this.infoMapInstance = markRaw(map);
      map.on("load", () => {
        map.resize();
        if (hasCoords) new mapboxgl.Marker({ color: "#d4af37" }).setLngLat(center).addTo(map);
      });
    },

    openPickerModal() {
      this.pickerTemp = { address: "", lat: null, lng: null };
      this.showPickerModal = true;
      nextTick(() => { this.initPickerMap(); });
    },
    closePickerModal() {
      this.showPickerModal = false;
      if (this.pickerMapInstance) { this.pickerMapInstance.remove(); this.pickerMapInstance = null; }
    },
    initPickerMap() {
      mapboxgl.accessToken = this.mapboxAccessToken;
      const startCenter = (this.form.lat && this.form.lng && this.form.lat !== 0) 
        ? [this.form.lng, this.form.lat] 
        : [-75.5658, 6.2476];

      const map = new mapboxgl.Map({
        container: this.$refs.pickerMapContainer,
        style: "mapbox://styles/mapbox/dark-v11",
        center: startCenter,
        zoom: 13
      });
      this.pickerMapInstance = markRaw(map);

      if (this.form.lat && this.form.lng && this.form.lat !== 0) {
        this.updatePickerMarker(this.form.lng, this.form.lat);
        this.pickerTemp.lat = this.form.lat;
        this.pickerTemp.lng = this.form.lng;
        this.pickerTemp.address = this.form.address;
      }

      map.on("load", () => map.resize());
      map.on("click", (e) => this.handleMapClick(e.lngLat));
    },
    async handleMapClick(lngLat) {
      const { lng, lat } = lngLat;
      this.updatePickerMarker(lng, lat);
      this.pickerTemp.lat = lat;
      this.pickerTemp.lng = lng;
      this.pickerTemp.address = "Cargando...";
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxAccessToken}&types=address,poi`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features?.length > 0) this.pickerTemp.address = data.features[0].place_name;
        else this.pickerTemp.address = "Ubicación seleccionada";
      } catch (e) { this.pickerTemp.address = "Ubicación manual"; }
    },
    updatePickerMarker(lng, lat) {
      if (this.pickerMarker) this.pickerMarker.remove();
      this.pickerMarker = new mapboxgl.Marker({ color: "#d4af37", draggable: false }).setLngLat([lng, lat]).addTo(this.pickerMapInstance);
    },
    confirmPickerSelection() {
      if (!this.pickerTemp.lat) return;
      this.form.lat = this.pickerTemp.lat;
      this.form.lng = this.pickerTemp.lng;
      this.form.address = this.pickerTemp.address;
      this.searchQuery = this.pickerTemp.address.split(',')[0]; 
      this.closePickerModal();
    }
  }
};
</script>

<style scoped>
/* ============= ESTRUCTURA MAESTRA ============= */
.orders-page {
  width: 100%; height: 100vh; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding-bottom: 5vh; padding-left: 20px; padding-right: 20px;
  box-sizing: border-box; background: transparent;
}
.page-header { flex-shrink: 0; margin-bottom: 20px; text-align: center; }
.page-title { margin: 0; font-size: 1.8rem; color: #d4af37; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.subtitle { margin: 5px 0 0; font-size: 0.9rem; color: #888; }

.main-panel {
  width: 100%; max-width: 1250px; height: auto; max-height: 85vh; min-height: 600px;
  display: flex; flex-direction: column; background: rgba(15, 12, 8, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 16px;
  backdrop-filter: blur(12px); box-shadow: 0 30px 80px rgba(0,0,0,0.8); overflow: hidden;
}
.split-content { display: flex; flex: 1; overflow: hidden; }

/* TABLA */
.table-section { flex: 3; display: flex; flex-direction: column; padding: 25px; border-right: 1px solid rgba(212, 175, 55, 0.1); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0; }
.panel-subtitle { margin: 0; color: #d4af37; font-size: 1.2rem; }
.badge { background: rgba(212,175,55,0.15); color: #d4af37; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; }
.table-scroll-area { flex: 1; overflow-y: auto; border-radius: 8px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.05); }

.custom-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.custom-table th { background: rgba(212, 175, 55, 0.1); color: #d4af37; padding: 12px; text-align: left; position: sticky; top: 0; backdrop-filter: blur(5px); z-index: 10; font-weight: 600; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
.custom-table td { padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #ccc; vertical-align: middle; }
.custom-table tr:hover { background: rgba(255, 255, 255, 0.03); }
.col-id { width: 60px; color: #d4af37; font-family: monospace; font-weight: bold; }
.desc-cell { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #999; }
.col-actions { width: 100px; text-align: center; }
.empty-cell { text-align: center; padding: 30px; color: #666; font-style: italic; }
.photo-badge { margin-right: 5px; cursor: help; font-size: 1rem; }

.action-buttons { display: flex; gap: 8px; justify-content: center; }
.btn-icon { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 5px 8px; cursor: pointer; font-size: 1rem; transition: all 0.2s; }
.btn-icon.view:hover { background: rgba(212, 175, 55, 0.2); border-color: #d4af37; }
.btn-icon.delete:hover { background: rgba(255, 80, 80, 0.2); border-color: #ff5050; }

/* FORMULARIO */
.form-section { flex: 1.2; background: rgba(212, 175, 55, 0.02); padding: 25px; display: flex; flex-direction: column; overflow-y: auto; }
.form-title { margin: 0 0 20px 0; color: #d4af37; font-size: 1.1rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 10px; }
.order-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 6px; position: relative; }
.form-row { display: flex; gap: 10px; }
.form-row .form-group { flex: 1; }
label { font-size: 0.8rem; color: #aaa; margin-left: 2px; }
label small { color: #666; }

.btn-open-map { margin-bottom: 5px; background: rgba(212, 175, 55, 0.1); border: 1px dashed #d4af37; color: #d4af37; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; text-align: left; transition: 0.2s; }
.btn-open-map:hover { background: rgba(212, 175, 55, 0.2); }

.input-wrapper { position: relative; }
.input-field { width: 100%; padding: 10px; background: #080808; border: 1px solid #333; border-radius: 6px; color: #fff; font-size: 0.9rem; box-sizing: border-box; transition: border-color 0.2s; }
.input-field:focus { outline: none; border-color: #d4af37; background: #0f0c08; }
.readonly { color: #666; cursor: default; border-color: #222; }
.input-loader { position: absolute; right: 10px; top: 10px; width: 14px; height: 14px; border: 2px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }

.suggestions-list { position: absolute; top: 100%; left: 0; right: 0; background: #121212; border: 1px solid #d4af37; border-top: none; border-radius: 0 0 8px 8px; z-index: 100; max-height: 200px; overflow-y: auto; box-shadow: 0 10px 20px rgba(0,0,0,0.9); padding: 0; margin: 0; list-style: none; }
.suggestion-item { display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid #222; cursor: pointer; align-items: center; }
.suggestion-item:last-child { border-bottom: none; }
.suggestion-item:hover { background: rgba(212, 175, 55, 0.15); }
.sug-icon { font-size: 1.1rem; }
.sug-text { display: flex; flex-direction: column; overflow: hidden; }
.sug-main { font-size: 0.9rem; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sug-sub { font-size: 0.75rem; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.textarea { resize: vertical; min-height: 80px; font-family: inherit; }

/* SWITCH */
.switch-container { display: flex; align-items: center; cursor: pointer; gap: 10px; }
.switch-container input { display: none; }
.slider { position: relative; width: 36px; height: 20px; background-color: #333; border-radius: 20px; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: .4s; }
input:checked + .slider { background-color: #d4af37; }
input:checked + .slider:before { transform: translateX(16px); }
.switch-text { font-size: 0.85rem; color: #ccc; }

.btn-submit { margin-top: 10px; padding: 12px; background: #d4af37; border: none; border-radius: 6px; color: #000; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px; }
.btn-submit:hover { background: #ffdb60; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3); }
.btn-submit:disabled { background: #665522; color: #999; cursor: not-allowed; transform: none; box-shadow: none; }

.spinner-mini { width: 16px; height: 16px; border: 2px solid #000; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
.spinner { width: 30px; height: 30px; border: 3px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
.state-msg { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; }

/* MODALES */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(5px); }
.modal-container { width: 100%; display: flex; justify-content: center; padding: 20px; }
.modal-card { width: 100%; max-width: 600px; background: #141414; border: 1px solid #d4af37; border-radius: 12px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,1); display: flex; flex-direction: column; }
.large-modal { max-width: 800px; }
.modal-header { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: #0f0c08; }
.modal-title { margin: 0; color: #d4af37; font-size: 1.2rem; }
.modal-close-x { background: transparent; border: none; color: #888; font-size: 1.5rem; cursor: pointer; }
.modal-close-x:hover { color: #fff; }
.modal-body { padding: 0; display: flex; flex-direction: column; }
.map-wrapper { width: 100%; height: 300px; border-bottom: 1px solid rgba(212,175,55,0.2); position: relative; }
.large-map { height: 400px; }
.map-container { width: 100%; height: 100%; }
.map-tooltip { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: #d4af37; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #d4af37; pointer-events: none; }
.order-info, .picker-info { padding: 20px; background: #1a1a1a; }
.info-row { margin-bottom: 10px; display: flex; gap: 10px; }
.info-row .label { color: #d4af37; font-weight: 600; min-width: 100px; }
.info-row .value { color: #ccc; }
.highlight-gold { color: #d4af37; font-weight: bold; border: 1px solid #d4af37; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
.coords { font-family: monospace; font-size: 0.9rem; color: #888; }
.picker-label { color: #888; font-size: 0.85rem; margin: 0 0 5px 0; }
.picker-address { color: #fff; font-size: 1rem; font-weight: bold; margin: 0 0 5px 0; }
.picker-coords { color: #d4af37; font-family: monospace; font-size: 0.85rem; margin: 0; }
.modal-footer { padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); text-align: right; background: #0f0c08; display: flex; justify-content: flex-end; gap: 10px; }
.btn-close-modal, .btn-cancel-modal { background: transparent; border: 1px solid #d4af37; color: #d4af37; padding: 8px 24px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
.btn-close-modal:hover, .btn-cancel-modal:hover { background: rgba(212, 175, 55, 0.15); color: #fff; border-color: #fff; }
.btn-confirm-modal { background: #d4af37; border: none; color: #000; padding: 8px 24px; border-radius: 6px; font-weight: 700; cursor: pointer; transition: 0.2s; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
.btn-confirm-modal:hover { background: #ffdb60; }
.btn-confirm-modal:disabled { background: #554415; color: #888; cursor: not-allowed; }

@keyframes spin { to {transform: rotate(360deg);} }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #d4af37; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>