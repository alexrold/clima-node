// models/busquedas.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class Busquedas {
  historial = [];
  // Ruta ABSOLUTA al JSON (este archivo está en /models → sube a /db/database.json)
  dbPath = path.resolve(__dirname, '../db/database.json');

  constructor() {
    this.ensureDB();          // Crea carpeta/archivo si no existen
    this.leerDataHistorial(); // Carga historial si existe
  }

  ensureDB() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ historial: [] }, null, 2));
    }
  }

  // Geocodificación de OpenWeather (reemplazo de Mapbox)
  get paramsOWMGeo() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      limit: 5,
    };
  }

  // Parámetros de OpenWeather para clima
  get paramspenweathermap() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es',
    };
  }

  get historialCapitalizado() {
    return this.historial.map((registro) => {
      let palabras = registro.split(' ');
      palabras = palabras.map(
        (palabra) => palabra[0].toUpperCase() + palabra.substring(1)
      );
      return palabras.join(' ');
    });
  }

  async ciudad(search = '') {
    try {
      // Geocoding con OpenWeather
      const { data } = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
        params: { ...this.paramsOWMGeo, q: search },
        timeout: 10000,
      });

      return (data || []).map((lugar) => ({
        // ID sintético para seleccionar: lat,lon
        id: `${lugar.lat},${lugar.lon}`,
        // Nombre amigable
        nombre: [lugar.name, lugar.state, lugar.country].filter(Boolean).join(', '),
        lng: lugar.lon,
        lat: lugar.lat,
      }));
    } catch {
      return [];
    }
  }

  async obtenerClima(lat, lon) {
    try {
      const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { ...this.paramspenweathermap, lat, lon },
        timeout: 10000,
      });
      const { weather, main } = data;

      return {
        desc: weather[0].description,
        tempActual: main.temp,
        tempMax: main.temp_max,
        tempMin: main.temp_min,
      };
    } catch (error) {
      console.log(error);
    }
  }

  manejarHistorial(lugar = '') {
    // prevenir duplicados
    if (this.historial.includes(lugar.toLowerCase())) {
      return;
    }
    // Limite historial (mantén los 9 más recientes)
    this.historial = this.historial.splice(0, 9);
    // agregar al inicio
    this.historial.unshift(lugar.toLowerCase());
    // grabar en db
    this.guardarDataHistorial();
  }

  guardarDataHistorial() {
    this.ensureDB(); // por si borran la carpeta en caliente
    const payload = { historial: this.historial };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload, null, 2));
  }

  leerDataHistorial() {
    try {
      if (!fs.existsSync(this.dbPath)) {
        this.historial = [];
        return;
      }
      const infojson = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
      const data = JSON.parse(infojson || '{}');
      this.historial = Array.isArray(data.historial) ? data.historial : [];
    } catch {
      // Si el JSON está corrupto, no tumbes la app
      this.historial = [];
    }
  }
}

module.exports = Busquedas;
