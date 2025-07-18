require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
const session = require('express-session');

const app = express();


// ✅ Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// 1. Configurar carpeta de imágenes públicas
app.use("/images", express.static(path.join(__dirname, "images")));

// 2. Configurar CORS
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://catalogo-decoservi.onrender.com',
    'https://catalogo-clientes-decoservi.onrender.com'
  ],
  credentials: true // 👈 IMPORTANTE para sesiones
}));

// 3. Middleware para parsear JSON
app.use(express.json());

// ✅ Esto le dice a Express que confíe en el proxy de Render
app.set('trust proxy', 1);
// 4. ✅ Configurar sesiones ANTES de las rutas
app.use(session({
  secret: 'clave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,         // ✅ producción HTTPS (Render)
    sameSite: 'none',     // ✅ permitir cookies cross-origin
    maxAge: 1000 * 60 * 60 * 4 // opcional: 4 horas
  }
}));


// 5. Conectar a MongoDB
console.log('URI de MongoDB:', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

// 6. Rutas
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

const rutasProductos = require('./routes/productos');
app.use('/api/productos', rutasProductos);

const pedidosRoutes = require('./routes/pedidos');
app.use('/api/pedidos', pedidosRoutes);

const clientesRouter = require('./routes/clientes');
app.use('/api/clientes', clientesRouter);

const rutaUsuarios = require('./routes/usuarios');
app.use('/', rutaUsuarios); // 👈 Aquí llegan login/logout

// 7. Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
