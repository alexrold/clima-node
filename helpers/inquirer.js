require('colors');
const inquirer = require('inquirer');

const preguntas = [
  {
    type: 'list',
    name: 'opcion',
    message: '¿Que desea hacer?',
    choices: [
      {
        value: 1,
        name: `${'1.'.green} Buscar Ciudad`.white,
      },
      {
        value: 2,
        name: `${'2.'.green} Historial`.white,
      },
      {
        value: 0,
        name: `${'0.'.green} Salir`.white,
      },
    ],
  },
];

const inquirerMenu = async () => {
  process.stdout.write('\u001b[0J\u001b[1J\u001b[2J\u001b[0;0H\u001b[0;0W');
  console.log('========================='.green);
  console.log('  Seleccione una Opción  '.cyan);
  console.log('=========================\n'.green);

  const { opcion } = await inquirer.prompt(preguntas);
  return opcion;
};

const pausaMenu = async () => {
  const quest = [
    {
      type: 'input',
      name: 'enter',
      message: `Presione ${'ENTER'.green} PARA CONTINUAR `,
    },
  ];
  console.log('\n');
  await inquirer.prompt(quest);
};

const leerInput = async (message) => {
  const quest = [
    {
      type: 'input',
      name: 'desc',
      message,
      validate(value) {
        if (value.length === 0) {
          return 'Por favor ingrese una descripción';
        }
        return true;
      },
    },
  ];
  const { desc } = await inquirer.prompt(quest);
  return desc;
};

const mostrarListadoLugares = async (infoLugares = []) => {
  const choices = infoLugares.map((lugar, i) => {
    const idx = `${i + 1}.`.green;

    return {
      value: lugar.id,
      name: `${idx} ${lugar.nombre}`,
    };
  });

  choices.unshift({
    value: '0',
    name: '0.'.green + ' Cancelar',
  });

  const preguntas = [
    {
      type: 'list',
      name: 'id',
      message: 'Seleccione lugar: ',
      choices,
    },
  ];

  const { id } = await inquirer.prompt(preguntas);
  return id;
};

module.exports = {
  inquirerMenu,
  pausaMenu,
  leerInput,
  mostrarListadoLugares,
};
