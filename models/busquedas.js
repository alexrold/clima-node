const fs = require('fs');
const axios = require('axios');

class Busquedas {
  historial = [];
  dbPath = './db/database.json';

  constructor() {
    //TODO: Si existe DB ? Leer DB.
    this.leerDataHistorial();
  }

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: 'es',
    };
  }
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
      // peticion http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json`,
        params: this.paramsMapbox,
      });
      const lugares = await instance.get();
      //*
      return lugares.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }

  async obtenerClima(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: 'http://api.openweathermap.org/data/2.5/weather?',
        params: { ...this.paramspenweathermap, lat, lon },
      });

      const clima = await instance.get();
      const { weather, main } = clima.data;

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
    //TODO:
    // prevenir duplicados
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    // Limite historial
    this.historial = this.historial.splice(0, 9);
    // agregar al historial
    this.historial.unshift(lugar.toLocaleLowerCase());
    //grabar en db
    this.guardarDataHistorial();
  }

  guardarDataHistorial() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }
  leerDataHistorial() {
    // veificar
    if (!fs.existsSync(this.dbPath)) return;

    // leer db
    const infojson = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
    const data = JSON.parse(infojson);
    this.historial = data.historial;
  }
}
module.exports = Busquedas;
