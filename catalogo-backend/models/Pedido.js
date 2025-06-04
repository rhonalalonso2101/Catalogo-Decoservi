console.log("✅ Modelo Pedido cargado con TALLA, COLOR y MEDIDA");

const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: String,
  cantidad: Number,
  precio: Number,
  talla: { type: String, default: null },
  color: { type: String, default: null },
  medida: { type: String, default: null }
}, { _id: false }); // ← importante para evitar sub-id duplicados

const pedidoSchema = new mongoose.Schema({
  cliente: String,
  productos: [productoSchema], // 👈 usamos el esquema correctamente tipado
  total: Number,
  fecha: {
    type: Date,
    default: Date.now
  }
});

// 💣 limpia versiones en caché
delete mongoose.connection.models['Pedido'];

module.exports = mongoose.model('Pedido', pedidoSchema);
