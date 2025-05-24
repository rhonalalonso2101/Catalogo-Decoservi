document.addEventListener('DOMContentLoaded', () => {
  let productos = [];
  let productoActualIndex = null;
  let carrito = [];
  const historialContenedor = document.getElementById("historial-contenedor");

  const productContainer = document.getElementById("product-container");
  const carritoIcono = document.getElementById("carrito-icono");
  const carritoPanel = document.getElementById("carrito-panel");
  const contadorCarrito = document.getElementById("contador-carrito");
  const listaCarrito = document.getElementById("lista-carrito");
  const finalizarPedido = document.getElementById("finalizar-pedido");
  const modal = document.getElementById("modal");
  const cerrarModal = document.getElementById("cerrar-modal");
  const cantidadInput = document.getElementById("cantidad");
  const historialBtn = document.getElementById("ver-historial");
  const clienteSelect = document.getElementById("cliente-select");
  const btnAgregarCliente = document.getElementById("btn-agregar-cliente");
  const getImagenSrc = (imagen) => {
    return imagen.startsWith("http")
      ? imagen
      : `https://catalogo-backend-jkhy.onrender.com/images/${encodeURIComponent(imagen)}`;
  };
  

const modalCliente = document.getElementById("modal-cliente");
const cerrarModalCliente = document.getElementById("cerrar-modal-cliente");
const formNuevoCliente = document.getElementById("form-nuevo-cliente");
const checkboxFactura = document.getElementById("cliente-factura");
const camposFactura = document.getElementById("factura-extra");

btnAgregarCliente.addEventListener("click", () => {
  modalCliente.classList.remove("hidden");
});

cerrarModalCliente.addEventListener("click", () => {
  modalCliente.classList.add("hidden");
});

// Mostrar/ocultar campos NIT y correo
checkboxFactura.addEventListener("change", () => {
  if (checkboxFactura.checked) {
    camposFactura.classList.remove("hidden");
    document.getElementById("cliente-nit").setAttribute("required", "true");
    document.getElementById("cliente-correo").setAttribute("required", "true");
  } else {
    camposFactura.classList.add("hidden");
    document.getElementById("cliente-nit").removeAttribute("required");
    document.getElementById("cliente-correo").removeAttribute("required");
  }  
});

formNuevoCliente.addEventListener("submit", async (e) => {
  e.preventDefault();

  const requiereFactura = document.getElementById("cliente-factura").checked;

  const cliente = {
    nombre: document.getElementById("cliente-nombre").value.trim(),
    telefono: document.getElementById("cliente-telefono").value.trim(),
    direccion: document.getElementById("cliente-direccion").value.trim(),
    municipio: document.getElementById("cliente-municipio").value.trim(),
    requiereFactura,
    nit: document.getElementById("cliente-nit").value.trim(),
    correo: document.getElementById("cliente-correo").value.trim()
  };
  console.log("Cliente enviado al backend:", cliente);

  if (!cliente.nombre) {
    alert("El nombre es obligatorio.");
    return;
  }

  if (!/^\d{10}$/.test(cliente.telefono)) {
    alert('El teléfono debe tener exactamente 10 dígitos numéricos.');
    return;
  }

  // ✅ Solo validar si el checkbox está activo
  if (requiereFactura) {
    if (!/^\d{7,}$/.test(cliente.nit)) {
      alert('El NIT debe tener al menos 7 dígitos numéricos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente.correo)) {
      alert('Por favor ingresa un correo electrónico válido.');
      return;
    }
  }

  try {
    const res = await fetch("https://catalogo-backend-jkhy.onrender.com/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente)
    });

    if (res.status === 201) {
      const clienteCreado = await res.json();
      const option = document.createElement("option");
      option.value = clienteCreado.nombre;
      option.textContent = clienteCreado.nombre;
      clienteSelect.appendChild(option);
      clienteSelect.value = clienteCreado.nombre;
      modalCliente.classList.add("hidden");
      formNuevoCliente.reset();
      camposFactura.classList.add("hidden");
      alert("✅ Cliente agregado con éxito.");
    } else if (res.status === 409) {
      alert("⚠️ El cliente ya existe.");
    } else {
      alert("❌ Error al agregar el cliente.");
    }
  } catch (error) {
    console.error("Error al agregar cliente:", error);
    alert("❌ Error de red al agregar cliente.");
  }
});

let productosFiltrados = [];

const renderizarProductos = (productosParaRenderizar = productos) => {
  productContainer.innerHTML = "";
  productosFiltrados = productosParaRenderizar; // ✅ Guardar la lista activa

  if (productosParaRenderizar.length === 0) {
    const mensaje = document.createElement("div");
    mensaje.className = "mensaje-no-resultados";
    mensaje.textContent = "No se encontraron productos.";
    productContainer.appendChild(mensaje);
    return;
  }

productosParaRenderizar.forEach((producto, index) => {
  const card = document.createElement("div");
  card.classList.add("product-card");

  card.innerHTML = `
    <img src="${getImagenSrc(producto.imagen)}" alt="${producto.nombre}">
    <h3>${producto.nombre}</h3>
    <p><strong>Precio: $${producto.precio}</strong></p>
    <input type="number" min="1" value="1" id="cantidad-${index}">
    <button class="btn-carrito">Agregar al carrito 🛒</button>
  `;

  // ✅ Clic sobre tarjeta (excepto botón e input) abre modal
  card.addEventListener("click", (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
    abrirModal(producto); // pasamos el objeto producto
  });

  // ✅ Clic en botón Agregar al carrito
  const btn = card.querySelector(".btn-carrito");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const cantidad = parseInt(document.getElementById(`cantidad-${index}`).value);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      alert("Cantidad inválida.");
      return;
    }

    const productoEnCarrito = carrito.find(item => item.nombre === producto.nombre);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad += cantidad;
    } else {
      carrito.push({ ...producto, cantidad });
      alert("✅ Producto agregado con éxito.");
    }

    renderizarCarrito();
    actualizarContadorCarrito();
    document.getElementById(`cantidad-${index}`).value = 1;
  });

  productContainer.appendChild(card);
});

};

