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
