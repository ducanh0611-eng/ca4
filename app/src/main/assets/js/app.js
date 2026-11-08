/**
 * Car Navi Launcher - Main Application Logic
 * Fixed: GPS Location Tracking across all sources, Back-to-Home navigation, YouTube Error 153 resolution
 */

// State Management
const state = {
  currentMapSource: 'osm', // 'osm', 'gmaps', 'vietmap', 'waze', 'custom'
  customMapUrl: '',
  speedLimit: 50,
  currentSpeed: 0,
  gpsMode: 'real', // Default to REAL GPS tracking
  currentLat: 10.7963, // Default fallback: HCMC
  currentLng: 106.7214,
  currentBearing: 0,
  hasRealGpsFix: false,
  activeMediaTab: 'youtube', // 'youtube' or 'music'
  isMediaOpen: false,
  isMediaExpanded: false,
  ytMode: 'web', // 'web', 'music', 'embed'
  isPlaying: false,
  currentTrackIndex: 0,
  tracks: [
    {
      id: 'demo-1',
      title: 'ZungZangZungZe',
      artist: 'Cheng, Han Sara',
      duration: 215,
      thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      id: 'demo-2',
      title: 'Lofi Chill Lái Xe Đêm',
      artist: 'Vietnam Chill Beats',
      duration: 184,
      thumb: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
      id: 'demo-3',
      title: 'Tình Ca Mùa Xuân',
      artist: 'Various Artists',
      duration: 242,
      thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    }
  ]
};

// DOM References
const dom = {
  clockDisplay: document.getElementById('clockDisplay'),
  locationBox: document.getElementById('locationBox'),
  locationStreet: document.getElementById('locationStreet'),
  locationSub: document.getElementById('locationSub'),
  locationCity: document.getElementById('locationCity'),
  weatherTemp: document.getElementById('weatherTemp'),
  weatherDesc: document.getElementById('weatherDesc'),
  
  // Dock
  btnHome: document.getElementById('btnHome'),
  btnApps: document.getElementById('btnApps'),
  btnNav: document.getElementById('btnNav'),
  btnMic: document.getElementById('btnMic'),
  btnTheme: document.getElementById('btnTheme'),
  btnSettings: document.getElementById('btnSettings'),
  btnYoutube: document.getElementById('btnYoutube'),
  btnMusic: document.getElementById('btnMusic'),

  // Mini Player
  miniThumb: document.getElementById('miniThumb'),
  miniTitle: document.getElementById('miniTitle'),
  miniArtist: document.getElementById('miniArtist'),
  miniEq: document.getElementById('miniEq'),
  miniPlayBtn: document.getElementById('miniPlayBtn'),
  miniPlayIcon: document.getElementById('miniPlayIcon'),
  miniPrevBtn: document.getElementById('miniPrevBtn'),
  miniNextBtn: document.getElementById('miniNextBtn'),
  miniProgressBar: document.getElementById('miniProgressBar'),
  miniProgressFill: document.getElementById('miniProgressFill'),

  // Split Media & Navigation
  splitMediaPanel: document.getElementById('splitMediaPanel'),
  btnBackFromMedia: document.getElementById('btnBackFromMedia'),
  tabYoutubeBtn: document.getElementById('tabYoutubeBtn'),
  tabMusicBtn: document.getElementById('tabMusicBtn'),
  youtubeTabContent: document.getElementById('youtubeTabContent'),
  musicTabContent: document.getElementById('musicTabContent'),
  btnExpandMedia: document.getElementById('btnExpandMedia'),
  btnCloseMedia: document.getElementById('btnCloseMedia'),
  btnToggleSplit: document.getElementById('btnToggleSplit'),

  // YouTube
  ytIframe: document.getElementById('ytIframe'),
  ytSearchInput: document.getElementById('ytSearchInput'),
  ytSearchSubmit: document.getElementById('ytSearchSubmit'),
  btnYtModeWeb: document.getElementById('btnYtModeWeb'),
  btnYtModeMusic: document.getElementById('btnYtModeMusic'),
  btnYtModeEmbed: document.getElementById('btnYtModeEmbed'),
  btnOpenYtHome: document.getElementById('btnOpenYtHome'),
  btnReloadYt: document.getElementById('btnReloadYt'),

  // Local Music
  btnScanMusic: document.getElementById('btnScanMusic'),
  localFileInput: document.getElementById('localFileInput'),
  musicSearchInput: document.getElementById('musicSearchInput'),
  playlistContainer: document.getElementById('playlistContainer'),
  tabSongTitle: document.getElementById('tabSongTitle'),
  tabSongArtist: document.getElementById('tabSongArtist'),
  tabSongTime: document.getElementById('tabSongTime'),
  audioElement: document.getElementById('audioElement'),

  // Map & HUD
  leafletMap: document.getElementById('leafletMap'),
  externalMapFrame: document.getElementById('externalMapFrame'),
  speedLimitNumber: document.getElementById('speedLimitNumber'),
  hudSpeedLimit: document.getElementById('hudSpeedLimit'),
  currentSpeedVal: document.getElementById('currentSpeedVal'),
  hudGpsBadge: document.getElementById('hudGpsBadge'),
  gpsStatusIcon: document.getElementById('gpsStatusIcon'),
  gpsStatusText: document.getElementById('gpsStatusText'),
  sourceBadge: document.getElementById('sourceBadge'),
  currentSourceLabel: document.getElementById('currentSourceLabel'),
  sourceDropdown: document.getElementById('sourceDropdown'),
  btnRefreshGps: document.getElementById('btnRefreshGps'),
  btnRecenter: document.getElementById('btnRecenter'),
  btnZoomIn: document.getElementById('btnZoomIn'),
  btnZoomOut: document.getElementById('btnZoomOut'),

  // Modals
  settingsModal: document.getElementById('settingsModal'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  btnBackSettingsTop: document.getElementById('btnBackSettingsTop'),
  btnBackSettingsBottom: document.getElementById('btnBackSettingsBottom'),
  btnSaveSettings: document.getElementById('btnSaveSettings'),
  settingMapSource: document.getElementById('settingMapSource'),
  customUrlGroup: document.getElementById('customUrlGroup'),
  settingCustomMapUrl: document.getElementById('settingCustomMapUrl'),
  settingGpsMode: document.getElementById('settingGpsMode'),
  btnTriggerGpsNow: document.getElementById('btnTriggerGpsNow'),
  gpsCoordLabel: document.getElementById('gpsCoordLabel'),

  appsModal: document.getElementById('appsModal'),
  btnCloseApps: document.getElementById('btnCloseApps'),
  btnBackAppsTop: document.getElementById('btnBackAppsTop'),
  btnBackAppsBottom: document.getElementById('btnBackAppsBottom'),
  appLaunchHome: document.getElementById('appLaunchHome')
};

// Global Map Instance
let mapInstance = null;
let carMarker = null;
let navigationRoute = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initMap();
  initAudio();
  initEventListeners();
  loadSettings();
  renderPlaylist();
  
  // Start active GPS tracking immediately
  initLocation();
});

