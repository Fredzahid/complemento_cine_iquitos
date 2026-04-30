// 1. Configuración de Supabase
const SUPABASE_URL = 'https://rsbcvmdfjqrnkrxrofzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_F1-BQwGqsr-KKiVx7NS6JA_-59AZ_u-';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let asientoSeleccionado = null; 

// 2. Cargar Películas
async function obtenerPeliculas() {
    const { data, error } = await _supabase.from('peliculas').select('*');
    if (error) return console.error('Error Películas:', error);

    const container = document.getElementById('peliculas-container');
    if (!container) return;
    container.innerHTML = ''; 

    data.forEach(pelicula => {
        container.innerHTML += `
            <div class="card">
                <img src="${pelicula.imagen_url}" alt="${pelicula.titulo}">
                <div class="card-content">
                    <h3>${pelicula.titulo}</h3>
                    <p>${pelicula.duracion} min | ${pelicula.genero}</p>
                    <button onclick="seleccionarPelicula('${pelicula.id}')">Comprar Ticket</button>
                </div>
            </div>`;
    });
}

// 3. Modal de Horarios (Paso 1: Ver Sinopsis y Horarios)
async function seleccionarPelicula(id) {
    const modal = document.getElementById('modal-horarios');
    const lista = document.getElementById('horarios-lista');
    const tituloModal = document.getElementById('modal-titulo');

    if (modal) modal.style.display = "block";
    tituloModal.innerText = "Cargando...";
    lista.innerHTML = "";
    asientoSeleccionado = null; 

    try {
        const { data: pelicula } = await _supabase.from('peliculas').select('*').eq('id', id).single();
        const { data: funciones } = await _supabase.from('funciones').select('*').eq('pelicula_id', id);

        tituloModal.innerText = pelicula.titulo;
        
        let contenidoHtml = `
            <p style="text-align: justify; margin-bottom: 20px; color: #ccc; font-size: 0.95rem; line-height: 1.5; padding: 0 10px;">
                ${pelicula.sinopsis}
            </p>
            <hr style="border: 0.5px solid #333; margin-bottom: 15px; width: 95%; margin-left: auto; margin-right: auto;">
            <div style="width: 100%; text-align: center; margin-bottom: 15px;">
                <span style="color: #ff0000; letter-spacing: 2px; font-size: 0.85rem; font-weight: bold; display: block;">HORARIOS</span>
            </div>
            <div id="contenedor-horarios" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: center; padding-bottom: 10px;">
        `;

        if (!funciones || funciones.length === 0) {
            contenidoHtml += "<p style='color: #666;'>No hay funciones disponibles.</p>";
        } else {
            funciones.forEach(f => {
                const fecha = new Date(f.horario);
                const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                contenidoHtml += `
                    <button class="btn-horario" 
                            style="min-width: 110px; padding: 12px; font-weight: bold; cursor: pointer; border-radius: 8px; border: none; background: #ff0000; color: white;" 
                            onclick="abrirSeleccionAsientos('${f.id}', '${f.sala}', '${hora}')">
                        ${hora}
                    </button>`;
            });
        }
        contenidoHtml += `</div>`;
        lista.innerHTML = contenidoHtml;
    } catch (err) {
        lista.innerHTML = "<p>Error al cargar información.</p>";
    }
}

// 4. Paso 2: Selección de Asientos
function abrirSeleccionAsientos(funcionId, sala, hora) {
    const lista = document.getElementById('horarios-lista');
    const tituloModal = document.getElementById('modal-titulo');
    const nombrePelicula = tituloModal.innerText; 

    tituloModal.innerText = "Selecciona tu Asiento";
    
    lista.innerHTML = `
        <div style="margin-bottom: 15px; background: #222; padding: 10px; border-radius: 5px; border-left: 4px solid #ff0000;">
            <p><strong>Sala:</strong> ${sala} | <strong>Horario:</strong> ${hora}</p>
        </div>
        <div class="mapa-asientos" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; justify-items: center; margin-top: 20px;">
            <div class="asiento" onclick="marcarAsiento(this, 'A1')">A1</div>
            <div class="asiento" onclick="marcarAsiento(this, 'A2')">A2</div>
            <div class="asiento" onclick="marcarAsiento(this, 'A3')">A3</div>
            <div class="asiento" onclick="marcarAsiento(this, 'A4')">A4</div>
            <div class="asiento" onclick="marcarAsiento(this, 'B1')">B1</div>
            <div class="asiento" onclick="marcarAsiento(this, 'B2')">B2</div>
            <div class="asiento" onclick="marcarAsiento(this, 'B3')">B3</div>
            <div class="asiento" onclick="marcarAsiento(this, 'B4')">B4</div>
        </div>
        <div id="status-asiento" style="margin-top: 15px; color: #ff0000; font-weight: bold; text-align: center; height: 20px;"></div>
        <button id="btn-siguiente" class="btn-ticket-final" 
            style="display:none; margin-top: 20px; width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; text-transform: uppercase;" 
            onclick="irAPago('${nombrePelicula}', '${sala}', '${hora}')">
            SIGUIENTE
        </button>
        <button onclick="location.reload()" style="background: none; border: none; color: #888; text-decoration: underline; cursor: pointer; margin-top: 15px; width: 100%;">
            Volver a horarios
        </button>
    `;
}

// 5. Gestión de Selección y Redirección
function marcarAsiento(elemento, numero) {
    document.querySelectorAll('.asiento').forEach(a => a.style.background = "#444");
    elemento.style.background = "#ff0000";
    asientoSeleccionado = numero;
    
    document.getElementById('status-asiento').innerText = "Has seleccionado el asiento: " + numero;
    document.getElementById('btn-siguiente').style.display = "block";
}

function irAPago(pelicula, sala, hora) {
    const datosCompra = {
        pelicula: pelicula,
        sala: sala,
        hora: hora,
        asiento: asientoSeleccionado
    };
    localStorage.setItem('reservaActual', JSON.stringify(datosCompra));
    window.location.href = 'pago.html'; 
}

// 6. Cargar Snacks
async function obtenerSnacks() {
    const { data, error } = await _supabase.from('productos_alimentos').select('*');
    if (error) return console.error('Error Snacks:', error);

    const container = document.getElementById('snacks-container');
    if (!container) return;
    container.innerHTML = ''; 

    data.forEach(snack => {
        container.innerHTML += `
            <div class="card">
                <img src="${snack.imagen_url || 'https://via.placeholder.com/200'}" alt="${snack.nombre}">
                <div class="card-content">
                    <h3>${snack.nombre}</h3>
                    <p>Precio: S/ ${snack.precio}</p>
                    <button onclick="alert('Snack agregado')">Agregar</button>
                </div>
            </div>`;
    });
}

// 7. Funciones de Control
function cerrarModal() {
    document.getElementById('modal-horarios').style.display = "none";
}

window.onclick = (e) => {
    const modal = document.getElementById('modal-horarios');
    if (e.target == modal) cerrarModal();
};

window.onload = () => {
    obtenerPeliculas();
    obtenerSnacks();
};