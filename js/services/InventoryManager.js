// Servicio de inventario - maneja cantidades de stock de productos
import { products } from '../data/mockData.js';

/**
 * Gestor de inventario
 * @class InventoryManager
 */
class InventoryManager {
  constructor() {
    this.inventory = this.loadInventoryFromStorage();
  }

  /**
   * Obtiene la cantidad de stock disponible de un producto
   * @param {number} productId - ID del producto
   * @returns {number} Cantidad disponible en stock
   */
  getStock(productId) {
    // Si hay datos guardados en localStorage, usar esos
    if (this.inventory[productId] !== undefined) {
      return this.inventory[productId];
    }

    // Si no, usar datos de mockData
    const product = products.find(p => p.id === productId);
    return product ? product.stockQuantity : 0;
  }

  /**
   * Verifica si hay suficiente stock disponible
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad solicitada
   * @returns {boolean} true si hay suficiente stock
   */
  hasStock(productId, quantity) {
    const available = this.getStock(productId);
    return available >= quantity;
  }

  /**
   * Decrementa el stock de un producto
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad a decrementar
   * @returns {boolean} true si se pudo decrementar exitosamente
   */
  decrementStock(productId, quantity) {
    try {
      const currentStock = this.getStock(productId);

      if (currentStock < quantity) {
        console.warn(`Stock insuficiente para producto ${productId}`);
        return false;
      }

      const newStock = currentStock - quantity;
      this.inventory[productId] = newStock;
      this.saveInventoryToStorage();

      return true;
    } catch (error) {
      console.error('Error al decrementar stock:', error);
      return false;
    }
  }

  /**
   * Incrementa el stock de un producto (útil para devoluciones)
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad a incrementar
   * @returns {boolean} true si se pudo incrementar exitosamente
   */
  incrementStock(productId, quantity) {
    try {
      const currentStock = this.getStock(productId);
      const newStock = currentStock + quantity;
      this.inventory[productId] = newStock;
      this.saveInventoryToStorage();

      return true;
    } catch (error) {
      console.error('Error al incrementar stock:', error);
      return false;
    }
  }

  /**
   * Decrementa el stock de múltiples productos (para checkout)
   * @param {Array} items - Array de items con {id, quantity}
   * @returns {boolean} true si todos los decrementos fueron exitosos
   */
  decrementMultipleProducts(items) {
    try {
      // Primero verificar que todos los productos tengan stock suficiente
      for (const item of items) {
        if (!this.hasStock(item.id, item.quantity)) {
          console.warn(`Stock insuficiente para producto ${item.id}`);
          return false;
        }
      }

      // Si todos tienen stock, decrementar
      for (const item of items) {
        this.decrementStock(item.id, item.quantity);
      }

      return true;
    } catch (error) {
      console.error('Error al decrementar múltiples productos:', error);
      return false;
    }
  }

  /**
   * Verifica si un producto está en stock (quantity > 0)
   * @param {number} productId - ID del producto
   * @returns {boolean} true si el producto está en stock
   */
  isInStock(productId) {
    return this.getStock(productId) > 0;
  }

  /**
   * Obtiene el inventario completo
   * @returns {Object} Objeto con todos los stocks
   */
  getAllInventory() {
    return { ...this.inventory };
  }

  /**
   * Resetea el inventario a los valores originales de mockData
   */
  resetInventory() {
    this.inventory = {};
    this.saveInventoryToStorage();
  }

  /**
   * Guarda el inventario en localStorage
   */
  saveInventoryToStorage() {
    try {
      localStorage.setItem('inventory', JSON.stringify(this.inventory));
    } catch (error) {
      console.error('Error al guardar inventario:', error);
    }
  }

  /**
   * Carga el inventario desde localStorage
   * @returns {Object} Objeto con el inventario
   */
  loadInventoryFromStorage() {
    try {
      const saved = localStorage.getItem('inventory');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      return {};
    }
  }
}

export const inventoryManager = new InventoryManager();
