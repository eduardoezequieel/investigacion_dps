// Servicio de facturación - maneja generación y gestión de facturas
import { cart } from './CartManager.js';
import { inventoryManager } from './InventoryManager.js';

/**
 * Gestor de facturación
 * @class InvoiceManager
 */
class InvoiceManager {
  constructor() {
    this.TAX_RATE = 0.13; // IVA del 13%
    this.invoices = this.loadInvoicesFromStorage();
  }

  /**
   * Genera un número de factura único
   * @returns {string} Número de factura en formato FAC-YYYYMMDD-XXXXX
   */
  generateInvoiceNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `FAC-${dateStr}-${random}`;
  }

  /**
   * Calcula el subtotal del carrito
   * @returns {number} Subtotal sin impuestos
   */
  calculateSubtotal() {
    return cart.getTotal();
  }

  /**
   * Calcula el monto de impuestos
   * @param {number} subtotal - Subtotal sin impuestos
   * @returns {number} Monto de impuestos
   */
  calculateTax(subtotal) {
    return subtotal * this.TAX_RATE;
  }

  /**
   * Calcula el total final (subtotal + impuestos)
   * @param {number} subtotal - Subtotal sin impuestos
   * @param {number} tax - Monto de impuestos
   * @returns {number} Total final
   */
  calculateTotal(subtotal, tax) {
    return subtotal + tax;
  }

  /**
   * Genera una factura con los datos del cliente y productos del carrito
   * @param {Object} customerData - Datos del cliente (nombre, email, dirección)
   * @returns {Object} Objeto de factura completa
   */
  generateInvoice(customerData) {
    const items = cart.getItems();

    if (items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    // Verificar que hay suficiente stock para todos los productos
    const stockCheck = inventoryManager.decrementMultipleProducts(items);
    if (!stockCheck) {
      throw new Error('Stock insuficiente para algunos productos');
    }

    const subtotal = this.calculateSubtotal();
    const tax = this.calculateTax(subtotal);
    const total = this.calculateTotal(subtotal, tax);

    const invoice = {
      invoiceNumber: this.generateInvoiceNumber(),
      date: new Date().toISOString(),
      customer: {
        name: customerData.name,
        email: customerData.email,
        address: customerData.address || 'N/A',
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: subtotal,
      taxRate: this.TAX_RATE,
      tax: tax,
      total: total,
    };

    // Guardar factura en el historial
    this.invoices.push(invoice);
    this.saveInvoicesToStorage();

    return invoice;
  }

  /**
   * Obtiene todas las facturas generadas
   * @returns {Array} Array de facturas
   */
  getAllInvoices() {
    return this.invoices;
  }

  /**
   * Busca una factura por su número
   * @param {string} invoiceNumber - Número de factura
   * @returns {Object|null} Factura encontrada o null
   */
  getInvoiceByNumber(invoiceNumber) {
    return this.invoices.find(inv => inv.invoiceNumber === invoiceNumber) || null;
  }

  /**
   * Guarda las facturas en localStorage
   */
  saveInvoicesToStorage() {
    try {
      localStorage.setItem('invoices', JSON.stringify(this.invoices));
    } catch (error) {
      console.error('Error al guardar facturas:', error);
    }
  }

  /**
   * Carga las facturas desde localStorage
   * @returns {Array} Array de facturas
   */
  loadInvoicesFromStorage() {
    try {
      const saved = localStorage.getItem('invoices');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      return [];
    }
  }
}

export const invoiceManager = new InvoiceManager();
