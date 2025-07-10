const radius = require('node-radius-client');

console.log('EXPORTADO:', radius);
console.log('DEFAULT:', radius.default);
console.log('É função construtora?', typeof radius.default === 'function');
