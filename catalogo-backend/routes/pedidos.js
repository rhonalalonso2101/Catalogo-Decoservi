// routes/pedidos.js
const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');

// Ruta POST para guardar un pedido
router.post('/', async (req, res) => {
  try {
    console.log("🔍 Pedido recibido en backend:");
    console.log(JSON.stringify(req.body, null, 2)); // 👈 imprime el pedido recibido

    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save();

    res.status(201).json(nuevoPedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el pedido' });
  }
});

// Ruta GET para obtener los últimos 3 pedidos de un cliente
router.get('/:cliente', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ cliente: req.params.cliente })
      .sort({ fecha: -1 })
      .limit(3);
    res.json(pedidos);
  } catch (err) {
    console.error("Error al obtener historial de pedidos:", err);
    res.status(500).json({ error: "Error al obtener historial." });
  }
});

module.exports = router;