/* ============================================================
   1. CLOCK & TIME
   ============================================================ */
function initClock() {
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    dom.clockDisplay.textContent = `${hours}:${minutes}`;
  }
  updateTime();
  setInterval(updateTime, 1000);
}

/* ============================================================
   2. ROBUST GPS LOCATION ENGINE (Fix: Problem #1)
   ============================================================ */
function initLocation() {
  dom.gpsStatusText.textContent = "Đang tìm tín hiệu GPS...";
  dom.gpsStatusIcon.className = "fa-solid fa-satellite-dish fa-spin text-warning";

  // 1. Try Native Android Location Bridge first
  if (window.CarNaviApp) {
    try {
      window.CarNaviApp.refreshGpsLocation();
      const rawGps = window.CarNaviApp.getGpsData();
      if (rawGps) {
        const parsed = JSON.parse(rawGps);
        if (parsed.lat && parsed.lng && (parsed.lat !== 10.7963 || parsed.hasFix)) {
          updateRealPosition(parsed.lat, parsed.lng, parsed.speed || 0, parsed.bearing || 0);
        }
      }
    } catch (e) {
      console.log('Android Location Bridge error:', e);
    }
  }

  // 2. Try HTML5 Geolocation API (Works in WebView & Browser)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateRealPosition(pos.coords.latitude, pos.coords.longitude, (pos.coords.speed || 0) * 3.6, pos.coords.heading || 0);
      },
      (err) => {
        console.warn('HTML5 Geolocation initial check:', err.message);
        // Fallback to IP Geolocation if GPS takes time
        if (!state.hasRealGpsFix) fetchIpFallbackLocation();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
    );

    // Continuous GPS Watch
    navigator.geolocation.watchPosition(
      (pos) => {
        updateRealPosition(pos.coords.latitude, pos.coords.longitude, (pos.coords.speed || 0) * 3.6, pos.coords.heading || 0);
      },
      (err) => {
        console.warn('HTML5 GPS watch error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
    );
  } else {
    fetchIpFallbackLocation();
  }
}

