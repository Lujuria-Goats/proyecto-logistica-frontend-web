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
        <!-- LOADING -->
        <div v-if="isLoadingDrivers" class="state-msg">
          <div class="spinner"></div> Cargando conductores...
        </div>

        <!-- EMPTY -->
        <div v-else-if="drivers.length === 0" class="state-msg">
          No tienes conductores vinculados.<br>
          Ve a "Gestión de Conductores" para contratar.
        </div>

        <!-- GRID -->
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
            <!-- BOTÓN ACCIÓN -->
            <button class="btn-action" @click="openModal(driver)">
              🗺️ Asignar Ruta
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- MODAL (MAPA Y RUTAS)                              -->
    <!-- ================================================= -->
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
                  <div class="driver-photo-modal"></div>
                  <div class="driver-data">
                    <p class="driver-label">Transportador:</p>
                    <h3 class="driver-name-text">{{ selectedDriver?.name }}</h3>
                  </div>
                </div>

                <!-- MAPA -->
                <div class="map-section">
                  <div ref="mapContainer" class="map-container"></div>
                  <div v-if="errorMessage" class="error-badge">{{ errorMessage }}</div>
                  <div class="map-instructions">
                    <small>📍 Clic en el mapa para fijar punto exacto</small>
                  </div>
                </div>

                <!-- BUSCADOR -->
                <div class="route-input-section">
                  <div class="search-container">
                    <input type="text" v-model="searchQuery" placeholder="Buscar: Dirección, C.C., Unidad, Empresa..."
                      class="input-field" :disabled="isSearching" @input="onSearchInput"
                      @keydown.down.prevent="navigateSuggestions(1)" @keydown.up.prevent="navigateSuggestions(-1)"
                      @keydown.enter.prevent="handleEnterKey" />

                    <div v-if="isSearching" class="input-loader-wrapper">
                      <span class="loader"></span>
                    </div>

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
                        <div class="icon-wrapper">
                          <div v-if="route.loading" class="list-loader-wrapper">
                            <span class="loader"></span>
                          </div>
                          <span v-else class="route-emoji">
                            {{ route.isPoi ? '🏢' : '📍' }}
                          </span>
                        </div>
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

      <!-- MODAL DE CARGA -->
      <transition name="fade">
        <div v-if="isSaving" class="saving-overlay">
          <div class="saving-card">
            <div v-if="!saveSuccess" class="loader-container-center">
              <span class="loader"></span>
            </div>
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
      baseUrl: 'https://service.lujuria.crudzaso.com',
      isLoadingDrivers: false,
      drivers: [],
      showModal: false,
      isSaving: false,
      saveSuccess: false,
      isSearching: false,
      errorMessage: "",
      selectedDriver: null,
      searchQuery: "",
      suggestions: [],
      highlightIndex: -1,
      searchTimeout: null,
      routes: [],
      mapboxAccessToken: "pk.eyJ1IjoianZlbGV6MDAwIiwiYSI6ImNtaWkzOHZ5dTAxbnkzZHE3Mmo2c2VnbjQifQ.R-ikqyiMMZVwUHOH9CJ6mg",
      boundsSW: [-75.70, 6.02],
      boundsNE: [-75.30, 6.55],
      startLat: 6.2476,
      startLng: -75.5658,
      mapInstance: null,
    };
  },
  mounted() {
    this.fetchMyDrivers();
  },
  methods: {
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
          let driversArray = [];
          if (Array.isArray(rawData)) driversArray = rawData;
          else if (rawData.drivers) driversArray = rawData.drivers;
          else if (rawData.data) driversArray = rawData.data;

          this.drivers = this.normalizeDrivers(driversArray);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        this.isLoadingDrivers = false;
      }
    },
    normalizeDrivers(data) {
      if (!Array.isArray(data)) return [];
      return data.map(d => ({
        id: d.id || d.Id || 0,
        name: d.fullName || d.name || d.userName || "Sin nombre",
        phone: d.phoneNumber || d.phone || "Sin teléfono",
        description: d.description || d.email || "Conductor activo"
      }));
    },
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
      nextTick(() => { this.initMap(); this.$refs.modalCard?.focus(); });
    },
    closeModal() {
      if (this.isSaving) return;
      this.showModal = false;
      if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
      setTimeout(() => { this.selectedDriver = null; this.errorMessage = ""; }, 300);
    },
    saveRoutes() {
      if (this.routes.length === 0) { this.showError("⚠️ Debes asignar al menos un punto."); return; }
      this.isSaving = true;
      this.saveSuccess = false;
      setTimeout(() => {
        this.saveSuccess = true;
        setTimeout(() => { this.isSaving = false; this.closeModal(); }, 1500);
      }, 2000);
    },
    initMap() {
      mapboxgl.accessToken = this.mapboxAccessToken;
      const mapContainer = this.$refs.mapContainer;
      if (!mapContainer) return;
      const map = new mapboxgl.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [this.startLng, this.startLat],
        zoom: 12,
        maxBounds: [this.boundsSW, this.boundsNE],
        minZoom: 11
      });
      this.mapInstance = markRaw(map);
      map.on("load", () => { map.resize(); map.getCanvas().style.cursor = 'crosshair'; });
      map.on("click", (e) => { this.validateAndAddMarker(e.lngLat.lng, e.lngLat.lat); });
    },
    onSearchInput() {
      clearTimeout(this.searchTimeout);
      this.highlightIndex = -1;
      if (this.errorMessage.includes("no encontrada")) this.errorMessage = "";
      if (this.searchQuery.length < 3) { this.suggestions = []; return; }
      this.searchTimeout = setTimeout(() => { this.fetchSuggestions(); }, 350);
    },
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
      if (!cleaned.includes('#') && regexColombia.test(cleaned)) { cleaned = cleaned.replace(regexColombia, '$1 $2 # $3 - $4'); }
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
    async handleEnterKey() {
      if (this.highlightIndex >= 0 && this.suggestions[this.highlightIndex]) { this.selectSuggestion(this.suggestions[this.highlightIndex]); return; }
      if (!this.searchQuery.trim()) return;
      this.isSearching = true;
      this.suggestions = [];
      const cleanedQuery = this.getCleanedQuery(this.searchQuery);
      const bboxString = `${this.boundsSW[0]},${this.boundsSW[1]},${this.boundsNE[0]},${this.boundsNE[1]}`;
      const center = this.mapInstance ? this.mapInstance.getCenter() : { lng: -75.56, lat: 6.25 };
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanedQuery)}.json?access_token=${this.mapboxAccessToken}&bbox=${bboxString}&proximity=${center.lng},${center.lat}&country=co&limit=1&types=address,poi`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length > 0) { const feature = data.features[0]; this.selectSuggestion(feature); }
        else { this.showError("🚫 Dirección no encontrada en el Área Metropolitana"); }
      } catch (e) { this.showError("⚠️ Error de conexión"); } finally { this.isSearching = false; }
    },
    navigateSuggestions(step) {
      if (this.suggestions.length === 0) return;
      this.highlightIndex += step;
      if (this.highlightIndex >= this.suggestions.length) this.highlightIndex = 0;
      if (this.highlightIndex < 0) this.highlightIndex = this.suggestions.length - 1;
    },
    async validateAndAddMarker(lng, lat, preloadedText = null, isPoi = false) {
      this.errorMessage = "";
      const [minLng, minLat] = this.boundsSW;
      const [maxLng, maxLat] = this.boundsNE;
      if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) { this.showError("⚠️ Punto fuera del Área Metropolitana."); return; }
      if (!this.mapInstance) return;
      const marker = new mapboxgl.Marker({ color: "#d4af37", scale: 1.2 }).setLngLat([lng, lat]).addTo(this.mapInstance);
      const tempId = Date.now() + Math.random();
      const initialText = preloadedText || `Consultando lugar...`;
      const newRouteItem = { id: tempId, text: initialText, coords: [lng, lat], marker: markRaw(marker), loading: !preloadedText, isPoi: isPoi };
      this.routes.push(newRouteItem);
      if (!preloadedText) {
        try {
          const bboxString = `${minLng},${minLat},${maxLng},${maxLat}`;
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${this.mapboxAccessToken}&language=es&limit=1&types=address,poi&bbox=${bboxString}`;
          const response = await fetch(url);
          const data = await response.json();
          let finalText = "Ubicación seleccionada";
          let foundPoi = false;
          if (data.features && data.features.length > 0) { finalText = data.features[0].place_name.split(',')[0]; foundPoi = data.features[0].place_type.includes('poi'); }
          const idx = this.routes.findIndex(r => r.id === tempId);
          if (idx !== -1) { this.routes.splice(idx, 1, { ...this.routes[idx], text: finalText, loading: false, isPoi: foundPoi }); }
        } catch (error) {
          const idx = this.routes.findIndex(r => r.id === tempId);
          if (idx !== -1) this.routes.splice(idx, 1, { ...this.routes[idx], text: "Ubicación válida", loading: false });
        }
      }
    },
    removeRoute(index) { const route = this.routes[index]; if (route.marker) route.marker.remove(); this.routes.splice(index, 1); },
    showError(msg) { this.errorMessage = msg; setTimeout(() => { this.errorMessage = ""; }, 3000); },
    formatSuggestion(fullName) { return fullName.split(',')[0]; },
    getCityFromSuggestion(fullName) { const parts = fullName.split(','); return parts.length > 1 ? parts.slice(1, 3).join(',').trim() : ''; }
  },
};
</script>

