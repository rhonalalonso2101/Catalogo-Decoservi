const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
});

module.exports = router;
