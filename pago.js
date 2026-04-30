document.addEventListener('DOMContentLoaded', () => {
    // 1. Recuperar los datos guardados en app.js
    const reservaStr = localStorage.getItem('reservaActual');

    if (!reservaStr) {
        alert("No hay una reserva activa. Serás redirigido.");
        window.location.href = 'index.html';
        return;
    }

    const reserva = JSON.parse(reservaStr);

    // 2. Mostrar los datos en la pantalla
    document.getElementById('resumen-pelicula').innerText = reserva.pelicula;
    document.getElementById('resumen-sala').innerText = reserva.sala;
    document.getElementById('resumen-hora').innerText = reserva.hora;
    document.getElementById('resumen-asiento').innerText = reserva.asiento;
});

function procesarPago() {
    // Aquí podrías integrar una pasarela real o simular el éxito
    alert("💸 ¡Pago procesado con éxito!\nTu ticket ha sido generado correctamente.");
    
    // Opcional: Limpiar la reserva después de pagar
    localStorage.removeItem('reservaActual');
    
    // Volver al inicio o a una página de éxito
    window.location.href = 'index.html';
}
// Variable para guardar el método elegido
let metodoElegido = "";

// 1. Lógica para seleccionar el método de pago
document.querySelectorAll('.opcion-pago').forEach(opcion => {
    opcion.addEventListener('click', function() {
        // Quitamos la selección a los demás
        document.querySelectorAll('.opcion-pago').forEach(opt => opt.classList.remove('seleccionado'));
        
        // Marcamos el actual
        this.classList.add('seleccionado');
        
        // Guardamos el nombre del método (quitando el emoji)
        metodoElegido = this.innerText.replace(/[💳📱]/g, '').trim();
    });
});

// 2. Lógica para procesar y enviar a la siguiente ventana
function procesarPago() {
    if (!metodoElegido) {
        alert("¡Espera! Primero selecciona un método de pago.");
        return;
    }

    // Obtenemos los datos que ya están en el ticket blanco
    const ticketData = {
        pelicula: document.getElementById('resumen-pelicula').innerText,
        sala: document.getElementById('resumen-sala').innerText,
        asiento: document.getElementById('resumen-asiento').innerText,
        hora: document.getElementById('resumen-hora').innerText,
        pago: metodoElegido,
        total: "S/ 15.00"
    };

    // Guardamos en la memoria del navegador
    localStorage.setItem('ticketFinal', JSON.stringify(ticketData));

    // Enviamos a la ventana de detalle/confirmación
    window.location.href = "confirmacion.html";
}

// Cargar datos iniciales (suponiendo que vienen de la cartelera)
window.onload = function() {
    const reserva = JSON.parse(localStorage.getItem('reservaActual'));
    if(reserva) {
        document.getElementById('resumen-pelicula').innerText = reserva.pelicula;
        document.getElementById('resumen-sala').innerText = reserva.sala;
        document.getElementById('resumen-asiento').innerText = reserva.asiento;
        document.getElementById('resumen-hora').innerText = reserva.hora;
    }
};