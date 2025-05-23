const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  telefono: String,
  direccion: String,
  municipio: String,
  requiereFactura: Boolean,
  nit: String,
  correo: String
});

module.exports = mongoose.model('Cliente', clienteSchema);
