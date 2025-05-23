// routes/clientes.js (o dentro de tu archivo principal de rutas)

const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  const {
    nombre,
    telefono,
    direccion,
    municipio,
    requiereFactura,
    nit,
    correo
  } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }

  try {
    const existente = await Cliente.findOne({ nombre });
    if (existente) {
      return res.status(409).json({ error: 'El cliente ya existe' });
    }

    const nuevoCliente = new Cliente({
      nombre,
      telefono,
      direccion,
      municipio,
      requiereFactura,
      nit,
      correo
    });

    await nuevoCliente.save();
    res.status(201).json(nuevoCliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear el cliente' });
  }
});

// Express backend (clientes.js)
router.get('/nombre/:nombre', async (req, res) => {
  const cliente = await Cliente.findOne({ nombre: req.params.nombre });
  if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });
  res.json(cliente);
});


module.exports = router;