<style scoped>
/* ================================================= */
/* ESTILOS DE LA PÁGINA PRINCIPAL */
/* ================================================= */
.assign-page {
  /* Fija y Centra */
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  /* AQUÍ ESTÁ EL TRUCO: Padding bottom grande empuja todo hacia arriba */
  padding-bottom: 12vh; 
  
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

/* PANEL PRINCIPAL (GRANDE Y ALTO) */
.main-panel {
  width: 100%;
  max-width: 1150px; /* Ancho grande */
  
  height: auto;
  max-height: 85vh;  /* Ocupa casi toda la altura disponible */
  min-height: 600px; /* Mínimo considerable */
  
  display: flex;
  flex-direction: column;
  
  background: rgba(15, 12, 8, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px rgba(0,0,0,0.8);
  overflow: hidden;
  padding: 20px 30px 30px 30px;
}

.list-header-row {
  flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.panel-subtitle { margin: 0; color: #d4af37; font-size: 1.2rem; }
.badge { background: rgba(212,175,55,0.15); color: #d4af37; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; }

/* SCROLL AREA DE LA LISTA */
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
.driver-photo { width: 44px; height: 44px; border-radius: 50%; background: #1a1a1a; border: 2px solid #d4af37; flex-shrink: 0; }
.driver-details { flex: 1; overflow: hidden; }
.driver-name { margin: 0 0 4px 0; font-size: 1rem; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
.detail-row { font-size: 0.85rem; color: #ccc; margin-bottom: 2px; }
.desc { color: #888; font-style: italic; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Botón de Asignar (Dorado) */
.btn-action {
  align-self: stretch; text-align: center;
  background: #d4af37; border: none; 
  color: #111; font-weight: bold;
  padding: 8px 12px; border-radius: 6px; 
  font-size: 0.85rem; cursor: pointer; transition: 0.2s;
}
.btn-action:hover { background: #eac54e; }

.state-msg { 
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: #666; 
}
.spinner { width: 30px; height: 30px; border: 3px solid #d4af37; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }


/* ================================================= */
/* ESTILOS DEL MODAL (RESTORED FROM OLD VERSION)     */
/* ================================================= */
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

.driver-photo-modal {
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

.driver-name-text {
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
  from { top: -40px; }
  to { top: 10px; }
}

/* BUSCADOR DENTRO DEL MODAL */
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

/* Loader Mini */
.input-loader-wrapper {
  position: absolute;
  right: 12px;
  top: 8px;
  transform: scale(0.4);
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

.suggestion-item:last-child { border-bottom: none; }

.suggestion-item:hover,
.suggestion-item.highlighted {
  background: rgba(212, 175, 55, 0.15);
}

.suggestion-icon { font-size: 1.2rem; }

.suggestion-text { display: flex; flex-direction: column; }

.suggestion-main { font-weight: 600; color: #efe7bf; font-size: 0.9rem; }

.suggestion-sub { font-size: 0.75rem; color: #999; }

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

.btn-assign-small:disabled { background: #554415; color: #888; cursor: not-allowed; }

/* LISTA DE PUNTOS */
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

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.list-loader-wrapper {
  transform: scale(0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.route-emoji { font-size: 1.2rem; }

.route-texts { display: flex; flex-direction: column; overflow: hidden; }

.route-main-text {
  font-size: 0.95rem;
  color: #efe7bf;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.route-sub-text { font-size: 0.75rem; color: #888; margin-top: 2px; }

.btn-remove {
  background: transparent;
  color: #ff9999;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 8px;
}

.btn-remove:hover { color: #ff4d4d; transform: scale(1.1); }

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(212, 175, 55, 0.15);
  padding-top: 15px;
}

/* BOTÓN FINAL */
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

/* OVERLAY DE GUARDADO */
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

.saving-card { text-align: center; color: #efe7bf; }

.saving-title { margin: 20px 0 10px 0; font-size: 1.5rem; color: #d4af37; }
.saving-subtitle { margin: 0; color: #888; }
.loader-container-center { display: flex; justify-content: center; margin-bottom: 20px; }
.success-icon { font-size: 4rem; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* LOADER CSS */
.loader {
  transform: rotateZ(45deg); perspective: 1000px; border-radius: 50%; width: 48px; height: 48px; color: #fff; display: inline-block;
}
.loader:before,
.loader:after {
  content: ''; display: block; position: absolute; top: 0; left: 0; width: inherit; height: inherit; border-radius: 50%; transform: rotateX(70deg); animation: 1s spin linear infinite;
}
.loader:after { color: #f3ca45; transform: rotateY(70deg); animation-delay: .4s; }

@keyframes rotate { 0% { transform: translate(-50%, -50%) rotateZ(0deg); } 100% { transform: translate(-50%, -50%) rotateZ(360deg); } }
@keyframes spin {
  0%, 100% { box-shadow: .2em 0px 0 0px currentcolor; }
  12% { box-shadow: .2em .2em 0 0 currentcolor; }
  25% { box-shadow: 0 .2em 0 0px currentcolor; }
  37% { box-shadow: -.2em .2em 0 0 currentcolor; }
  50% { box-shadow: -.2em 0 0 0 currentcolor; }
  62% { box-shadow: -.2em -.2em 0 0 currentcolor; }
  75% { box-shadow: 0px -.2em 0 0 currentcolor; }
  87% { box-shadow: .2em -.2em 0 0 currentcolor; }
}

/* TRANSICIONES */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-10px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Scrollbars */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #d4af37; }
</style>