// Fallback: Query IP Geolocation API so user immediately gets real city & coordinates even indoors
function fetchIpFallbackLocation() {
  if (state.hasRealGpsFix) return;
  fetch('https://get.geojs.io/v1/ip/geo.json')
    .then(res => res.json())
    .then(data => {
      if (!state.hasRealGpsFix && data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        updateRealPosition(lat, lng, 0, 0, false);
        if (data.city) {
          dom.locationCity.textContent = data.city;
        }
      }
    })
    .catch(() => {
      // Secondary fallback
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(d => {
          if (!state.hasRealGpsFix && d.latitude && d.longitude) {
            updateRealPosition(d.latitude, d.longitude, 0, 0, false);
            if (d.city) dom.locationCity.textContent = d.city;
          }
        })
        .catch(e => console.log('IP Location fallback error:', e));
    });
}

// Central handler for all location updates (from Android GPS, HTML5, or IP)
function updateRealPosition(lat, lng, speed = 0, bearing = 0, isDirectGps = true) {
  if (isDirectGps) {
    state.hasRealGpsFix = true;
    dom.hudGpsBadge.classList.add('has-fix');
    dom.gpsStatusIcon.className = "fa-solid fa-location-crosshairs text-success";
    dom.gpsStatusText.textContent = `GPS Đã Khóa (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } else {
    dom.gpsStatusIcon.className = "fa-solid fa-tower-broadcast text-info";
    dom.gpsStatusText.textContent = `Vị Trí Mạng (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }

  state.currentLat = lat;
  state.currentLng = lng;
  state.currentSpeed = Math.round(speed);
  state.currentBearing = bearing;

  dom.currentSpeedVal.textContent = state.currentSpeed;
  if (dom.gpsCoordLabel) {
    dom.gpsCoordLabel.textContent = `Tọa độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  // Speed warning color check
  if (state.currentSpeed > state.speedLimit) {
    dom.currentSpeedVal.style.color = '#EF4444';
  } else {
    dom.currentSpeedVal.style.color = '#000000';
  }

  // Update Leaflet Map Marker and View
  if (mapInstance && state.currentMapSource === 'osm') {
    const latlng = [lat, lng];
    if (carMarker) {
      carMarker.setLatLng(latlng);
      const arrow = document.getElementById('carMarkerArrow');
      if (arrow) arrow.style.transform = `rotate(${bearing}deg)`;
    }
    mapInstance.panTo(latlng, { animate: true });
  }

  // Update External Map URLs with real GPS
  if (state.currentMapSource !== 'osm') {
    updateExternalMapUrl();
  }

  // Reverse geocode to get Vietnamese Street, District, City
  reverseGeocode(lat, lng);

  // Fetch real weather for current coordinates
  fetchLiveWeather(lat, lng);
}

// Callback invoked by Android Kotlin MainActivity when real GPS updates
window.onGpsUpdate = function(data) {
  if (data && data.lat && data.lng) {
    updateRealPosition(data.lat, data.lng, data.speed || 0, data.bearing || 0, true);
  }
};

// Reverse geocoding with OpenStreetMap Nominatim for real Vietnamese address
let lastGeocodeTime = 0;
function reverseGeocode(lat, lng) {
  const now = Date.now();
  if (now - lastGeocodeTime < 15000) return; // Rate limit 15s
  lastGeocodeTime = now;

  fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`)
    .then(res => res.json())
    .then(data => {
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.street || addr.neighbourhood || addr.suburb || "Vị trí hiện tại";
        const sub = addr.quarter || addr.suburb || addr.city_district || addr.district || addr.county || "";
        const city = addr.city || addr.state || addr.province || "Việt Nam";

        dom.locationStreet.textContent = street;
        dom.locationSub.textContent = sub;
        dom.locationCity.textContent = city;
      }
    })
    .catch(e => console.log('Geocode error:', e));
}

