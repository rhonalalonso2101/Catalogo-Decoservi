const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const router = express.Router();

// Registro de usuario
router.post('/registrar-usuario', async (req, res) => {
  const { nombreUsuario, contraseña, rol } = req.body;

  try {
    const hash = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = new Usuario({
      nombreUsuario,
      contraseña: hash,
      rol
    });

    await nuevoUsuario.save();
    res.send('Usuario registrado con éxito');
  } catch (error) {
    res.status(400).send('Error al registrar: ' + error.message);
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { nombreUsuario, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ nombreUsuario });

    if (!usuario) return res.status(401).send('Usuario no encontrado');

    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) return res.status(401).send('Contraseña incorrecta');

    req.session.usuario = {
      id: usuario._id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol
    };

    res.send({ mensaje: 'Login exitoso', rol: usuario.rol });
  } catch (error) {
    res.status(500).send('Error al iniciar sesión');
  }
});

// Cierre de sesión
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    res.send('Sesión cerrada');
  });
});

// ✅ Exporta todas las rutas al final

router.get('/verificar-sesion', (req, res) => {
  if (req.session?.usuario) {
    res.json(req.session.usuario);
  } else {
    res.status(401).send('No autenticado');
  }
});
module.exports = router;