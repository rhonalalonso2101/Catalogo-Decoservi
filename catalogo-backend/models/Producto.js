const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  imagen: String,
});

// 👇 Aquí forzamos el nombre de la colección a "Productos"
module.exports = mongoose.model('Producto', productoSchema, 'Productos');
