const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: { type: String, unique: true }, // será el login
  contraseña: String,
  rol: { type: String, enum: ['admin', 'vendedor'], default: 'vendedor' }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
