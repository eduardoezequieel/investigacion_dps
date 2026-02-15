// Servicio de productos - maneja datos de productos y operaciones
import { products } from '../data/mockData.js';

/**
 * Gestor de productos
 * @class ProductManager
 */
class ProductManager {
  constructor() {
    this.products = products;
  }

  /**
   * Obtiene todos los productos disponibles
   * @returns {Array} Array de todos los productos
   */
  getAllProducts() {
    return this.products;
    }

  /**
   * Obtiene un producto específico por su ID
   * @param {number} id - ID del producto
   * @returns {Object|undefined} Producto encontrado o undefined
   */
  getProductById(id) {
    try {
      const productId = parseInt(id);
      if (isNaN(productId)) {
        console.warn('ID de producto inválido:', id);
        return undefined;
      }
      return this.products.find(product => product.id === productId);
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      return undefined;
    }
  }
}