const botones = document.querySelectorAll(".btn-carrito");
  botones.forEach((btn, idx) => {
    btn.addEventListener("click", (e) => {
    e.stopPropagation(); // evitar que se abra el modal
    const producto = productosParaRenderizar[idx];
    agregarAlCarritoDesdeProducto(producto);
    document.getElementById(`cantidad-${idx}`).value = 1;
  });
});

function agregarAlCarritoDesdeProducto(producto) {
  const input = document.querySelector(`#cantidad-${productos.findIndex(p => p.nombre === producto.nombre)}`);
  const cantidad = parseInt(input?.value) || 1;

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    alert("Cantidad inválida.");
    return;
  }

  const productoEnCarrito = carrito.find(item => item.nombre === producto.nombre);
  if (productoEnCarrito) {
    productoEnCarrito.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
    alert("✅ Producto agregado con éxito.");
  }

  renderizarCarrito();
  actualizarContadorCarrito();
}


window.agregarAlCarrito = (index) => {
  const cantidad = parseInt(document.getElementById(`cantidad-${index}`).value);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    alert("Cantidad inválida.");
    return;
  }

  const producto = productosFiltrados[index]; // ✅ obtener desde productosFiltrados
  const productoEnCarrito = carrito.find(item => item.nombre === producto.nombre);

  if (productoEnCarrito) {
    productoEnCarrito.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
    alert("✅ Producto agregado con éxito.");
  }

  renderizarCarrito();
  actualizarContadorCarrito();
  document.getElementById(`cantidad-${index}`).value = 1;
};


  const renderizarCarrito = () => {
    listaCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((item, i) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${item.nombre}</strong><br/>
        Cantidad: 
        <input type="number" min="1" value="${item.cantidad}" class="input-cantidad" data-index="${i}">
        <br/>- Precio unitario: $${item.precio}<br/> - Subtotal: $${subtotal}<br/>
        <button onclick="eliminarDelCarrito('${item.nombre}')">Eliminar</button>
      `;
      listaCarrito.appendChild(li);
    });

    if (carrito.length > 0) {
      const totalLi = document.createElement("li");
      totalLi.innerHTML = `<strong>Total del pedido: $${total}</strong>`;
      listaCarrito.appendChild(totalLi);
    }

    document.querySelectorAll('.input-cantidad').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        const nuevaCantidad = parseInt(e.target.value);
        if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
          alert("Cantidad inválida. Debe ser un número entero positivo.");
          renderizarCarrito();
          return;
        }
        carrito[index].cantidad = nuevaCantidad;
        actualizarContadorCarrito();
        renderizarCarrito();
      });
    });
  };

  window.eliminarDelCarrito = (nombre) => {
    carrito = carrito.filter(item => item.nombre !== nombre);
    renderizarCarrito();
    actualizarContadorCarrito();
  };

  const actualizarContadorCarrito = () => {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    contadorCarrito.textContent = totalItems;
  };

  const mostrarCarrito = () => carritoPanel.classList.toggle("hidden");
  const cerrarCarrito = () => carritoPanel.classList.add("hidden");

  finalizarPedido.addEventListener("click", async () => {
    const nombreCliente = clienteSelect.value;
  
    if (!nombreCliente) {
      alert("Selecciona un cliente.");
      return;
    }
  
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }
  
    try {
      // 1️⃣ Obtener datos del cliente desde el backend
      const clienteRes = await fetch(`https://catalogo-backend-jkhy.onrender.com/api/clientes/nombre/${encodeURIComponent(nombreCliente)}`);
      const clienteDatos = await clienteRes.json();
  
      if (!clienteDatos || !clienteDatos.nombre) {
        alert("❌ No se encontró el cliente en la base de datos.");
        return;
      }
  
      /// 2️⃣ Crear el pedido
      const productosConSubtotal = carrito.map(p => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio
      }));

      const total = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

      const pedido = {
        cliente: nombreCliente,
        productos: productosConSubtotal,
        total
      };
  
      // 3️⃣ Guardar el pedido en el backend
      const res = await fetch('https://catalogo-backend-jkhy.onrender.com/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
  
      if (res.ok) {
        alert("✅ Pedido guardado correctamente.");

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });

  
        // 4️⃣ Crear mensaje de WhatsApp con info del cliente
        let mensaje = `📅 *Fecha del pedido:* ${fecha} - ${hora}\n\n`;
            mensaje += `👤 *Cliente:* ${clienteDatos.nombre}\n`;
            mensaje += `📞 *Teléfono:* ${clienteDatos.telefono}\n`;
            mensaje += `🏠 *Dirección:* ${clienteDatos.direccion}, ${clienteDatos.municipio}\n`;
            mensaje += `🧾 *Factura electrónica:* ${clienteDatos.requiereFactura ? "Sí" : "No"}\n`;

            if (clienteDatos.requiereFactura) {
              mensaje += `🔢 *NIT:* ${clienteDatos.nit}\n`;
              mensaje += `📧 *Correo:* ${clienteDatos.correo}\n`;
            }

            mensaje += `\n🛒 *Productos solicitados:*\n`;

