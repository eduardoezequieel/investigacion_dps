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

  /**
   * Obtiene productos filtrados por categoría
   * @param {string} category - Nombre de la categoría
   * @returns {Array} Array de productos en la categoría
   */
  getProductsByCategory(category) {
    try {
      if (!category || typeof category !== 'string') {
        return [];
      }
      return this.products.filter(product => product.category === category.toLowerCase());
    } catch (error) {
      console.error('Error al filtrar por categoría:', error);
      return [];
    }
  }

  /**
   * Obtiene todas las categorías únicas de productos
   * @returns {Array} Array de nombres de categorías
   */
  getCategories() {
    try {
      const categories = new Set(this.products.map(p => p.category));
      return Array.from(categories);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }

  /**
   * Busca productos por nombre o descripción
   * @param {string} query - Término de búsqueda
   * @returns {Array} Array de productos que coinciden con la búsqueda
   */
  searchProducts(query) {
    try {
      if (!query || typeof query !== 'string') {
        return this.products;
      }

      // Sanitizar la query: eliminar caracteres especiales peligrosos
      const sanitizedQuery = query
        .trim()
        .replace(/[<>{}[\]\\\/]/g, '')
        .toLowerCase();

      if (sanitizedQuery.length === 0) {
        return this.products;
      }

      return this.products.filter(product =>
        product.name.toLowerCase().includes(sanitizedQuery) ||
        product.description.toLowerCase().includes(sanitizedQuery) ||
        product.category.toLowerCase().includes(sanitizedQuery)
      );
    } catch (error) {
      console.error('Error al buscar productos:', error);
      return this.products;
    }
  }
}

export const productManager = new ProductManager();
