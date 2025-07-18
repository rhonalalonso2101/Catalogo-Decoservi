function verificarSesion(req, res, next) {
  if (req.session && req.session.usuario) {
    next(); // Usuario autenticado
  } else {
    res.status(401).send('No autenticado');
  }
}

function soloAdmin(req, res, next) {
  if (req.session?.usuario?.rol === 'admin') {
    next(); // Usuario con rol admin
  } else {
    res.status(403).send('Acceso restringido: solo admin');
  }
}

module.exports = { verificarSesion, soloAdmin };
