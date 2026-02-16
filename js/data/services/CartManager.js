// Servicio del carrito - maneja operaciones del carrito de compras
import { productManager } from './ProductManager.js';
import { inventoryManager } from './InventoryManager.js';

class ShoppingCart {
  constructor() {
    this.items = this.loadFromLocalStorage();
  }
