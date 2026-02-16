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