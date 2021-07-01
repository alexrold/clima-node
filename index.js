require('dotenv').config();

const {
  inquirerMenu,
  pausaMenu,
  leerInput,
  mostrarListadoLugares,
} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {
  const busquedas = new Busquedas();

  let opt;
  do {
    opt = await inquirerMenu();

    //* controla el menu
    switch (opt) {
      case 1:
        //TODO pass:
        // Mostrar Mensaje solicitar lugar
        const search = await leerInput('Ciudad: ');
        // Buscar Lugares => Geolocalización
        const infoLugares = await busquedas.ciudad(search);
        // Mostrar Lugares  leer seleccion
        const idSel = await mostrarListadoLugares(infoLugares);
        // if cancel
        if (idSel === '0') continue;
        // info seleccion
        const infoSel = infoLugares.find((lugar) => lugar.id === idSel);
        const { nombre, lng, lat } = infoSel;
        // Guardar busqueda
        busquedas.manejarHistorial(nombre);
        // Obtener Clima
        const clima = await busquedas.obtenerClima(lat, lng);
        const { desc, tempActual, tempMax, tempMin } = clima;
        // Mostrar Resultado
        process.stdout.write(
          '\u001b[0J\u001b[1J\u001b[2J\u001b[0;0H\u001b[0;0W'
        );
        console.log(`\nInformación del clima en ${nombre}: \n`.cyan);
        console.log('\tPronostico para hoy: '.green, `${desc}`.white);
        console.log('\tLat:'.green, `${lat}`.white);
        console.log('\tLng: '.green, `${lng}`.white);
        console.log('\tTemperatura actual: '.green, `${tempActual}`.white);
        console.log('\tMaxima: '.green, `${tempMax}`.white);
        console.log('\tMinima: '.green, `${tempMin}`.white);
        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`\n${idx} ${lugar}`);
        });
        break;
    }
    if (opt !== 0) await pausaMenu();
  } while (opt !== 0);
};
main();