// Live Weather from Open-Meteo
function fetchLiveWeather(lat, lng) {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
    .then(res => res.json())
    .then(data => {
      if (data && data.current_weather) {
        const temp = Math.round(data.current_weather.temperature);
        dom.weatherTemp.textContent = `${temp}°C`;

        const code = data.current_weather.weathercode;
        let desc = "Có Mây";
        let iconHtml = '<i class="fa-solid fa-cloud-sun text-warning"></i>';

        if (code === 0) {
          desc = "Trời Nắng";
          iconHtml = '<i class="fa-solid fa-sun text-warning"></i>';
        } else if (code >= 1 && code <= 3) {
          desc = "Có Mây";
          iconHtml = '<i class="fa-solid fa-cloud-sun text-warning"></i>';
        } else if (code >= 51 && code <= 67) {
          desc = "Có Mưa Nhỏ";
          iconHtml = '<i class="fa-solid fa-cloud-rain text-primary"></i>';
        } else if (code >= 80) {
          desc = "Mưa Rào";
          iconHtml = '<i class="fa-solid fa-cloud-showers-heavy text-primary"></i>';
        }
        
        dom.weatherDesc.textContent = desc;
        const iconSpan = document.querySelector('.weather-icon');
        if (iconSpan) iconSpan.innerHTML = iconHtml;
      }
    })
    .catch(e => console.log('Weather fetch error:', e));
}

/* ============================================================
   3. LEAFLET NAVIGATION MAP
   ============================================================ */
