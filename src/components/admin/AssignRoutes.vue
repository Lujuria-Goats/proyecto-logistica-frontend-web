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
                  <button class="btn-icon-action edit" @click="openEditModal(route)" title="Editar Orden">
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
      <transition name="modal-fade">
        <div v-if="showInfoModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card large-card glass-effect">
              <header class="modal-header">
                <h2 class="modal-title">Detalle de Ruta</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              <div class="modal-body">
                <div class="map-wrapper">
                  <div ref="mapContainerInfo" class="map-container"></div>
                  <div class="map-overlay-info">
                    <small>{{ selectedRouteDetails.length }} Puntos encontrados</small>
                  </div>
                </div>
                <div class="points-list">
                  <h3 class="section-title">Puntos de Entrega (Ordenados)</h3>
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
    <!-- MODAL 2: EDICIÓN DE RUTA (REORDENAR)              -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card large-card glass-effect">
              <header class="modal-header">
                <h2 class="modal-title">Editar Ruta</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              <div class="modal-body">
                <div class="map-wrapper small-map">
                  <div ref="mapContainerEdit" class="map-container"></div>
                </div>

                <div class="drag-instruction">
                  <span>💡 Mueve <strong>(☰)</strong> para reordenar o <strong>(✏️)</strong> para editar.</span>
                </div>

                <div class="points-list editable-list">
                  <transition-group name="list-anim">
                    <div v-for="(point, index) in selectedRouteDetails" :key="point.id"
                      class="point-item draggable-item" :class="{
                        'dragging': draggedIndex === index,
                        'drag-target': dragOverIndex === index && draggedIndex !== index
                      }" draggable="true" @dragstart="handleDragStart(index, $event)" @dragover.prevent
                      @dragenter.prevent="handleDragEnter(index)" @drop="handleDrop(index)" @dragend="handleDragEnd">
                      <div class="drag-handle" title="Arrastrar">☰</div>
                      <div class="point-index highlight">{{ index + 1 }}</div>
                      <div class="point-data">
                        <p class="p-addr">{{ point.address }}</p>
                        <small class="p-desc-mini">{{ point.description }}</small>
                      </div>
                      <button class="btn-edit-item" @click="openOrderEditor(point)" title="Editar Dirección">
                        ✏️
                      </button>
                    </div>
                  </transition-group>
                </div>
              </div>
              <footer class="modal-footer actions-footer">
                <button class="btn-cancel-modal" @click="closeModals">Cancelar</button>
                <button class="btn-save" @click="saveRouteOrder" :disabled="isProcessing">
                  {{ isProcessing ? 'Guardando...' : '💾 Guardar Ruta' }}
                </button>
              </footer>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ================================================= -->
    <!-- MODAL 2.1: EDITAR UN PEDIDO ESPECÍFICO            -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showOrderEditModal" class="modal-overlay sub-overlay">
          <div class="modal-container">
            <div class="modal-card glass-effect">
              <header class="modal-header">
                <h2 class="modal-title">Editar Pedido #{{ currentOrderEdit?.id }}</h2>
                <button class="modal-close-x" @click="closeOrderEditor">✕</button>
              </header>
              <div class="modal-body form-body">
                <div class="form-group relative">
                  <label>Dirección</label>
                  <input type="text" v-model="formOrder.address" class="input-dark" placeholder="Buscar dirección..."
                    @input="onAddressInput">
                  <ul v-if="addressSuggestions.length > 0" class="suggestions-list">
                    <li v-for="item in addressSuggestions" :key="item.id" class="suggestion-item"
                      @click="selectAddressSuggestion(item)">
                      <span class="sug-icon">📍</span>
                      <div class="sug-text">
                        <span class="sug-main">{{ item.place_name.split(',')[0] }}</span>
                        <span class="sug-sub">{{ item.place_name }}</span>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="form-group">
                  <label>Descripción / Notas</label>
                  <textarea v-model="formOrder.description" class="input-dark textarea" rows="2"></textarea>
                </div>
                <div class="form-group">
                  <label>Ubicación (Click para ajustar)</label>
                  <div class="mini-map-wrapper">
                    <div ref="mapContainerSingle" class="map-container"></div>
                  </div>
                  <small class="coords-info">Lat: {{ formOrder.latitude }} | Lng: {{ formOrder.longitude }}</small>
                </div>
              </div>
              <footer class="modal-footer actions-footer">
                <button class="btn-cancel-modal" @click="closeOrderEditor">Cancelar</button>
                <button class="btn-save" @click="saveOrderChanges" :disabled="isSavingOrder">
                  {{ isSavingOrder ? 'Guardando...' : 'Actualizar' }}
                </button>
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
      <transition name="modal-fade">
        <div v-if="showAssignModal" class="modal-overlay" @click.self="closeModals">
          <div class="modal-container">
            <div class="modal-card glass-effect">
              <header class="modal-header">
                <h2 class="modal-title">Seleccionar Conductor</h2>
                <button class="modal-close-x" @click="closeModals">✕</button>
              </header>
              <div class="modal-body driver-selection-body">
                <p class="instruction-text">
                  Asignar ruta <strong>{{ selectedRoute?.name }}</strong>
                  ({{ selectedRoute?.orderIds.length }} paradas)
                </p>
                <div v-if="isLoadingDrivers" class="spinner-container">
                  <div class="spinner"></div>
                </div>
                <div v-else-if="drivers.length === 0" class="empty-state-mini">No hay conductores disponibles.</div>
                <div v-else class="drivers-grid-select">
                  <div v-for="driver in drivers" :key="driver.id" class="driver-select-card"
                    @click="assignRouteToDriver(driver)">
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
    <!-- MODAL 4: MENSAJES (EXITO / ERROR)                 -->
    <!-- ================================================= -->
    <teleport to="body">
      <transition name="pop-in">
        <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
          <div class="modal-container">
            <div class="modal-card small-modal text-center glass-effect"
              :class="{ 'error-theme': messageType === 'error' }">
              <div class="modal-body success-body">
                <div class="status-icon">
                  {{ messageType === 'success' ? '✨' : '⚠️' }}
                </div>
                <h2 class="modal-title success-title">{{ messageTitle }}</h2>
                <p class="success-text">{{ messageBody }}</p>
                <button class="btn-confirm-modal full-width" @click="closeMessageModal" :class="messageType">
                  {{ messageType === 'success' ? 'Entendido' : 'Cerrar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- OVERLAY CARGA -->
    <transition name="fade">
      <div v-if="isProcessing" class="global-loader">
        <div class="spinner large"></div>
        <p>Procesando...</p>
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
      showOrderEditModal: false,

      // Edición Pedido
      currentOrderEdit: null,
      formOrder: { id: 0, address: '', description: '', latitude: 0, longitude: 0 },
      isSavingOrder: false,
      singleMapInstance: null,
      singleMarker: null,
      addressSuggestions: [],
      searchTimeout: null,

      // DragDrop
      draggedIndex: null,
      dragOverIndex: null,

      // Mensajes
      showMessageModal: false,
      messageTitle: '',
      messageBody: '',
      messageType: 'success', // 'success' | 'error'

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

    openMessage(title, body, type = 'success') {
      this.messageTitle = title;
      this.messageBody = body;
      this.messageType = type;
      this.showMessageModal = true;
    },
    closeMessageModal() { this.showMessageModal = false; },

    // --- API & DATA ---
    async fetchAllOrders() {
      try {
        const token = this.getCleanToken();
        if (!token) return;
        const res = await fetch(`${this.baseUrl}/api/Orders`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          data.forEach(order => {
            const info = {
              id: order.id || order.Id,
              address: order.address || order.Address,
              description: order.description || order.Description,
              lat: order.latitude || order.Latitude,
              lng: order.longitude || order.Longitude
            };
            this.ordersMap.set(info.id, info);
          });
        }
      } catch (e) { console.error("Error pedidos:", e); }
    },

    async fetchRoutes() {
      this.isLoadingRoutes = true;
      try {
        const token = this.getCleanToken();
        const res = await fetch(`${this.baseUrl}/api/Routes/all`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
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
        const res = await fetch(`${this.baseUrl}/api/Drivers`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.drivers || []);
          this.drivers = list.map(d => ({ id: d.id, name: d.fullName || d.name, phone: d.phoneNumber }));
        }
      } catch (e) { console.error(e); }
      finally { this.isLoadingDrivers = false; }
    },

    // --- MODALES ---
    resolveRouteDetails(route) {
      this.selectedRouteDetails = [];
      if (!route || !route.orderIds) return;
      route.orderIds.forEach(orderId => {
        const details = this.ordersMap.get(orderId);
        if (details) this.selectedRouteDetails.push(details);
      });
    },
    openInfoModal(route) {
      this.selectedRoute = route; this.resolveRouteDetails(route); this.showInfoModal = true;
      nextTick(() => this.initMap(this.$refs.mapContainerInfo));
    },
    openEditModal(route) {
      this.selectedRoute = route; this.resolveRouteDetails(route); this.showEditModal = true;
      nextTick(() => this.initMap(this.$refs.mapContainerEdit));
    },
    openAssignModal(route) {
      this.selectedRoute = route; this.resolveRouteDetails(route); this.showAssignModal = true;
    },
    closeModals() {
      this.showInfoModal = false; this.showEditModal = false; this.showAssignModal = false;
      this.selectedRoute = null; this.selectedRouteDetails = []; this.draggedIndex = null;
      if (this.mapInstance) { this.mapInstance.remove(); this.mapInstance = null; }
    },

    // --- DRAG & DROP ---
    handleDragStart(index, event) {
      this.draggedIndex = index;
      event.dataTransfer.effectAllowed = 'move';
      event.target.classList.add('dragging-active');
    },
    handleDragEnter(index) { if (index !== this.draggedIndex) this.dragOverIndex = index; },
    handleDrop(targetIndex) {
      if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;
      const itemToMove = this.selectedRouteDetails.splice(this.draggedIndex, 1)[0];
      this.selectedRouteDetails.splice(targetIndex, 0, itemToMove);
      if (this.mapInstance) this.renderMarkers(this.mapInstance);
      this.handleDragEnd();
    },
    handleDragEnd() {
      this.draggedIndex = null; this.dragOverIndex = null;
      document.querySelectorAll('.dragging-active').forEach(el => el.classList.remove('dragging-active'));
    },

    // --- EDICIÓN INDIVIDUAL ---
    openOrderEditor(order) {
      this.currentOrderEdit = order; this.addressSuggestions = [];
      this.formOrder = { id: order.id, address: order.address, description: order.description, latitude: order.lat, longitude: order.lng };
      this.showOrderEditModal = true;
      nextTick(() => this.initSingleMap());
    },
    closeOrderEditor() {
      this.showOrderEditModal = false; this.currentOrderEdit = null;
      if (this.singleMapInstance) { this.singleMapInstance.remove(); this.singleMapInstance = null; }
    },
    onAddressInput() {
      clearTimeout(this.searchTimeout);
      if (this.formOrder.address.length < 3) { this.addressSuggestions = []; return; }
      this.searchTimeout = setTimeout(() => this.fetchAddressSuggestions(), 300);
    },
    async fetchAddressSuggestions() {
      const query = encodeURIComponent(this.formOrder.address);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${this.mapboxAccessToken}&country=co&types=address,poi&limit=5`;
      try {
        const res = await fetch(url); const data = await res.json();
        this.addressSuggestions = data.features || [];
      } catch (e) { }
    },
    selectAddressSuggestion(item) {
      this.formOrder.address = item.place_name;
      const [lng, lat] = item.center;
      this.formOrder.longitude = lng; this.formOrder.latitude = lat;
      if (this.singleMapInstance && this.singleMarker) {
        this.singleMarker.setLngLat([lng, lat]);
        this.singleMapInstance.flyTo({ center: [lng, lat], zoom: 15 });
      }
      this.addressSuggestions = [];
    },
    initSingleMap() {
      const container = this.$refs.mapContainerSingle;
      if (!container) return;
      mapboxgl.accessToken = this.mapboxAccessToken;
      const map = new mapboxgl.Map({ container, style: "mapbox://styles/mapbox/dark-v11", center: [this.formOrder.longitude, this.formOrder.latitude], zoom: 14 });
      this.singleMapInstance = markRaw(map);
      this.singleMarker = new mapboxgl.Marker({ color: "#d4af37", draggable: true }).setLngLat([this.formOrder.longitude, this.formOrder.latitude]).addTo(map);
      this.singleMarker.on('dragend', () => {
        const lngLat = this.singleMarker.getLngLat();
        this.formOrder.latitude = parseFloat(lngLat.lat.toFixed(6));
        this.formOrder.longitude = parseFloat(lngLat.lng.toFixed(6));
      });
      map.on('click', (e) => {
        this.singleMarker.setLngLat(e.lngLat);
        this.formOrder.latitude = parseFloat(e.lngLat.lat.toFixed(6));
        this.formOrder.longitude = parseFloat(e.lngLat.lng.toFixed(6));
      });
      map.on('load', () => map.resize());
    },
    async saveOrderChanges() {
      this.isSavingOrder = true;
      const token = this.getCleanToken();
      const orderId = this.formOrder.id;
      const payload = { description: this.formOrder.description, address: this.formOrder.address, latitude: this.formOrder.latitude, longitude: this.formOrder.longitude };
      try {
        const res = await fetch(`${this.baseUrl}/api/Orders/${orderId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error("No se pudo actualizar el pedido.");
        const updatedInfo = { id: orderId, address: payload.address, description: payload.description, lat: payload.latitude, lng: payload.longitude };
        this.ordersMap.set(orderId, updatedInfo);
        const index = this.selectedRouteDetails.findIndex(o => o.id === orderId);
        if (index !== -1) this.selectedRouteDetails[index] = updatedInfo;
        if (this.mapInstance) this.renderMarkers(this.mapInstance);
        this.closeOrderEditor();
        this.openMessage("Pedido Actualizado", "La información se ha guardado correctamente.", "success");
      } catch (e) { this.openMessage("Error", e.message, "error"); } finally { this.isSavingOrder = false; }
    },

    // --- ACCIONES ---
    async saveRouteOrder() {
      if (!this.selectedRoute) return;
      this.isProcessing = true;
      const token = this.getCleanToken();
      const routeId = this.selectedRoute.id;
      const newOrderIds = this.selectedRouteDetails.map(o => o.id);
      const payload = { routeName: this.selectedRoute.name, orderIds: newOrderIds };
      try {
        const res = await fetch(`${this.baseUrl}/api/Routes/saved/${routeId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error("Error al guardar orden.");
        this.openMessage("Orden Actualizado", "Ruta guardada correctamente.", "success");
        this.closeModals(); this.fetchRoutes();
      } catch (e) { this.openMessage("Error", e.message, "error"); } finally { this.isProcessing = false; }
    },

    async assignRouteToDriver(driver) {
      if (!this.selectedRoute) return;

      this.isProcessing = true;
      const token = this.getCleanToken();

      try {
        // --- VALIDACIÓN DE ERROR EN ASIGNACIÓN ---
        const cleanPhone = String(driver.phone).replace(/[^0-9+]/g, '');
        const routeId = this.selectedRoute.id;

        const res = await fetch(`${this.baseUrl}/api/Routes/saved/${routeId}/assign`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverPhoneNumber: cleanPhone })
        });

        if (!res.ok) {
          const txt = await res.text();
          // Capturamos el error y mostramos modal ROJO
          throw new Error(txt || `Error ${res.status}: No se pudo asignar la ruta.`);
        }

        this.closeModals();
        await this.fetchRoutes();
        this.openMessage("Asignación Exitosa", `Ruta asignada a ${driver.name}.`, "success");

      } catch (e) {
        console.error(e);
        // Modal de ERROR con estilo diferente
        this.openMessage("⚠️ Error de Asignación", e.message, "error");
      } finally {
        this.isProcessing = false;
      }
    },

    // --- MAPAS ---
    initMap(container) {
      if (!container || this.selectedRouteDetails.length === 0) return;
      const firstPoint = this.selectedRouteDetails[0];
      mapboxgl.accessToken = this.mapboxAccessToken;
      const map = new mapboxgl.Map({ container, style: "mapbox://styles/mapbox/navigation-night-v1", center: [firstPoint.lng, firstPoint.lat], zoom: 11 });
      this.mapInstance = markRaw(map);
      map.on("load", () => { map.resize(); this.renderMarkers(map); });
    },
    renderMarkers(map) {
      if (this.markers.length > 0) { this.markers.forEach(m => m.remove()); this.markers = []; }
      const bounds = new mapboxgl.LngLatBounds();
      this.selectedRouteDetails.forEach((order, index) => {
        const el = document.createElement('div'); el.className = 'marker-digit'; el.innerText = index + 1;
        const marker = new mapboxgl.Marker(el).setLngLat([order.lng, order.lat]).addTo(map);
        this.markers.push(marker); bounds.extend([order.lng, order.lat]);
      });
      map.fitBounds(bounds, { padding: 50 });
    }
  }
};
</script>

<style scoped>
/* ============= LAYOUT ============= */
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
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.split-layout {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.panel-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 12, 8, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 16px;
  height: 90%;
  padding: 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border-bottom: 2px solid rgba(212, 175, 55, 0.4);
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

.badge.warning {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.badge.success {
  background: rgba(76, 175, 80, 0.15);
  color: #66bb6a;
  border: 1px solid #66bb6a;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
  border-radius: 3px;
}

/* CARDS */
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

.route-card.assigned {
  border-color: #66bb6a;
}

.route-card.assigned:hover {
  background: rgba(76, 175, 80, 0.05);
}

.route-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.route-icon {
  font-size: 1.8rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 50%;
}

.success-icon {
  color: #66bb6a;
}

.route-info {
  flex: 1;
  overflow: hidden;
}

.route-name {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-meta {
  margin: 4px 0 0;
  color: #888;
  font-size: 0.85rem;
}

.route-submeta {
  margin: 2px 0 0;
  color: #666;
  font-size: 0.8rem;
}

.route-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn-icon-action {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: 0.2s;
  color: #ccc;
}

.btn-icon-action:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-icon-action.edit:hover {
  color: #d4af37;
}

.btn-main-assign {
  flex: 1;
  background: linear-gradient(90deg, #d4af37, #b8860b);
  border: none;
  border-radius: 6px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.9rem;
}

.btn-main-assign:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.btn-assigned-status {
  flex: 1;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #66bb6a;
  color: #66bb6a;
  border-radius: 6px;
  font-weight: bold;
  cursor: default;
  font-size: 0.85rem;
  padding: 8px;
}

/* MODALES GLASSMORPHISM */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

.sub-overlay {
  z-index: 2100;
  background: rgba(0, 0, 0, 0.8);
}

.modal-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(145deg, #1a1612 0%, #080808 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.large-card {
  max-width: 800px;
}

.small-modal {
  max-width: 380px;
}

.modal-header {
  padding: 15px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
}

.modal-title {
  margin: 0;
  color: #d4af37;
  font-size: 1.3rem;
  letter-spacing: 0.5px;
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
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* MAPA */
.map-wrapper {
  width: 100%;
  height: 300px;
  position: relative;
}

.map-overlay-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #d4af37;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.small-map {
  height: 200px;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* FORM & SUGGESTIONS */
.form-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #d4af37;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.relative {
  position: relative;
}

.input-dark {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: 0.3s;
}

.input-dark:focus {
  border-color: #d4af37;
  outline: none;
  background: rgba(0, 0, 0, 0.3);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.mini-map-wrapper {
  width: 100%;
  height: 200px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 5px;
}

.coords-info {
  color: #666;
  font-size: 0.8rem;
  margin-top: 5px;
  display: block;
  font-family: monospace;
  text-align: right;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid #d4af37;
  border-top: none;
  border-radius: 0 0 8px 8px;
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.9);
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  align-items: center;
  transition: 0.2s;
}

.suggestion-item:hover {
  background: rgba(212, 175, 55, 0.15);
}

.sug-icon {
  font-size: 1.2rem;
}

.sug-main {
  display: block;
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
}

.sug-sub {
  display: block;
  color: #888;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* DRAG LIST */
.drag-instruction {
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  padding: 12px;
  text-align: center;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.points-list {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.point-item {
  display: flex;
  gap: 15px;
  margin-bottom: 12px;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  transition: 0.2s;
}

.draggable-item {
  cursor: grab;
  user-select: none;
}

.draggable-item:active {
  cursor: grabbing;
  background: rgba(212, 175, 55, 0.05);
}

.draggable-item.dragging {
  opacity: 0.5;
  border: 1px dashed #d4af37;
}

.draggable-item.drag-target {
  transform: translateY(4px);
  border-top: 2px solid #d4af37;
}

.drag-handle {
  color: #555;
  font-size: 1.4rem;
  cursor: grab;
  padding-right: 10px;
  transition: 0.2s;
}

.draggable-item:hover .drag-handle {
  color: #d4af37;
}

.point-index {
  background: #222;
  color: #d4af37;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
  border: 1px solid #333;
}

.point-index.highlight {
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: #000;
  border: none;
}

.point-data {
  flex: 1;
}

.p-addr {
  margin: 0 0 4px;
  color: #e0e0e0;
  font-weight: 500;
  font-size: 0.95rem;
}

.p-desc {
  margin: 0;
  color: #888;
  font-size: 0.85rem;
}

.p-desc-mini {
  color: #666;
  font-style: italic;
}

.btn-edit-item {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 6px 10px;
  transition: 0.2s;
  color: #888;
}

.btn-edit-item:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
}

/* DRIVER SELECT */
.driver-selection-body {
  padding: 30px;
}

.instruction-text {
  text-align: center;
  color: #ccc;
  margin-bottom: 25px;
  font-size: 1rem;
}

.drivers-grid-select {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.driver-select-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: 0.3s;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.driver-select-card:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.08);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.driver-avatar {
  width: 60px;
  height: 60px;
  background: #111;
  border: 2px solid #d4af37;
  border-radius: 50%;
  margin-bottom: 12px;
}

.d-name {
  color: #fff;
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 1rem;
}

.d-phone {
  color: #888;
  font-size: 0.85rem;
}

.hover-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #d4af37, #b8860b);
  color: #000;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 6px;
  transform: translateY(100%);
  transition: 0.3s;
}

.driver-select-card:hover .hover-indicator {
  transform: translateY(0);
}

/* FOOTER & BUTTONS */
.modal-footer {
  padding: 20px 25px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: right;
}

.actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel-modal {
  background: transparent;
  border: 1px solid #555;
  color: #ccc;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.btn-cancel-modal:hover {
  border-color: #fff;
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.btn-save {
  background: linear-gradient(90deg, #d4af37, #b8860b);
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  color: #000;
  transition: 0.2s;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.btn-save:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* ERROR MODAL SPECIFIC */
.error-theme {
  border-color: #ff4444;
}

.error-theme .status-icon {
  color: #ff4444;
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.4);
}

.error-theme .success-title {
  color: #ff4444;
}

.error-theme .btn-confirm-modal.error {
  background: linear-gradient(90deg, #ff4444, #cc0000);
  color: #fff;
}

.error-theme .btn-confirm-modal.error:hover {
  box-shadow: 0 6px 20px rgba(255, 68, 68, 0.4);
}

.status-icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
}

.success-title {
  color: #d4af37;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.success-text {
  font-size: 1.1rem;
  margin: 5px 0 25px 0;
  color: #ccc;
  line-height: 1.5;
}

.btn-confirm-modal {
  background: linear-gradient(90deg, #d4af37, #b8860b);
  border: none;
  color: #000;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  transition: 0.3s;
}

.btn-confirm-modal:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

/* ANIMATIONS */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-fade-enter-from .modal-card {
  transform: scale(0.9) translateY(20px);
}

.list-anim-move {
  transition: transform 0.4s ease;
}

/* SPINNER */
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #d4af37;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.global-loader {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #d4af37;
}

.spinner.large {
  width: 50px;
  height: 50px;
  border-width: 4px;
  margin-bottom: 15px;
}

.state-msg {
  text-align: center;
  color: #666;
  padding: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .split-layout {
    flex-direction: column;
    height: auto;
  }

  .panel-section {
    height: 500px;
  }

  .assign-page {
    height: auto;
    overflow: auto;
  }
}
</style>

<style>
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
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}
</style>