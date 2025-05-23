const mongoose = require('mongoose');
const csv = require('csvtojson');
const Producto = require('./models/Producto'); // Ajusta si tu modelo está en otro path

const MONGO_URI= 'mongodb+srv://rhonalalonso:Lina2101.@cluster0.tsgrqtt.mongodb.net/Catalogo?retryWrites=true&w=majority&appName=Cluster0';

async function importarCSV() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Leer CSV
    const productos = await csv({ delimiter: ';' }).fromFile('productos catalogo.csv');

    // Limpieza opcional: eliminar todos los productos antes
    await Producto.deleteMany({});
    console.log('🗑️ Productos anteriores eliminados');

    // Insertar nuevos productos
    await Producto.insertMany(productos);
    console.log(`✅ ${productos.length} productos importados correctamente`);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error al importar:', err);
  }
}

importarCSV();