function initMap() {
  if (typeof L === 'undefined') {
    console.error('Leaflet not loaded');
    return;
  }

  const startPos = [state.currentLat, state.currentLng];

  mapInstance = L.map('leafletMap', {
    center: startPos,
    zoom: 17,
    zoomControl: false,
    attributionControl: false
  });

  // CartoDB Voyager tiles (clean, stylish, 3D building outlines)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(mapInstance);

  // Custom Car 3D Navigation Chevron Marker
  const carIcon = L.divIcon({
    className: 'car-marker-container',
    html: `<div class="car-marker-arrow" id="carMarkerArrow" style="transform: rotate(${state.currentBearing}deg);"></div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  carMarker = L.marker(startPos, { icon: carIcon }).addTo(mapInstance);
}

/* ============================================================
   4. MAP SOURCE SWITCHER
   ============================================================ */
function switchMapSource(sourceKey, customUrl = '') {
  state.currentMapSource = sourceKey;
  localStorage.setItem('carnavi_mapsource', sourceKey);

  const labels = {
    osm: 'OSM 3D Map',
    gmaps: 'Google Maps Live',
    vietmap: 'Vietmap Live',
    waze: 'Waze Báo Kẹt Xe',
    custom: 'Custom Map'
  };
  dom.currentSourceLabel.textContent = labels[sourceKey] || 'Bản đồ';

  document.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.source === sourceKey);
  });

  if (sourceKey === 'osm') {
    dom.leafletMap.style.display = 'block';
    dom.externalMapFrame.style.display = 'none';
    if (mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
        mapInstance.setView([state.currentLat, state.currentLng], 17);
      }, 300);
    }
  } else {
    dom.leafletMap.style.display = 'none';
    dom.externalMapFrame.style.display = 'block';
    updateExternalMapUrl(customUrl);
  }

  dom.sourceDropdown.classList.remove('show');
}

function updateExternalMapUrl(customUrl = '') {
  const lat = state.currentLat;
  const lng = state.currentLng;
  let targetUrl = '';

  if (state.currentMapSource === 'gmaps') {
    // Google Maps with exact vehicle coordinates pinned
    targetUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  } else if (state.currentMapSource === 'vietmap') {
    targetUrl = `https://maps.vietmap.vn/?lat=${lat}&lng=${lng}`;
  } else if (state.currentMapSource === 'waze') {
    targetUrl = `https://embed.waze.com/iframe?zoom=16&lat=${lat}&lon=${lng}&ct=livemap`;
  } else if (state.currentMapSource === 'custom') {
    targetUrl = customUrl || state.customMapUrl || 'https://www.openstreetmap.org';
  }

  if (targetUrl && dom.externalMapFrame.src !== targetUrl) {
    dom.externalMapFrame.src = targetUrl;
  }
}

/* ============================================================
   5. NAVIGATION / GO HOME ENGINE (Fix: Problem #2)
   ============================================================ */
function goHome() {
  // 1. Close media split panel
  state.isMediaOpen = false;
  state.isMediaExpanded = false;
  dom.splitMediaPanel.classList.remove('open', 'expanded');
  dom.btnYoutube.classList.remove('active');
  dom.btnMusic.classList.remove('active');

  // 2. Close all open modals
  dom.settingsModal.classList.remove('show');
  dom.appsModal.classList.remove('show');
  dom.sourceDropdown.classList.remove('show');

  // 3. Highlight Home Dock Button
  document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
  dom.btnHome.classList.add('active');

  // 4. Reset & Recenter Map View
  setTimeout(() => {
    if (mapInstance && state.currentMapSource === 'osm') {
      mapInstance.invalidateSize();
      mapInstance.setView([state.currentLat, state.currentLng], 17);
    }
  }, 300);
}

// Android Back Button handler
window.handleAppBack = function() {
  if (dom.settingsModal.classList.contains('show')) {
    dom.settingsModal.classList.remove('show');
    return "handled";
  }
  if (dom.appsModal.classList.contains('show')) {
    dom.appsModal.classList.remove('show');
    return "handled";
  }
  if (state.isMediaExpanded) {
    state.isMediaExpanded = false;
    dom.splitMediaPanel.classList.remove('expanded');
    return "handled";
  }
  if (state.isMediaOpen) {
    goHome();
    return "handled";
  }
  return "unhandled";
};

/* ============================================================
   6. YOUTUBE ENGINE (Fix: Problem #3 - Sửa triệt để lỗi 153)
   ============================================================ */
function searchYouTube(query) {
  if (!query) query = "nhạc trẻ remix 2026";
  const encoded = encodeURIComponent(query);

  if (state.ytMode === 'web') {
    // Mode 1: Mobile YouTube Web - 100% bypass Error 153 & restriction
    dom.ytIframe.src = `https://m.youtube.com/results?search_query=${encoded}`;
  } else if (state.ytMode === 'music') {
    // Mode 2: YouTube Music
    dom.ytIframe.src = `https://music.youtube.com/search?q=${encoded}`;
  } else {
    // Mode 3: Iframe Player with valid HTTPS origin
    dom.ytIframe.src = `https://www.youtube-nocookie.com/embed?listType=search&list=${encoded}&autoplay=1&enablejsapi=1&origin=https://appassets.androidplatform.net`;
  }
}

function setYtMode(mode) {
  state.ytMode = mode;
  dom.btnYtModeWeb.classList.toggle('active', mode === 'web');
  dom.btnYtModeMusic.classList.toggle('active', mode === 'music');
  dom.btnYtModeEmbed.classList.toggle('active', mode === 'embed');
  searchYouTube(dom.ytSearchInput.value.trim());
}

/* ============================================================
   7. AUDIO & LOCAL MUSIC PLAYER
   ============================================================ */
function initAudio() {
  const audio = dom.audioElement;

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    dom.miniProgressFill.style.width = `${progress}%`;

    const cur = formatTime(audio.currentTime);
    const total = formatTime(audio.duration);
    dom.tabSongTime.textContent = `${cur} / ${total}`;
  });

  audio.addEventListener('ended', () => {
    playNextTrack();
  });

  dom.miniProgressBar.addEventListener('click', (e) => {
    const rect = dom.miniProgressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audio.duration) {
      audio.currentTime = percent * audio.duration;
    }
  });

  loadTrack(0, false);
}

function loadTrack(index, autoPlay = true) {
  if (index < 0 || index >= state.tracks.length) return;
  state.currentTrackIndex = index;
  const track = state.tracks[index];

  dom.miniTitle.textContent = track.title;
  dom.miniArtist.textContent = track.artist;
  dom.tabSongTitle.textContent = track.title;
  dom.tabSongArtist.textContent = track.artist;

  if (track.thumb) dom.miniThumb.src = track.thumb;

  document.querySelectorAll('.song-row').forEach((row, idx) => {
    row.classList.toggle('active', idx === index);
  });

  if (window.CarNaviApp && track.isAndroidLocal && track.uri) {
    if (autoPlay) {
      window.CarNaviApp.playAudio(track.uri);
      setPlayingState(true);
    }
  } else {
    dom.audioElement.src = track.src;
    if (autoPlay) {
      dom.audioElement.play().then(() => setPlayingState(true)).catch(() => {});
    }
  }
}

