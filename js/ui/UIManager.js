// Gestor de UI - maneja manipulación de DOM y renderizado
import { productManager } from '../services/ProductManager.js';
import { cart } from '../services/CartManager.js';
import { invoiceManager } from '../services/InvoiceManager.js';
import { inventoryManager } from '../services/InventoryManager.js';

class UIManager {
  constructor() {
    this.currentView = 'products';
    this.cartToggle = document.getElementById('cart-toggle');
    this.cartPanel = document.getElementById('cart-panel');
    this.closeCartBtn = document.getElementById('close-cart');
    this.productsContainer = document.getElementById('products-container');
    this.cartItemsContainer = document.getElementById('cart-items');
    this.cartTotal = document.getElementById('cart-total');
    this.cartBadge = document.getElementById('cart-badge');
    this.searchInput = document.getElementById('search-input');
    this.categoryFilter = document.getElementById('category-filter');

    // Elementos del checkout y factura
    this.checkoutBtn = document.getElementById('checkout-btn');
    this.checkoutModal = document.getElementById('checkout-modal');
    this.closeCheckoutModalBtn = document.getElementById('close-checkout-modal');
    this.cancelCheckoutBtn = document.getElementById('cancel-checkout');
    this.checkoutForm = document.getElementById('checkout-form');
    this.invoiceModal = document.getElementById('invoice-modal');
    this.closeInvoiceModalBtn = document.getElementById('close-invoice-modal');
    this.invoiceContent = document.getElementById('invoice-content');
    this.printInvoiceBtn = document.getElementById('print-invoice');
    this.continueShoppingBtn = document.getElementById('continue-shopping');

    this.setupEventListeners();
    this.updateCartBadge();
  }

