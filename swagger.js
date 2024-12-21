const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Cat Hotel API',
    description: 'API для управления гостиницей для кошек',
  },
  host: 'localhost:8080',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['index.js', './controllers/Controller.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);