function togglePlay() {
  if (state.isPlaying) {
    if (window.CarNaviApp && state.tracks[state.currentTrackIndex]?.isAndroidLocal) {
      window.CarNaviApp.pauseAudio();
    } else {
      dom.audioElement.pause();
    }
    setPlayingState(false);
  } else {
    if (window.CarNaviApp && state.tracks[state.currentTrackIndex]?.isAndroidLocal) {
      window.CarNaviApp.resumeAudio();
    } else {
      dom.audioElement.play();
    }
    setPlayingState(true);
  }
}

function setPlayingState(isPlaying) {
  state.isPlaying = isPlaying;
  if (isPlaying) {
    dom.miniPlayIcon.className = 'fa-solid fa-pause';
    dom.miniEq.classList.add('active');
    document.querySelector('.vinyl-disc')?.classList.add('playing');
  } else {
    dom.miniPlayIcon.className = 'fa-solid fa-play';
    dom.miniEq.classList.remove('active');
    document.querySelector('.vinyl-disc')?.classList.remove('playing');
  }
}

function playNextTrack() {
  let next = state.currentTrackIndex + 1;
  if (next >= state.tracks.length) next = 0;
  loadTrack(next, true);
}

function playPrevTrack() {
  let prev = state.currentTrackIndex - 1;
  if (prev < 0) prev = state.tracks.length - 1;
  loadTrack(prev, true);
}

function renderPlaylist() {
  dom.playlistContainer.innerHTML = '';
  state.tracks.forEach((track, idx) => {
    const row = document.createElement('div');
    row.className = `song-row ${idx === state.currentTrackIndex ? 'active' : ''}`;
    row.innerHTML = `
      <div class="song-row-num">${idx + 1}</div>
      <div class="song-row-info">
        <div class="song-row-title">${escapeHtml(track.title)}</div>
        <div class="song-row-artist">${escapeHtml(track.artist)}</div>
      </div>
      <div class="song-row-duration">${formatTime(track.duration)}</div>
    `;
    row.addEventListener('click', () => loadTrack(idx, true));
    dom.playlistContainer.appendChild(row);
  });
}

function scanAndroidMusic() {
  if (!window.CarNaviApp) return;
  try {
    const jsonStr = window.CarNaviApp.scanLocalMusic();
    const list = JSON.parse(jsonStr);
    if (list && list.length > 0) {
      const formatted = list.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        duration: Math.round(item.duration / 1000),
        thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80',
        uri: item.uri,
        isAndroidLocal: true
      }));
      state.tracks = formatted;
      renderPlaylist();
      loadTrack(0, false);
      alert(`Đã tìm thấy ${list.length} bài hát trong bộ nhớ máy!`);
    } else {
      window.CarNaviApp.requestPermissions();
    }
  } catch (e) {
    console.error('Scan music failed:', e);
  }
}

dom.localFileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const imported = files.map((file, i) => ({
    id: `file-${Date.now()}-${i}`,
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: 'Thiết bị lưu trữ',
    duration: 180,
    thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80',
    src: URL.createObjectURL(file)
  }));

  state.tracks = imported.concat(state.tracks);
  renderPlaylist();
  loadTrack(0, true);
});

/* ============================================================
   8. SPLIT MEDIA PANEL CONTROLS
   ============================================================ */
function openMediaPanel(tab = 'youtube') {
  state.isMediaOpen = true;
  state.activeMediaTab = tab;
  dom.splitMediaPanel.classList.add('open');
  switchMediaTab(tab);

  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 350);
}

function switchMediaTab(tab) {
  state.activeMediaTab = tab;
  dom.tabYoutubeBtn.classList.toggle('active', tab === 'youtube');
  dom.tabMusicBtn.classList.toggle('active', tab === 'music');
  dom.youtubeTabContent.classList.toggle('active', tab === 'youtube');
  dom.musicTabContent.classList.toggle('active', tab === 'music');

  dom.btnYoutube.classList.toggle('active', tab === 'youtube');
  dom.btnMusic.classList.toggle('active', tab === 'music');
}