  // Configurar escuchadores de eventos
  setupEventListeners() {
    // Alternar carrito
    if (this.cartToggle) {
      this.cartToggle.addEventListener('click', () => this.toggleCart());
    }
    
    if (this.closeCartBtn) {
      this.closeCartBtn.addEventListener('click', () => this.closeCart());
    }

    // Buscar
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Filtro de categoría
    if (this.categoryFilter) {
      this.categoryFilter.addEventListener('change', (e) => {
        this.handleCategoryFilter(e.target.value);
      });
    }

    // Cerrar carrito al hacer clic afuera
    if (this.cartPanel) {
      document.addEventListener('click', (e) => {
        if (!this.cartPanel.contains(e.target) && !this.cartToggle.contains(e.target)) {
          this.closeCart();
        }
      });
    }

    // Checkout
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => this.handleCheckout());
    }

    // Modal de checkout
    if (this.closeCheckoutModalBtn) {
      this.closeCheckoutModalBtn.addEventListener('click', () => this.closeCheckoutModal());
    }

    if (this.cancelCheckoutBtn) {
      this.cancelCheckoutBtn.addEventListener('click', () => this.closeCheckoutModal());
    }

    if (this.checkoutForm) {
      this.checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
    }

    // Modal de factura
    if (this.closeInvoiceModalBtn) {
      this.closeInvoiceModalBtn.addEventListener('click', () => this.closeInvoiceModal());
    }

    if (this.printInvoiceBtn) {
      this.printInvoiceBtn.addEventListener('click', () => this.printInvoice());
    }

    if (this.continueShoppingBtn) {
      this.continueShoppingBtn.addEventListener('click', () => this.handleContinueShopping());
    }

    // Cerrar modales al hacer clic fuera
    if (this.checkoutModal) {
      this.checkoutModal.addEventListener('click', (e) => {
        if (e.target === this.checkoutModal) {
          this.closeCheckoutModal();
        }
      });
    }

    if (this.invoiceModal) {
      this.invoiceModal.addEventListener('click', (e) => {
        if (e.target === this.invoiceModal) {
          this.closeInvoiceModal();
        }
      });
    }
  }

  // Renderizar productos
  renderProducts(productsToRender) {
    this.productsContainer.innerHTML = '';

    if (productsToRender.length === 0) {
      this.productsContainer.innerHTML = '<p class="no-products">Productos no encontrados</p>';
      return;
    }

    productsToRender.forEach(product => {
      const stock = inventoryManager.getStock(product.id);
      const isInStock = stock > 0;
      const isLowStock = stock > 0 && stock <= 5;

      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
          ${!isInStock ? '<span class="out-of-stock">Agotado</span>' : ''}
          ${isLowStock ? `<span class="low-stock">Solo ${stock} disponibles</span>` : ''}
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="description">${product.description}</p>
          <div class="rating">
            <span class="stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 ? '½' : ''}</span>
            <span class="rating-value">${product.rating}</span>
          </div>
          <div class="product-footer">
            <span class="price">$${product.price.toFixed(2)}</span>
            <button
              class="add-to-cart-btn"
              data-id="${product.id}"
              ${!isInStock ? 'disabled' : ''}
            >
              ${isInStock ? 'Agregar al carrito' : 'No disponible'}
            </button>
          </div>
          ${isInStock && stock <= 10 ? `<p class="stock-info">Stock disponible: ${stock} unidades</p>` : ''}
        </div>
      `;

      const addBtn = productCard.querySelector('.add-to-cart-btn');
      if (isInStock) {
        addBtn.addEventListener('click', () => this.handleAddToCart(product.id));
      }

      this.productsContainer.appendChild(productCard);
    });
  }

  // Manejar agregar al carrito
  handleAddToCart(productId) {
    const result = cart.addItem(productId, 1);

    if (result.success) {
      this.updateCartBadge();
      this.renderCartItems();
      this.showNotification('✅ ¡Producto agregado al carrito!');
      // Re-renderizar productos para actualizar el stock visible
      const currentProducts = productManager.getAllProducts();
      this.renderProducts(currentProducts);
    } else {
      this.showNotification(`⚠️ ${result.message}`);
    }
  }

  // Renderizar artículos del carrito
  renderCartItems() {
    const cartItems = cart.getItems();
    this.cartItemsContainer.innerHTML = '';

    if (cartItems.length === 0) {
      this.cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
      this.cartTotal.textContent = '$0.00';
      return;
    }

    cartItems.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="cart-item-info">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h4 title="${item.name}">${item.name}</h4>
            <p>$${item.price.toFixed(2)}</p>
          </div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button class="qty-btn minus" data-id="${item.id}" title="Disminuir cantidad">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" data-id="${item.id}" min="1" max="99">
            <button class="qty-btn plus" data-id="${item.id}" title="Aumentar cantidad">+</button>
          </div>
          <div class="cart-item-total">
            <span class="subtotal-label">Subtotal:</span>
            <span class="subtotal-price" data-id="${item.id}">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <button class="remove-btn" data-id="${item.id}" title="Eliminar del carrito">🗑️ Eliminar</button>
        </div>
      `;

      // Controles de cantidad
      const minusBtn = cartItem.querySelector('.minus');
      const plusBtn = cartItem.querySelector('.plus');
      const qtyInput = cartItem.querySelector('.qty-input');
      const removeBtn = cartItem.querySelector('.remove-btn');

      minusBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevenir propagación del evento al panel del carrito
        const currentItem = cart.getItems().find(i => i.id === item.id);
        if (!currentItem) return;
        const newQty = Math.max(1, currentItem.quantity - 1);
        const result = cart.updateQuantity(item.id, newQty);

        if (result.success) {
          this.updateCartItemQuantity(item.id, newQty);
          this.updateCartBadge();
        } else {
          this.showNotification(`⚠️ ${result.message}`);
        }
      });

      plusBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevenir propagación del evento al panel del carrito
        const currentItem = cart.getItems().find(i => i.id === item.id);
        if (!currentItem) return;
        const newQty = currentItem.quantity + 1;
        const result = cart.updateQuantity(item.id, newQty);

        if (result.success) {
          this.updateCartItemQuantity(item.id, newQty);
          this.updateCartBadge();
        } else {
          this.showNotification(`⚠️ ${result.message}`);
          // Restaurar el valor anterior en el input
          qtyInput.value = currentItem.quantity;
        }
      });

      qtyInput.addEventListener('change', (e) => {
        e.stopPropagation(); // Prevenir propagación del evento al panel del carrito
        const currentItem = cart.getItems().find(i => i.id === item.id);
        if (!currentItem) return;

        let newQty = parseInt(qtyInput.value);

        // Validar que sea un número entero positivo
        if (isNaN(newQty) || newQty < 1) {
          newQty = 1;
          qtyInput.value = 1;
        }

        const result = cart.updateQuantity(item.id, newQty);

        if (result.success) {
          this.updateCartItemQuantity(item.id, newQty);
          this.updateCartBadge();
        } else {
          this.showNotification(`⚠️ ${result.message}`);
          // Restaurar el valor anterior en el input
          qtyInput.value = currentItem.quantity;
        }
      });

      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevenir propagación del evento al panel del carrito
        cart.removeItem(item.id);
        this.renderCartItems();
        this.updateCartBadge();
      });

      this.cartItemsContainer.appendChild(cartItem);
    });

    this.cartTotal.textContent = `$${cart.getTotal().toFixed(2)}`;
  }

  // Actualizar cantidad de un artículo específico sin re-renderizar todo
  updateCartItemQuantity(productId, newQuantity) {
    const cartItems = cart.getItems();
    const item = cartItems.find(i => i.id === productId);
    
    if (!item) {
      this.renderCartItems();
      return;
    }

    // Actualizar el input de cantidad
    const qtyInput = this.cartItemsContainer.querySelector(`input[data-id="${productId}"]`);
    if (qtyInput) {
      qtyInput.value = newQuantity;
    }

    // Actualizar el subtotal del item
    const subtotalPrice = this.cartItemsContainer.querySelector(`.subtotal-price[data-id="${productId}"]`);
    if (subtotalPrice) {
      subtotalPrice.textContent = `$${(item.price * newQuantity).toFixed(2)}`;
    }

    // Actualizar el total general
    this.cartTotal.textContent = `$${cart.getTotal().toFixed(2)}`;
  }

  // Actualizar insignia del carrito
  updateCartBadge() {
    const count = cart.getItemCount();
    if (this.cartBadge) {
      this.cartBadge.textContent = count;
      this.cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // Alternar panel del carrito
  toggleCart() {
    if (this.cartPanel.classList.contains('open')) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  // Abrir panel del carrito
  openCart() {
    this.cartPanel.classList.add('open');
    this.renderCartItems();
  }

  // Cerrar panel del carrito
  closeCart() {
    this.cartPanel.classList.remove('open');
  }

  // Manejar búsqueda
  handleSearch(query) {
    if (query.trim() === '') {
      this.renderProducts(productManager.getAllProducts());
    } else {
      const results = productManager.searchProducts(query);
      this.renderProducts(results);
    }
  }

  // Manejar filtro de categoría
  handleCategoryFilter(category) {
    if (category === 'all') {
      this.renderProducts(productManager.getAllProducts());
    } else {
      const filtered = productManager.getProductsByCategory(category);
      this.renderProducts(filtered);
    }
  }

  // Rellenar filtro de categoría
  populateCategoryFilter() {
    const categories = productManager.getCategories();
    const categoryFilter = document.getElementById('category-filter');
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      categoryFilter.appendChild(option);
    });
  }

  // Mostrar notificación
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // ==================== CHECKOUT Y FACTURACIÓN ====================

  // Manejar checkout (abrir modal de datos del cliente)
  handleCheckout() {
    const cartItems = cart.getItems();

    if (cartItems.length === 0) {
      this.showNotification('⚠️ El carrito está vacío');
      return;
    }

    this.openCheckoutModal();
  }

  // Abrir modal de checkout
  openCheckoutModal() {
    if (this.checkoutModal) {
      this.checkoutModal.classList.add('open');
      // Limpiar formulario
      if (this.checkoutForm) {
        this.checkoutForm.reset();
      }
    }
  }

  // Cerrar modal de checkout
  closeCheckoutModal() {
    if (this.checkoutModal) {
      this.checkoutModal.classList.remove('open');
    }
  }

  // Manejar envío del formulario de checkout
  handleCheckoutSubmit(e) {
    e.preventDefault();

    try {
      // Obtener datos del formulario
      const formData = new FormData(e.target);
      const customerData = {
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        address: formData.get('address')?.trim() || 'N/A',
      };

      // Validar nombre (no vacío, mínimo 3 caracteres, solo letras y espacios)
      if (!customerData.name || customerData.name.length < 3) {
        this.showNotification('⚠️ El nombre debe tener al menos 3 caracteres');
        return;
      }

      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(customerData.name)) {
        this.showNotification('⚠️ El nombre solo puede contener letras');
        return;
      }

      // Validar email (formato correcto)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!customerData.email || !emailRegex.test(customerData.email)) {
        this.showNotification('⚠️ Por favor ingresa un correo electrónico válido');
        return;
      }

      // Verificar que el carrito no esté vacío
      const cartItems = cart.getItems();
      if (cartItems.length === 0) {
        this.showNotification('⚠️ El carrito está vacío');
        this.closeCheckoutModal();
        return;
      }

      // Generar factura
      const invoice = invoiceManager.generateInvoice(customerData);

      // Cerrar modal de checkout
      this.closeCheckoutModal();

      // Mostrar factura
      this.showInvoice(invoice);

      // Limpiar carrito
      cart.clearCart();
      this.updateCartBadge();
      this.renderCartItems();

      // Cerrar carrito
      this.closeCart();

      // Re-renderizar productos para actualizar el stock
      const currentProducts = productManager.getAllProducts();
      this.renderProducts(currentProducts);

    } catch (error) {
      console.error('Error al generar factura:', error);
      this.showNotification(`❌ Error: ${error.message || 'No se pudo generar la factura'}`);
    }
  }

  // Mostrar factura en modal
  showInvoice(invoice) {
    if (!this.invoiceContent || !this.invoiceModal) return;

    // Formatear fecha
    const date = new Date(invoice.date);
    const formattedDate = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Generar HTML de la factura
    const invoiceHTML = `
      <div class="invoice">
        <div class="invoice-header">
          <h3>🔧 TechHub</h3>
          <p class="invoice-number">Factura #${invoice.invoiceNumber}</p>
          <p class="invoice-date">${formattedDate}</p>
        </div>

        <div class="invoice-customer">
          <h4>Datos del Cliente</h4>
          <p><strong>Nombre:</strong> ${invoice.customer.name}</p>
          <p><strong>Email:</strong> ${invoice.customer.email}</p>
          <p><strong>Dirección:</strong> ${invoice.customer.address}</p>
        </div>

        <div class="invoice-items">
          <h4>Productos Comprados</h4>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio Unitario</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">$${item.subtotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="invoice-summary">
          <div class="summary-row subtotal">
            <span>Subtotal:</span>
            <span>$${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row tax">
            <span>IVA (${(invoice.taxRate * 100).toFixed(0)}%):</span>
            <span>$${invoice.tax.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total Final:</span>
            <span>$${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="invoice-footer">
          <p>Gracias por su compra en TechHub</p>
          <p>Para cualquier consulta, contáctenos a soporte@techhub.com</p>
        </div>
      </div>
    `;

    this.invoiceContent.innerHTML = invoiceHTML;
    this.invoiceModal.classList.add('open');
  }

  // Cerrar modal de factura
  closeInvoiceModal() {
    if (this.invoiceModal) {
      this.invoiceModal.classList.remove('open');
    }
  }

  // Imprimir factura
  printInvoice() {
    if (!this.invoiceContent) return;

    const printWindow = window.open('', '_blank');
    const invoiceHTML = this.invoiceContent.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Factura - TechHub</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .invoice {
            border: 1px solid #e5e7eb;
            padding: 20px;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2563eb;
          }
          .invoice-header h3 {
            margin: 0;
            color: #2563eb;
            font-size: 24px;
          }
          .invoice-customer {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .invoice-table th,
          .invoice-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .invoice-table th {
            background: #f3f4f6;
          }
          .text-right {
            text-align: right;
          }
          .invoice-summary {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #e5e7eb;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .summary-row.total {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            padding-top: 10px;
            border-top: 2px solid #e5e7eb;
          }
          .invoice-footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${invoiceHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  // Manejar continuar comprando
  handleContinueShopping() {
    this.closeInvoiceModal();
    this.showNotification('✅ ¡Gracias por tu compra! Sigue explorando nuestros productos');
  }

  // Inicializar UI
  init() {
    this.populateCategoryFilter();
    this.renderProducts(productManager.getAllProducts());
  }
}

export const uiManager = new UIManager();
