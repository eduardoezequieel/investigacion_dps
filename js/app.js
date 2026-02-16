// Módulo principal de la aplicación - coordina todos los módulos
import { uiManager } from './ui/UIManager.js';

class App {
  constructor() {
    this.initializeApp();
  }

  initializeApp() {    
    uiManager.init();
  }
}

// Inicializar aplicación cuando DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}