let total = 0;
carrito.forEach(p => {
  const subtotal = p.precio * p.cantidad;
  total += subtotal;
  mensaje += `• ${p.nombre} x${p.cantidad} - $${p.precio} = $${subtotal}\n`;
});

mensaje += `\n💰 *Total:* $${total}`;


  
        // 5️⃣ Redirigir a WhatsApp
        const enlace = `https://wa.me/573213947878?text=${encodeURIComponent(mensaje)}`;
        window.open(enlace, "_blank");
  
        // 6️⃣ Limpiar estado
        carrito = [];
        renderizarCarrito();
        actualizarContadorCarrito();
        cargarHistorial(nombreCliente);
      } else {
        alert("❌ Error al guardar el pedido.");
      }
  
    } catch (error) {
      console.error('❌ Error al enviar el pedido:', error);
    }
  });
  

  historialBtn.addEventListener("click", () => {
    const cliente = clienteSelect.value;
    if (!cliente) {
      alert("Selecciona un cliente para ver su historial.");
      return;
    }
    historialContenedor.classList.toggle("hidden");
    cargarHistorial(cliente);
  });
  

  clienteSelect.addEventListener("change", () => {
    if (!historialContenedor.classList.contains("hidden")) {
      cargarHistorial(clienteSelect.value);
    }
  });

  async function cargarHistorial(cliente) {
    try {
      const res = await fetch(`https://catalogo-backend-jkhy.onrender.com/api/pedidos/${cliente}`);
      const pedidos = await res.json();
  
      if (pedidos.length === 0) {
        historialContenedor.innerHTML = "<p>Este cliente no tiene historial de pedidos.</p>";
      } else {
        let html = `<h3>Historial de ${cliente}</h3>`;
        pedidos.slice(-3).reverse().forEach((pedido, index) => {
          html += `
            <div class="pedido">
              <strong>Pedido ${index + 1} - ${new Date(pedido.fecha).toLocaleString()}</strong>
              <ul>
                ${pedido.productos.map(p => {
                  const subtotal = p.precio * p.cantidad;
                  return `<li>${p.nombre} (x${p.cantidad}) - $${p.precio} → Subtotal: $${subtotal.toFixed(0)}</li>`;
                }).join("")}
              </ul>
              <p><strong>Total del pedido:</strong> $${pedido.total?.toFixed(2) ?? "No disponible"}</p>
            </div>
          `;
        });
        historialContenedor.innerHTML = html;
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  }
  
  

  carritoIcono.addEventListener("click", mostrarCarrito);
  document.getElementById("cerrar-carrito").addEventListener("click", cerrarCarrito);
  cerrarModal.addEventListener("click", () => modal.classList.add("hidden"));

  const obtenerRutaImagen = (imagen) => {
    // Si ya es una URL completa (http o https), no la tocamos
    if (imagen.startsWith('http')) {
      return imagen;
    }
    // En caso contrario, asumimos que está en la carpeta "images" del backend
    return `https://catalogo-backend-jkhy.onrender.com/images/${imagen}`;
  };
  
  const abrirModal = (producto) => {
    productoActualIndex = producto;
    document.getElementById("modal-img").src = obtenerRutaImagen(producto.imagen);
    document.getElementById("modal-titulo").textContent = producto.nombre;
    document.getElementById("modal-desc").textContent = producto.descripcion;
    document.getElementById("modal-precio").textContent = `Precio: $${producto.precio}`;
    cantidadInput.value = 1;
    modal.classList.remove("hidden");
  };
  
  

  document.getElementById("modal-btn-carrito").addEventListener("click", () => {
    const cantidad = Number(cantidadInput.value);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      alert("Por favor, ingresa una cantidad válida (número entero positivo).");
      return;
    }
    const producto = productoActualIndex;
    const productoEnCarrito = carrito.find(item => item.nombre === producto.nombre);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad += cantidad;
    } else {
      carrito.push({ ...producto, cantidad });
      alert("✅ Producto agregado con exito.");
    }
    renderizarCarrito();
    actualizarContadorCarrito();
    modal.classList.add("hidden");
  });
  

  const buscarProductos = () => {
    const termino = document.getElementById("search").value.toLowerCase();
    const filtrados = productos.filter(producto =>
      producto.nombre?.toLowerCase().includes(termino)
    );
    renderizarProductos(filtrados);
  };

  document.getElementById("search").addEventListener("input", buscarProductos);

  async function cargarProductosDesdeBackend() {
    try {
      const res = await fetch('https://catalogo-backend-jkhy.onrender.com/api/productos');
      productos = await res.json();
      renderizarProductos();
    } catch (error) {
      console.error('Error al cargar productos desde el backend:', error);
    }
  }
  async function cargarClientesDesdeBackend() {
    try {
      const res = await fetch("https://catalogo-backend-jkhy.onrender.com/api/clientes");
      const clientes = await res.json();
  
      clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.nombre;
        option.textContent = cliente.nombre;
        clienteSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar clientes desde el backend:", error);
    }
  }
  cargarProductosDesdeBackend();
  cargarClientesDesdeBackend();
});