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
  document.getElementById("search").classList.add("ocultar"); // ✅ Ocultar input
});

cerrarModalCliente.addEventListener("click", () => {
  modalCliente.classList.add("hidden");
  document.getElementById("search").classList.remove("ocultar"); // ✅ Mostrar input
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
    Swal.fire("El nombre es obligatorio.", "", "warning");
    return;
  }

  if (!/^\d{10}$/.test(cliente.telefono)) {
    Swal.fire('El teléfono debe tener exactamente 10 dígitos numéricos.', "", "warning");
    return;
  }

  // ✅ Solo validar si el checkbox está activo
  if (requiereFactura) {
    if (!/^\d{7,}$/.test(cliente.nit)) {
      Swal.fire('El NIT debe tener al menos 7 dígitos numéricos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cliente.correo)) {
      Swal.fire('Por favor ingresa un correo electrónico válido.', "", "warning");
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
      Swal.fire("✅ Cliente agregado con éxito.", "", "success");
    } else if (res.status === 409) {
      Swal.fire("⚠️ El cliente ya existe.", "", "warning");
    } else {
      Swal.fire("❌ Error al agregar el cliente.");
    }
  } catch (error) {
    console.error("Error al agregar cliente:", error);
    Swal.fire("❌ Error de red al agregar cliente.", "", "error");
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

  let checkTallas = '';
    if (/guante/i.test(producto.nombre) && !/guantes manipul/i.test(producto.nombre)) {
      checkTallas = `
        <div id="tallas-${index}">
          <label><input type="radio" name="talla-${index}" value="S"> S</label>
          <label><input type="radio" name="talla-${index}" value="M"> M</label>
          <label><input type="radio" name="talla-${index}" value="L"> L</label>
          <label><input type="radio" name="talla-${index}" value="XL">  XL</label>
        </div>
      `;
    }
  let checkColores = '';
    if (/bolsa plastica manija/i.test(producto.nombre)) {
      checkColores = `
        <div id="colores-${index}">
          <label><input type="radio" name="color-${index}" value="Negro"> Negro</label>
          <label><input type="radio" name="color-${index}" value="Blanco"> Blanco</label>
          <label><input type="radio" name="color-${index}" value="Beige"> Beige</label>
        </div>
      `;
    }
  let checkMedidas = '';
    if (/kilo bolsa basura/i.test(producto.nombre)) {
      checkMedidas = `
        <div id="medidas-${index}">
          <label><input type="radio" name="medida-${index}" value="22"> 22</label>
          <label><input type="radio" name="medida-${index}" value="24"> 24</label>
          <label><input type="radio" name="medida-${index}" value="26"> 26</label>
          <label><input type="radio" name="medida-${index}" value="28"> 28</label>
          <label><input type="radio" name="medida-${index}" value="32"> 32</label>
          <label><input type="radio" name="medida-${index}" value="39"> 39</label>
        </div>
      `;
    }



card.innerHTML = `
  <img src="${getImagenSrc(producto.imagen)}" alt="${producto.nombre}">
  <h3>${producto.nombre}</h3>
  <p><strong>Precio: $${producto.precio}</strong></p>
  <input type="number" min="0.1" step="0.1" value="1" id="cantidad-${index}">
  ${checkTallas}
  ${checkColores}
  ${checkMedidas}
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

  const cantidad = parseFloat(document.getElementById(`cantidad-${index}`).value);
  if (isNaN(cantidad) || cantidad <= 0) {
    Swal.fire("Cantidad inválida.", "", "warning");
    return;
  }

  let talla = null;
  if (/guantes/i.test(producto.nombre) && !/guantes manipul/i.test(producto.nombre)) {
    const radios = document.getElementsByName(`talla-${index}`);
    for (let r of radios) {
      if (r.checked) {
        talla = r.value;
        break;
      }
    }
    if (!talla) {
      Swal.fire("Selecciona una talla antes de agregar al carrito.", "", "warning");
      return;
    }
  }

  let color = null;
    if (/bolsa plastica manija/i.test(producto.nombre)) {
      const radios = document.getElementsByName(`color-${index}`);
      for (let r of radios) {
        if (r.checked) {
          color = r.value;
          break;
        }
      }
      if (!color) {
        Swal.fire("Selecciona un color antes de agregar al carrito.", "", "warning");
        return;
      }
    }

  let medida = null;
    if (/kilo bolsa basura/i.test(producto.nombre)) {
      const radios = document.getElementsByName(`medida-${index}`);
      for (let r of radios) {
        if (r.checked) {
          medida = r.value;
          break;
        }
      }
      if (!medida) {
        Swal.fire("Selecciona una medida antes de agregar al carrito.", "", "warning");
        return;
      }
    }


  const productoEnCarrito = carrito.find(item =>
    item.nombre === producto.nombre &&
    (item.talla ?? null) === (talla ?? null) &&
    (item.color ?? null) === (color ?? null) &&
    (item.medida ?? null) === (medida ?? null)
  );


  if (productoEnCarrito) {
    productoEnCarrito.cantidad += cantidad;
  } else {
    carrito.push({
  ...producto,
      cantidad,
      talla: talla ?? null,
      color: color ?? null,
      medida: medida ?? null
    });
    Swal.fire("✅ Producto agregado con éxito.", "", "success");
  }

  renderizarCarrito();
  actualizarContadorCarrito();
  document.getElementById(`cantidad-${index}`).value = 1;
});


  productContainer.appendChild(card);
});
};

function agregarAlCarritoDesdeProducto(producto) {
  const input = document.querySelector(`#cantidad-${productos.findIndex(p => p.nombre === producto.nombre)}`);
  const cantidad = parseFloat(input?.value) || 1;

  if (isNaN(cantidad) || cantidad <= 0) {
    Swal.fire("Cantidad inválida.", "", "warning");
    return;
  }

  const productoEnCarrito = carrito.find(item => item.nombre === producto.nombre);
  if (productoEnCarrito) {
    productoEnCarrito.cantidad += cantidad;
  } else {
    carrito.push({
      ...producto,
      cantidad,
      talla: talla ?? null,
      color: color ?? null,
      medida: medida ?? null
    });
    Swal.fire("✅ Producto agregado con éxito.", "", "success");
  }

  renderizarCarrito();
  actualizarContadorCarrito();
}


window.agregarAlCarrito = (index) => {
  const cantidad = parseFloat(document.getElementById(`cantidad-${index}`).value);
  const producto = productosFiltrados[index];
  let talla = null;

  if (isNaN(cantidad) || cantidad <= 0) {
    Swal.fire("Cantidad inválida.", "", "warning");
    return;
  }

  if (/guantes/i.test(producto.nombre) && !/guantes manipul/i.test(producto.nombre)) {
    const radios = document.getElementsByName(`talla-${index}`);
    for (let r of radios) {
      if (r.checked) {
        talla = r.value;
        break;
      }
    }

    if (!talla) {
      Swal.fire("Selecciona una talla antes de agregar al carrito.", "", "warning");
      return;
    }
  }

  let productoEnCarrito;

    if (talla || color) {
      productoEnCarrito = carrito.find(item => item.nombre === producto.nombre && item.talla === talla && item.color === color);
    } else {
      productoEnCarrito = carrito.find(item => item.nombre === producto.nombre && !item.talla && !item.color);
    }

    if (productoEnCarrito) {
      productoEnCarrito.cantidad += cantidad;
    } else {
      carrito.push({
        ...producto,
        cantidad,
        talla: talla ?? null,
        color: color ?? null,
        medida: medida ?? null
      });
      Swal.fire("✅ Producto agregado con éxito.", "", "success");
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
        ${item.talla ? `<br/>Talla: ${item.talla}` : ''}
        ${item.color ? `<br/>Color: ${item.color}` : ''}
        ${item.medida ? `<br/>Medida: ${item.medida}` : ''}<br/>
        Cantidad: 
        <input type="number" min="0.1" step="0.1" value="${item.cantidad}" class="input-cantidad" data-index="${i}">
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
        const index = parseFloat(e.target.getAttribute('data-index'));
        const nuevaCantidad = parseFloat(e.target.value);
        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
          Swal.fire("Cantidad inválida. Debe ser un número positivo.", "", "warning");
          renderizarCarrito();
          return;
        }
        carrito[index].cantidad = nuevaCantidad;
        actualizarContadorCarrito();
        renderizarCarrito();
      });
    });

    window.repetirPedido = (productosJSON) => {
      const productos = JSON.parse(productosJSON);
      productos.forEach(p => {
        const productoEnCarrito = carrito.find(item =>
          item.nombre === p.nombre &&
          (item.talla ?? null) === (p.talla ?? null) &&
          (item.color ?? null) === (p.color ?? null) &&
          (item.medida ?? null) === (p.medida ?? null)
        );

        if (productoEnCarrito) {
          productoEnCarrito.cantidad += p.cantidad;
        } else {
          carrito.push({ ...p,
            talla: p.talla ?? null,
            color: p.color ?? null,
            medida: p.medida ?? null });
        }
      });

      renderizarCarrito();
      actualizarContadorCarrito();
      Swal.fire("✅ Pedido agregado al carrito.", "", "success");
    };
  };

  function repetirPedido(productos) {
  productos.forEach(p => {
    const productoEnCarrito = carrito.find(item =>
      item.nombre === p.nombre &&
      (item.talla ?? null) === (p.talla ?? null) &&
      (item.color ?? null) === (p.color ?? null) &&
      (item.medida ?? null) === (p.medida ?? null)
    );

    if (productoEnCarrito) {
      productoEnCarrito.cantidad += p.cantidad;
    } else {
      carrito.push({
        ...p,
        talla: p.talla ?? null,
        color: p.color ?? null,
        medida: p.medida ?? null
      });
    }
  });

  renderizarCarrito();
  actualizarContadorCarrito();
  Swal.fire("✅ Pedido agregado al carrito.", "", "success");
}

  window.eliminarDelCarrito = (nombre) => {
    carrito = carrito.filter(item => item.nombre !== nombre);
    renderizarCarrito();
    actualizarContadorCarrito();
  };

  const actualizarContadorCarrito = () => {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    contadorCarrito.textContent = totalItems;
  };

  const mostrarCarrito = () => {
    carritoPanel.classList.toggle("hidden");
    if (!carritoPanel.classList.contains("hidden")) {
      document.getElementById("search").classList.add("ocultar"); // ✅ Ocultar al abrir
    } else {
      document.getElementById("search").classList.remove("ocultar"); // ✅ Mostrar al cerrar
    }
  };
  const cerrarCarrito = () => {
    carritoPanel.classList.add("hidden");
    document.getElementById("search").classList.remove("ocultar"); // ✅ Mostrar
  };

  finalizarPedido.addEventListener("click", async () => {
    const nombreCliente = clienteSelect.value;
  
    if (!nombreCliente) {
      Swal.fire("Selecciona un cliente.", "", "warning");
      return;
    }
  
    if (carrito.length === 0) {
      Swal.fire("El carrito está vacío.", "", "warning");
      return;
    }
  
    try {
      // 1️⃣ Obtener datos del cliente desde el backend
      const clienteRes = await fetch(`https://catalogo-backend-jkhy.onrender.com/api/clientes/nombre/${encodeURIComponent(nombreCliente)}`);
      const clienteDatos = await clienteRes.json();
  
      if (!clienteDatos || !clienteDatos.nombre) {
        Swal.fire("❌ No se encontró el cliente en la base de datos.", "", "error");
        return;
      }
  
      /// 2️⃣ Crear el pedido
      const productosConSubtotal = carrito.map(p => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio,
        talla: p.talla ?? null,
        color: p.color ?? null,
        medida: p.medida ?? null
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
        Swal.fire("✅ Pedido guardado correctamente.", "", "success");

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
  const tallaTexto = p.talla ? ` - Talla: ${p.talla}` : '';
  const colorTexto = p.color ? ` - Color: ${p.color}` : '';
  const medidaTexto = p.medida ? ` - Medida: ${p.medida}` : '';
  mensaje += `• ${p.cantidad} - ${p.nombre}${tallaTexto}${colorTexto}${medidaTexto} - $${p.precio} = $${subtotal}\n`;

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
        Swal.fire("❌ Error al guardar el pedido.", "", "error");
      }
  
    } catch (error) {
      console.error('❌ Error al enviar el pedido:', error);
    }
  });
  

  historialBtn.addEventListener("click", () => {
    const cliente = clienteSelect.value;
    if (!cliente) {
      Swal.fire("Selecciona un cliente para ver su historial.", "", "warning");
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
                const tallaTexto = p.talla ? ` - Talla: ${p.talla}` : '';
                const colorTexto = p.color ? ` - Color: ${p.color}` : '';
                const medidaTexto = p.medida ? ` - Medida: ${p.medida}` : '';
                return `<li>${p.nombre}${tallaTexto}${colorTexto}${medidaTexto} (x${p.cantidad}) - $${p.precio} → Subtotal: $${subtotal.toFixed(0)}</li>`;
              }).join("")}
              </ul>
              <p><strong>Total del pedido:</strong> $${pedido.total?.toFixed(2) ?? "No disponible"}</p>
              <button class="btn-repetir-pedido" data-productos='${JSON.stringify(pedido.productos)}'>
                🔁 Repetir este pedido
              </button>
            </div>
          `;

        });
        historialContenedor.innerHTML = html;
          document.querySelectorAll(".btn-repetir-pedido").forEach(boton => {
          boton.addEventListener("click", () => {
            const productos = JSON.parse(boton.getAttribute("data-productos"));
            repetirPedido(productos);
          });
        });
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  }
  
  

  carritoIcono.addEventListener("click", mostrarCarrito);
  document.getElementById("cerrar-carrito").addEventListener("click", cerrarCarrito);
  cerrarModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    document.getElementById("search").classList.remove("ocultar"); // ✅ Mostrar input al cerrar modal
  });


  const obtenerRutaImagen = (imagen) => {
    // Si ya es una URL completa (http o https), no la tocamos
    if (imagen.startsWith('http')) {
      return imagen;
    }
    // En caso contrario, asumimos que está en la carpeta "images" del backend
    return `https://catalogo-backend-jkhy.onrender.com/images/${imagen}`;
  };
  
  const abrirModal = (producto) => {
    productoActualIndex = productos.findIndex(p => p.nombre === producto.nombre);
    document.getElementById("modal-img").src = obtenerRutaImagen(producto.imagen);
    document.getElementById("modal-titulo").textContent = producto.nombre;
    document.getElementById("modal-desc").textContent = producto.descripcion;
    document.getElementById("modal-precio").textContent = `Precio: $${producto.precio}`;
    // Insertar checkboxes de talla si el producto es guante (excepto "GUANTES MANIPUL")
    const tallasContainer = document.getElementById("modal-tallas");
    if (/guantes/i.test(producto.nombre) && !/guantes manipul/i.test(producto.nombre)) {
      tallasContainer.innerHTML = `
        <label><input type="radio" name="modal-talla" value="S"> S</label>
        <label><input type="radio" name="modal-talla" value="M"> M</label>
        <label><input type="radio" name="modal-talla" value="L"> L</label>
        <label><input type="radio" name="modal-talla" value="XL"> XL</label>
      `;
      tallasContainer.classList.remove("hidden");
    } else {
      tallasContainer.innerHTML = "";
      tallasContainer.classList.add("hidden");
    }
    const coloresContainer = document.getElementById("modal-colores");
    if (/bolsa plastica manija/i.test(producto.nombre)) {
      coloresContainer.innerHTML = `
        <label><input type="radio" name="modal-color" value="Negro"> Negro</label>
        <label><input type="radio" name="modal-color" value="Blanco"> Blanco</label>
        <label><input type="radio" name="modal-color" value="Beige"> Beige</label>
      `;
      coloresContainer.classList.remove("hidden");
    } else {
      coloresContainer.innerHTML = "";
      coloresContainer.classList.add("hidden");
    }
    const medidasContainer = document.getElementById("modal-medidas");
    if (/kilo bolsa basura/i.test(producto.nombre)) {
      medidasContainer.innerHTML = `
        <label><input type="radio" name="modal-medida" value="22"> 22</label>
        <label><input type="radio" name="modal-medida" value="24"> 24</label>
        <label><input type="radio" name="modal-medida" value="26"> 26</label>
        <label><input type="radio" name="modal-medida" value="28"> 28</label>
        <label><input type="radio" name="modal-medida" value="32"> 32</label>
        <label><input type="radio" name="modal-medida" value="39"> 39</label>
      `;
      medidasContainer.classList.remove("hidden");
    } else {
      medidasContainer.innerHTML = "";
      medidasContainer.classList.add("hidden");
    }


    cantidadInput.value = 1;
    modal.classList.remove("hidden");
    // Ocultar el input de búsqueda
    document.getElementById("search").classList.add("ocultar");
  };
  
  

  document.getElementById("modal-btn-carrito").addEventListener("click", () => {
  const cantidad = parseFloat(cantidadInput.value);
  if (isNaN(cantidad) || cantidad <= 0) {
    Swal.fire("Por favor, ingresa una cantidad válida (número positivo).", "", "warning");
    return;
  }

  const producto = productos[productoActualIndex];
  let talla = null;
  let color = null;

  if (/guantes/i.test(producto.nombre) && !/guantes manipul/i.test(producto.nombre)) {
    const radios = document.getElementsByName("modal-talla");
    for (let r of radios) {
      if (r.checked) {
        talla = r.value;
        break;
      }
    }
    if (!talla) {
      Swal.fire("Selecciona una talla antes de agregar al carrito.", "", "warning");
      return;
    }
  }

  if (/bolsa plastica manija/i.test(producto.nombre)) {
    const radios = document.getElementsByName("modal-color");
    for (let r of radios) {
      if (r.checked) {
        color = r.value;
        break;
      }
    }
    if (!color) {
      Swal.fire("Selecciona un color antes de agregar al carrito.", "", "warning");
      return;
    }
  }

  let medida = null;
    if (/kilo bolsa basura/i.test(producto.nombre)) {
      const radios = document.getElementsByName("modal-medida");
      for (let r of radios) {
        if (r.checked) {
          medida = r.value;
          break;
        }
      }
      if (!medida) {
        Swal.fire("Selecciona una medida antes de agregar al carrito.", "", "warning");
        return;
      }
    }


  let productoEnCarrito = carrito.find(item =>
    item.nombre === producto.nombre &&
    (item.talla ?? null) === (talla ?? null) &&
    (item.color ?? null) === (color ?? null) &&
    (item.medida ?? null) === (medida ?? null)
  );

  if (productoEnCarrito) {
    productoEnCarrito.cantidad += cantidad;
  } else {
    carrito.push({
      ...producto,
      cantidad,
      talla: talla ?? null,
      color: color ?? null,
      medida: medida ?? null
    });
    Swal.fire("✅ Producto agregado con éxito.", "", "success");
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
  
      const datalist = document.getElementById("clientes");
      clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.nombre;
        datalist.appendChild(option);
      });
    } catch (error) {
      console.error("Error al cargar clientes desde el backend:", error);
    }
  }
  cargarProductosDesdeBackend();
  cargarClientesDesdeBackend();
});
document.getElementById("search").classList.remove("ocultar");