/* ============================================================
   9. EVENT LISTENERS
   ============================================================ */
function initEventListeners() {
  // Home buttons (Problem #2)
  dom.btnHome.addEventListener('click', goHome);
  dom.btnBackFromMedia.addEventListener('click', goHome);
  dom.btnBackSettingsTop.addEventListener('click', goHome);
  dom.btnBackSettingsBottom.addEventListener('click', goHome);
  dom.btnBackAppsTop.addEventListener('click', goHome);
  dom.btnBackAppsBottom.addEventListener('click', goHome);
  dom.appLaunchHome.addEventListener('click', goHome);

  // Mini player controls
  dom.miniPlayBtn.addEventListener('click', togglePlay);
  dom.miniNextBtn.addEventListener('click', playNextTrack);
  dom.miniPrevBtn.addEventListener('click', playPrevTrack);

  // Dock items
  dom.btnNav.addEventListener('click', () => {
    goHome();
    document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
    dom.btnNav.classList.add('active');
  });

  dom.btnYoutube.addEventListener('click', () => {
    if (state.isMediaOpen && state.activeMediaTab === 'youtube') {
      goHome();
    } else {
      openMediaPanel('youtube');
    }
  });

  dom.btnMusic.addEventListener('click', () => {
    if (state.isMediaOpen && state.activeMediaTab === 'music') {
      goHome();
    } else {
      openMediaPanel('music');
    }
  });

  dom.btnToggleSplit.addEventListener('click', () => {
    if (state.isMediaOpen) {
      goHome();
    } else {
      openMediaPanel(state.activeMediaTab);
    }
  });

  // Media tabs
  dom.tabYoutubeBtn.addEventListener('click', () => switchMediaTab('youtube'));
  dom.tabMusicBtn.addEventListener('click', () => switchMediaTab('music'));
  dom.btnCloseMedia.addEventListener('click', goHome);

  dom.btnExpandMedia.addEventListener('click', () => {
    state.isMediaExpanded = !state.isMediaExpanded;
    dom.splitMediaPanel.classList.toggle('expanded', state.isMediaExpanded);
  });

  // YouTube Mode & Search controls (Problem #3)
  dom.btnYtModeWeb.addEventListener('click', () => setYtMode('web'));
  dom.btnYtModeMusic.addEventListener('click', () => setYtMode('music'));
  dom.btnYtModeEmbed.addEventListener('click', () => setYtMode('embed'));

  dom.ytSearchSubmit.addEventListener('click', () => {
    searchYouTube(dom.ytSearchInput.value.trim());
  });
  dom.ytSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchYouTube(dom.ytSearchInput.value.trim());
  });
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query;
      dom.ytSearchInput.value = q;
      searchYouTube(q);
    });
  });
  dom.btnOpenYtHome.addEventListener('click', () => {
    dom.ytIframe.src = 'https://m.youtube.com';
  });
  dom.btnReloadYt.addEventListener('click', () => {
    dom.ytIframe.src = dom.ytIframe.src;
  });

  // Local music scan
  dom.btnScanMusic.addEventListener('click', () => {
    if (window.CarNaviApp) {
      scanAndroidMusic();
    } else {
      dom.localFileInput.click();
    }
  });

  // GPS Refresh buttons (Problem #1)
  dom.hudGpsBadge.addEventListener('click', initLocation);
  dom.btnRefreshGps.addEventListener('click', initLocation);
  dom.btnTriggerGpsNow.addEventListener('click', () => {
    initLocation();
    alert('Đang yêu cầu hệ thống định vị cập nhật lại vị trí chính xác...');
  });
  dom.locationBox.addEventListener('click', initLocation);

  // Speed Limit click
  dom.hudSpeedLimit.addEventListener('click', () => {
    const limits = [40, 50, 60, 80, 90, 100, 120];
    const curIdx = limits.indexOf(state.speedLimit);
    const nextLimit = limits[(curIdx + 1) % limits.length];
    setSpeedLimit(nextLimit);
  });

  // Map Source Dropdown Toggle
  dom.sourceBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.sourceDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!dom.sourceBadge.contains(e.target) && !dom.sourceDropdown.contains(e.target)) {
      dom.sourceDropdown.classList.remove('show');
    }
  });

  document.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.source;
      if (src === 'custom') {
        openSettingsModal();
      } else {
        switchMapSource(src);
      }
    });
  });

  // Map controls
  dom.btnZoomIn.addEventListener('click', () => {
    if (mapInstance && state.currentMapSource === 'osm') mapInstance.zoomIn();
  });
  dom.btnZoomOut.addEventListener('click', () => {
    if (mapInstance && state.currentMapSource === 'osm') mapInstance.zoomOut();
  });
  dom.btnRecenter.addEventListener('click', () => {
    if (mapInstance && state.currentMapSource === 'osm') {
      mapInstance.setView([state.currentLat, state.currentLng], 17);
    }
  });

  // Theme toggle
  dom.btnTheme.addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    const isDark = document.body.classList.contains('theme-dark');
    localStorage.setItem('carnavi_theme', isDark ? 'dark' : 'light');
  });

  // Voice Assistant
  dom.btnMic.addEventListener('click', () => {
    if (window.CarNaviApp) {
      window.CarNaviApp.launchVoiceAssistant();
    } else {
      alert('Đang kích hoạt nhận diện giọng nói tiếng Việt...');
    }
  });

  // Settings Modal
  dom.btnSettings.addEventListener('click', openSettingsModal);
  dom.btnCloseSettings.addEventListener('click', closeSettingsModal);
  dom.btnSaveSettings.addEventListener('click', saveSettings);

  dom.settingMapSource.addEventListener('change', () => {
    dom.customUrlGroup.style.display = dom.settingMapSource.value === 'custom' ? 'flex' : 'none';
  });

  document.querySelectorAll('.limit-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.limit-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Apps Modal
  dom.btnApps.addEventListener('click', () => dom.appsModal.classList.add('show'));
  dom.btnCloseApps.addEventListener('click', () => dom.appsModal.classList.remove('show'));
  
  document.getElementById('appLaunchGmaps')?.addEventListener('click', () => {
    dom.appsModal.classList.remove('show');
    switchMapSource('gmaps');
  });
  document.getElementById('appLaunchYoutube')?.addEventListener('click', () => {
    dom.appsModal.classList.remove('show');
    openMediaPanel('youtube');
  });
  document.getElementById('appLaunchMusic')?.addEventListener('click', () => {
    dom.appsModal.classList.remove('show');
    openMediaPanel('music');
  });
}

