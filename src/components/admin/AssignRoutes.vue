<template>
  <div class="assign-page">
    <h1 class="page-title">Asignar Rutas</h1>
    <p class="subtitle">Área Metropolitana del Valle de Aburrá</p>

    <!-- LISTA DE TRANSPORTADORES -->
    <div class="drivers-grid">
      <div v-for="driver in drivers" :key="driver.id" class="driver-card">
        <div class="driver-header">
          <h3>{{ driver.name }}</h3>
          <p class="driver-id">ID: {{ driver.id }}</p>
        </div>
        <div class="driver-buttons">
          <button class="btn-assign" @click="openModal(driver)">Asignar Ruta</button>
        </div>
      </div>
    </div>

    <!-- MODAL PRINCIPAL -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <div class="modal-card" ref="modalCard" tabindex="-1">

              <header class="modal-header">
                <h2 class="modal-title">Nueva Ruta (Área Metropolitana)</h2>
                <button class="modal-close-x" @click="closeModal">✕</button>
              </header>

              <div class="modal-body">
                <div class="driver-info">
                  <div class="driver-photo"></div>
                  <div class="driver-data">
                    <p class="driver-label">Transportador:</p>
                    <h3 class="driver-name">{{ selectedDriver?.name }}</h3>
                  </div>
                </div>

                <!-- MAPA -->
                <div class="map-section">
                  <div ref="mapContainer" class="map-container"></div>

                  <!-- Mensaje de error (Badge rojo) -->
                  <div v-if="errorMessage" class="error-badge">{{ errorMessage }}</div>

                  <div class="map-instructions">
                    <small>📍 Clic en el mapa para fijar punto exacto</small>
                  </div>
                </div>

                <!-- BUSCADOR INTELIGENTE -->
                <div class="route-input-section">
                  <div class="search-container">
                    <input type="text" v-model="searchQuery" placeholder="Buscar: Dirección, C.C., Unidad, Empresa..."
                      class="input-field" :disabled="isSearching" @input="onSearchInput"
                      @keydown.down.prevent="navigateSuggestions(1)" @keydown.up.prevent="navigateSuggestions(-1)"
                      @keydown.enter.prevent="handleEnterKey" />

                    <!-- Spinner pequeño dentro del input si está validando -->
                    <div v-if="isSearching" class="input-spinner"></div>

                    <ul v-if="suggestions.length > 0" class="suggestions-list">
                      <li v-for="(item, index) in suggestions" :key="item.id" class="suggestion-item"
                        :class="{ 'highlighted': index === highlightIndex }" @click="selectSuggestion(item)">
                        <span class="suggestion-icon">
                          {{ item.place_type.includes('poi') ? '🏢' : '🏠' }}
                        </span>

                        <div class="suggestion-text">
                          <span class="suggestion-main">{{ formatSuggestion(item.place_name) }}</span>
                          <span class="suggestion-sub">{{ getCityFromSuggestion(item.place_name) }}</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <!-- Botón cambiado a "Agregar" con validación -->
                  <button class="btn-assign-small" @click="handleEnterKey" :disabled="isSearching">
                    {{ isSearching ? '...' : 'Agregar' }}
                  </button>
                </div>

                <!-- LISTA DE RUTAS -->
                <div class="routes-list">
                  <p class="routes-title">Puntos Asignados ({{ routes.length }})</p>

                  <div v-if="routes.length === 0" class="no-routes">
                    <small>No hay puntos seleccionados</small>
                  </div>

                  <transition-group name="list">
                    <div v-for="(route, index) in routes" :key="route.id" class="route-item">
                      <div class="route-content">
                        <span class="route-icon" :class="{ 'spinning': route.loading }">
                          {{ route.loading ? '🔄' : (route.isPoi ? '🏢' : '📍') }}
                        </span>
                        <div class="route-texts">
                          <span class="route-main-text">{{ route.text }}</span>
                          <small v-if="route.coords" class="route-sub-text">
                            Lat: {{ route.coords[1].toFixed(5) }}, Lng: {{ route.coords[0].toFixed(5) }}
                          </small>
                        </div>
                      </div>
                      <button class="btn-remove" @click="removeRoute(index)">✕</button>
                    </div>
                  </transition-group>
                </div>
              </div>

              <footer class="modal-footer">
                <button class="btn-save-final" @click="saveRoutes">
                  Guardar y Salir
                </button>
              </footer>

            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL DE CARGA (SAVING) -->
      <transition name="fade">
        <div v-if="isSaving" class="saving-overlay">
          <div class="saving-card">
            <div v-if="!saveSuccess" class="spinner-large"></div>
            <div v-else class="success-icon">✅</div>
            <h3 class="saving-title">
              {{ saveSuccess ? '¡Ruta Asignada!' : 'Asignando ruta...' }}
            </h3>
            <p class="saving-subtitle">
              {{ saveSuccess ? 'Los cambios se han guardado correctamente.' : 'Enviando información al servidor...' }}
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
      showModal: false,
      isSaving: false,
      saveSuccess: false,
      isSearching: false, // Nuevo estado para bloqueo mientras busca
      errorMessage: "",
      selectedDriver: null,

      searchQuery: "",
      suggestions: [],
      highlightIndex: -1,
      searchTimeout: null,

      routes: [],

      // TOKEN
      mapboxAccessToken: "pk.eyJ1IjoianZlbGV6MDAwIiwiYSI6ImNtaWkzOHZ5dTAxbnkzZHE3Mmo2c2VnbjQifQ.R-ikqyiMMZVwUHOH9CJ6mg",

      // CONFIGURACIÓN DE LÍMITES (Valle de Aburrá)
      boundsSW: [-75.70, 6.02],
      boundsNE: [-75.30, 6.55],

      startLat: 6.2476,
      startLng: -75.5658,

      mapInstance: null,

      drivers: [
        { id: 1, name: "Luis Salazar" },
        { id: 2, name: "Carolina Pérez" },
        { id: 3, name: "Andrés Delgado" },
      ],
    };
  },
  methods: {
    openModal(driver) {
      this.selectedDriver = driver;
      this.routes = [];
      this.errorMessage = "";
      this.searchQuery = "";
      this.suggestions = [];
      this.showModal = true;
      this.isSaving = false;
      this.saveSuccess = false;
      this.isSearching = false;

      nextTick(() => {
        this.initMap();
        this.$refs.modalCard?.focus();
      });
    },

    closeModal() {
      if (this.isSaving) return;
      this.showModal = false;
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }
      setTimeout(() => {
        this.selectedDriver = null;
        this.errorMessage = "";
      }, 300);
    },

    saveRoutes() {
      if (this.routes.length === 0) {
        this.showError("⚠️ Debes asignar al menos un punto.");
        return;
      }
      this.isSaving = true;
      this.saveSuccess = false;
      setTimeout(() => {
        this.saveSuccess = true;
        setTimeout(() => {
          this.isSaving = false;
          this.closeModal();
        }, 1500);
      }, 2000);
    },

    initMap() {
      mapboxgl.accessToken = this.mapboxAccessToken;
      const mapContainer = this.$refs.mapContainer;
      if (!mapContainer) return;
      const maxBounds = [this.boundsSW, this.boundsNE];
      const map = new mapboxgl.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [this.startLng, this.startLat],
        zoom: 12,
        maxBounds: maxBounds,
        minZoom: 11
      });
      this.mapInstance = markRaw(map);
      map.on("load", () => {
        map.resize();
        map.getCanvas().style.cursor = 'crosshair';
      });
      map.on("click", (e) => {
        this.validateAndAddMarker(e.lngLat.lng, e.lngLat.lat);
      });
    },

    /* BUSCADOR */
    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.highlightIndex = -1;
      // Reiniciamos errores al escribir
      if (this.errorMessage.includes("no encontrada")) this.errorMessage = "";

      if (this.searchQuery.length < 3) {
        this.suggestions = [];
        return;
      }
      this.searchTimeout = setTimeout(() => {
        this.fetchSuggestions();
      }, 350);
    },

    // Función auxiliar para limpiar la query (se usa en sugerencias y validación)
    getCleanedQuery(query) {
      let cleaned = query.toLowerCase()
        .replace(/\b(cll|clle|c)\b/g, 'calle')
        .replace(/\b(cra|crr|kra|k)\b/g, 'carrera')
        .replace(/\b(tv|tvr)\b/g, 'transversal')
        .replace(/\b(dg)\b/g, 'diagonal')
        .replace(/\b(av)\b/g, 'avenida')
        .replace(/\b(circ)\b/g, 'circular')
        .replace(/\b(cc|c\.c\.)\b/g, 'centro comercial')
        .replace(/\b(ur|u\.r\.)\b/g, 'unidad residencial')
        .replace(/\b(urb)\b/g, 'urbanización')
        .replace(/\b(conj)\b/g, 'conjunto residencial')
        .replace(/\b(ed|edif)\b/g, 'edificio');

      const regexColombia = /(calle|carrera|transversal|diagonal|circular|avenida)\s+([0-9]+[a-z]?)\s+([0-9]+[a-z]?)\s+([0-9]+)/i;
      if (!cleaned.includes('#') && regexColombia.test(cleaned)) {
        cleaned = cleaned.replace(regexColombia, '$1 $2 # $3 - $4');
      }
      return cleaned;
    },

    async fetchSuggestions() {
      const cleanedQuery = this.getCleanedQuery(this.searchQuery);
      const bboxString = `${this.boundsSW[0]},${this.boundsSW[1]},${this.boundsNE[0]},${this.boundsNE[1]}`;
      const center = this.mapInstance ? this.mapInstance.getCenter() : { lng: -75.56, lat: 6.25 };

      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanedQuery)}.json?access_token=${this.mapboxAccessToken}&bbox=${bboxString}&proximity=${center.lng},${center.lat}&country=co&limit=5&types=address,poi`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.features) this.suggestions = data.features;
      } catch (error) { console.error(error); }
    },

    selectSuggestion(feature) {
      const [lng, lat] = feature.center;
      const niceName = feature.place_name.split(',')[0];
      const isPoi = feature.place_type.includes('poi');
      this.validateAndAddMarker(lng, lat, niceName, isPoi);
      if (this.mapInstance) this.mapInstance.flyTo({ center: [lng, lat], zoom: 16 });
      this.suggestions = [];
      this.searchQuery = "";
    },

    /* MANEJO DEL ENTER / BOTÓN AGREGAR */
    async handleEnterKey() {
      // 1. Si hay sugerencia resaltada con flechas, úsala
      if (this.highlightIndex >= 0 && this.suggestions[this.highlightIndex]) {
        this.selectSuggestion(this.suggestions[this.highlightIndex]);
        return;
      }

      // 2. Si no hay texto, no hacer nada
      if (!this.searchQuery.trim()) return;

      // 3. VALIDACIÓN ESTRICTA: Consultar API para ver si lo escrito existe
      this.isSearching = true; // Activa spinner
      this.suggestions = [];   // Oculta lista

      const cleanedQuery = this.getCleanedQuery(this.searchQuery);
      const bboxString = `${this.boundsSW[0]},${this.boundsSW[1]},${this.boundsNE[0]},${this.boundsNE[1]}`;
      const center = this.mapInstance ? this.mapInstance.getCenter() : { lng: -75.56, lat: 6.25 };

      try {
        // Hacemos fetch exacto
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanedQuery)}.json?access_token=${this.mapboxAccessToken}&bbox=${bboxString}&proximity=${center.lng},${center.lat}&country=co&limit=1&types=address,poi`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          // ÉXITO: Encontramos la dirección
          const feature = data.features[0];
          this.selectSuggestion(feature);
        } else {
          // ERROR: No existe
          this.showError("🚫 Dirección no encontrada en el Área Metropolitana");
        }
      } catch (e) {
        this.showError("⚠️ Error de conexión");
      } finally {
        this.isSearching = false; // Apaga spinner
      }
    },

    navigateSuggestions(step) {
      if (this.suggestions.length === 0) return;
      this.highlightIndex += step;
      if (this.highlightIndex >= this.suggestions.length) this.highlightIndex = 0;
      if (this.highlightIndex < 0) this.highlightIndex = this.suggestions.length - 1;
    },

    /* AGREGAR MARCADOR */
    async validateAndAddMarker(lng, lat, preloadedText = null, isPoi = false) {
      this.errorMessage = "";
      const [minLng, minLat] = this.boundsSW;
      const [maxLng, maxLat] = this.boundsNE;

      if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) {
        this.showError("⚠️ Punto fuera del Área Metropolitana.");
        return;
      }

      if (!this.mapInstance) return;

      const marker = new mapboxgl.Marker({ color: "#d4af37", scale: 1.2 })
        .setLngLat([lng, lat])
        .addTo(this.mapInstance);

      const tempId = Date.now() + Math.random();
      const initialText = preloadedText || `Consultando lugar...`;

      const newRouteItem = {
        id: tempId,
        text: initialText,
        coords: [lng, lat],
        marker: markRaw(marker),
        loading: !preloadedText,
        isPoi: isPoi
      };

      this.routes.push(newRouteItem);

      if (!preloadedText) {
        try {
          const bboxString = `${minLng},${minLat},${maxLng},${maxLat}`;
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxAccessToken}&language=es&limit=1&types=address,poi&bbox=${bboxString}`;
          const response = await fetch(url);
          const data = await response.json();
          let finalText = "Ubicación seleccionada";
          let foundPoi = false;
          if (data.features && data.features.length > 0) {
            finalText = data.features[0].place_name.split(',')[0];
            foundPoi = data.features[0].place_type.includes('poi');
          }
          const idx = this.routes.findIndex(r => r.id === tempId);
          if (idx !== -1) {
            this.routes.splice(idx, 1, { ...this.routes[idx], text: finalText, loading: false, isPoi: foundPoi });
          }
        } catch (error) {
          const idx = this.routes.findIndex(r => r.id === tempId);
          if (idx !== -1) this.routes.splice(idx, 1, { ...this.routes[idx], text: "Ubicación válida", loading: false });
        }
      }
    },

    removeRoute(index) {
      const route = this.routes[index];
      if (route.marker) route.marker.remove();
      this.routes.splice(index, 1);
    },

    showError(msg) {
      this.errorMessage = msg;
      setTimeout(() => { this.errorMessage = ""; }, 3000);
    },

    // Format helpers
    formatSuggestion(fullName) { return fullName.split(',')[0]; },
    getCityFromSuggestion(fullName) {
      const parts = fullName.split(',');
      return parts.length > 1 ? parts.slice(1, 3).join(',').trim() : '';
    }
  },
};
</script>

<style scoped>
/* ESTILOS BASE */
.assign-page {
  padding: 24px;
  min-height: 100vh;
  color: #f5e9c6;
  font-family: Inter, system-ui, sans-serif;
}

.page-title {
  font-size: 2rem;
  margin: 0 0 6px 0;
  color: #f5e7c0;
}

.subtitle {
  color: #c8b68a;
  margin-bottom: 18px;
}

/* DRIVERS */
.drivers-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.driver-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.12);
  padding: 16px;
  border-radius: 12px;
  transition: transform .18s ease;
}

.driver-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

.driver-header h3 {
  margin: 0;
  color: #f7e7b5;
  font-size: 1.05rem;
}

.driver-id {
  margin: 6px 0 0 0;
  font-size: .86rem;
  color: #b9a56d;
}

.driver-buttons {
  margin-top: 12px;
}

.btn-assign {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: linear-gradient(180deg, #d4af37, #b78f2b);
  border: none;
  color: #080808;
  font-weight: 700;
  cursor: pointer;
}

.btn-assign:hover {
  filter: brightness(1.05);
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
  max-width: 850px;
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
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
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

.driver-info {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.driver-photo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #222;
  border: 2px solid #d4af37;
}

.driver-label {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.7;
}

.driver-name {
  margin: 2px 0 0 0;
  font-size: 1.1rem;
}

/* MAPA */
.map-section {
  position: relative;
  margin-bottom: 15px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 350px;
  background-color: #000;
}

.map-instructions {
  text-align: center;
  color: #d4af37;
  margin-top: 5px;
}

.error-badge {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #8b2b2b;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    top: -40px;
  }

  to {
    top: 10px;
  }
}

/* BUSCADOR */
.route-input-section {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: flex-start;
}

.search-container {
  flex: 1;
  position: relative;
}

.input-field {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: #1e1915;
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #efe8c7;
  font-size: 0.95rem;
}

.input-field:focus {
  outline: 1px solid #d4af37;
  background: #251e18;
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Spinner pequeño en input */
.input-spinner {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 16px;
  height: 16px;
  border: 2px solid #d4af37;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1e1915;
  border: 1px solid #d4af37;
  border-top: none;
  border-radius: 0 0 8px 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  z-index: 5000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  max-height: 250px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background: rgba(212, 175, 55, 0.15);
}

.suggestion-icon {
  font-size: 1.2rem;
}

.suggestion-text {
  display: flex;
  flex-direction: column;
}

.suggestion-main {
  font-weight: 600;
  color: #efe7bf;
  font-size: 0.9rem;
}

.suggestion-sub {
  font-size: 0.75rem;
  color: #999;
}

.btn-assign-small {
  padding: 12px 16px;
  border-radius: 8px;
  background: #d4af37;
  color: #111;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-assign-small:disabled {
  background: #554415;
  color: #888;
  cursor: not-allowed;
}

/* LISTA */
.routes-list {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.routes-title {
  margin: 0 0 8px 0;
  font-weight: 700;
  color: #d4af37;
  font-size: 0.9rem;
}

.route-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 6px;
  border-radius: 6px;
  gap: 10px;
}

.route-content {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.route-icon {
  font-size: 1.2rem;
  min-width: 24px;
}

.spinning {
  animation: spin 1s linear infinite;
  display: inline-block;
  opacity: 0.7;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.route-texts {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.route-main-text {
  font-size: 0.95rem;
  color: #efe7bf;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.route-sub-text {
  font-size: 0.75rem;
  color: #888;
  margin-top: 2px;
}

.btn-remove {
  background: transparent;
  color: #ff9999;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 8px;
}

.btn-remove:hover {
  color: #ff4d4d;
  transform: scale(1.1);
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(212, 175, 55, 0.15);
  padding-top: 15px;
}

/* BOTÓN NUEVO MEJORADO */
.btn-save-final {
  background: #d4af37;
  color: #080808;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
}

.btn-save-final:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
  background: #e6c24e;
}

/* MODAL DE CARGA */
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

.saving-title {
  margin: 20px 0 10px 0;
  font-size: 1.5rem;
  color: #d4af37;
}

.saving-subtitle {
  margin: 0;
  color: #888;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(212, 175, 55, 0.3);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.success-icon {
  font-size: 4rem;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>