// models/Pedido.js
const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  cliente: String,
  productos: [
    {
      nombre: String,
      cantidad: Number,
      precio: Number
    }
  ],
  total: Number,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pedido', pedidoSchema);
