// Servicio del carrito - maneja operaciones del carrito de compras
import { productManager } from './ProductManager.js';
import { inventoryManager } from './InventoryManager.js';

class ShoppingCart {
  constructor() {
    this.items = this.loadFromLocalStorage();
  }

  /**
   * Agregar artículo al carrito con validación de stock
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad a agregar
   * @returns {Object} {success: boolean, message: string, availableStock: number}
   */
  addItem(productId, quantity = 1) {
    const product = productManager.getProductById(productId);
    if (!product) {
      return { success: false, message: 'Producto no encontrado', availableStock: 0 };
    }

    const existingItem = this.items.find(item => item.id === productId);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentCartQuantity + quantity;

    // Validar stock disponible
    const availableStock = inventoryManager.getStock(productId);

    if (!inventoryManager.hasStock(productId, newTotalQuantity)) {
      return {
        success: false,
        message: `Stock insuficiente. Solo hay ${availableStock} unidades disponibles`,
        availableStock: availableStock,
      };
    }

    // Agregar al carrito
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...product,
        quantity,
      });
    }

    this.saveToLocalStorage();
    return { success: true, message: 'Producto agregado al carrito', availableStock: availableStock };
  }

  // Eliminar artículo del carrito
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToLocalStorage();
  }

  /**
   * Actualizar cantidad del artículo con validación de stock
   * @param {number} productId - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {Object} {success: boolean, message: string}
   */
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (!item) {
      return { success: false, message: 'Producto no encontrado en el carrito' };
    }

    if (quantity <= 0) {
      this.removeItem(productId);
      return { success: true, message: 'Producto eliminado del carrito' };
    }

    // Validar stock disponible
    const availableStock = inventoryManager.getStock(productId);
    if (!inventoryManager.hasStock(productId, quantity)) {
      return {
        success: false,
        message: `Stock insuficiente. Solo hay ${availableStock} unidades disponibles`,
      };
    }

    item.quantity = quantity;
    this.saveToLocalStorage();
    return { success: true, message: 'Cantidad actualizada' };
  }

  // Obtener todos los artículos
  getItems() {
    return this.items;
  }

  // Obtener total del carrito
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Obtener cantidad de artículos
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Vaciar carrito
  clearCart() {
    this.items = [];
    this.saveToLocalStorage();
  }

  // Guardar en localStorage
  saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  // Cargar desde localStorage
  loadFromLocalStorage() {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  }
}

export const cart = new ShoppingCart();
