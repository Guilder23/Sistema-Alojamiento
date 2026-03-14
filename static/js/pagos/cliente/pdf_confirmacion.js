/**
 * PDF Confirmación - JavaScript para impresión
 */

// Auto-abrir diálogo de impresión cuando se carga la página
window.addEventListener('load', function() {
    // Dar tiempo para que se carguen los estilos
    setTimeout(function() {
        window.print();
    }, 500);
});

// Cerrar ventana después de imprimir o cancelar
window.addEventListener('afterprint', function() {
    // Opcional: cerrar automáticamente la ventana
    // window.close();
});
