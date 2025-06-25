require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const app = express(); // <-- DEBE estar antes de usar `app`

// ✅ Ahora sí puedes usar app.use
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://catalogo-decoservi.onrender.com',// ✅ frontend en producción
    'https://catalogo-clientes-decoservi.onrender.com' // ✅ nuevo frontend solo visualización
  ]
}));

app.use(express.json());

const rutasProductos = require('./routes/productos');
app.use('/api/productos', rutasProductos);

console.log('URI de MongoDB:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

const Producto = require('./models/Producto');

const pedidosRoutes = require('./routes/pedidos');
app.use('/api/pedidos', pedidosRoutes);

const clientesRouter = require('./routes/clientes');
app.use('/api/clientes', clientesRouter);