/* ============================================================
   10. SETTINGS & UTILITIES
   ============================================================ */
function setSpeedLimit(limit) {
  state.speedLimit = limit;
  dom.speedLimitNumber.textContent = limit;
  localStorage.setItem('carnavi_speedlimit', limit);
}

function openSettingsModal() {
  dom.settingMapSource.value = state.currentMapSource;
  dom.settingCustomMapUrl.value = state.customMapUrl;
  dom.customUrlGroup.style.display = state.currentMapSource === 'custom' ? 'flex' : 'none';
  dom.settingGpsMode.value = state.gpsMode;

  document.querySelectorAll('.limit-chip').forEach(chip => {
    chip.classList.toggle('active', parseInt(chip.dataset.limit) === state.speedLimit);
  });

  dom.settingsModal.classList.add('show');
}

function closeSettingsModal() {
  dom.settingsModal.classList.remove('show');
}

function saveSettings() {
  const source = dom.settingMapSource.value;
  const customUrl = dom.settingCustomMapUrl.value.trim();
  const activeLimitChip = document.querySelector('.limit-chip.active');
  const limit = activeLimitChip ? parseInt(activeLimitChip.dataset.limit) : 50;

  state.customMapUrl = customUrl;
  localStorage.setItem('carnavi_customurl', customUrl);

  state.gpsMode = dom.settingGpsMode.value;
  setSpeedLimit(limit);
  switchMapSource(source, customUrl);

  closeSettingsModal();
}

function loadSettings() {
  const savedSource = localStorage.getItem('carnavi_mapsource') || 'osm';
  const savedUrl = localStorage.getItem('carnavi_customurl') || '';
  const savedLimit = parseInt(localStorage.getItem('carnavi_speedlimit')) || 50;
  const savedTheme = localStorage.getItem('carnavi_theme') || 'light';

  state.customMapUrl = savedUrl;
  setSpeedLimit(savedLimit);
  if (savedTheme === 'dark') document.body.classList.add('theme-dark');
  switchMapSource(savedSource, savedUrl);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
