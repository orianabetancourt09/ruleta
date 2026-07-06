const btnSpin = document.getElementById('btn-spin');
const wheel = document.getElementById('wheel');
const accountsInput = document.getElementById('accounts-input');
const winnerModal = document.getElementById('winner-modal');
const winnerName = document.getElementById('winner-name');
const btnClose = document.getElementById('btn-close');
const lottieContainer = document.getElementById('lottie-celebration');

let lottieAnimation = null;
// LA CUENTA GANADORA CONFIGURADA
const RIGGED_ACCOUNT = "@Adidafne"; 

// Inicializar la animación de Lottie usando un JSON público de celebración (confeti)
function loadCelebrationAnimation() {
    lottieAnimation = lottie.loadAnimation({
        container: lottieContainer, 
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'https://assets2.lottiefiles.com/packages/lf20_u4yrau.json' 
    });
}

loadCelebrationAnimation();

// Dibuja la ruleta con los nombres de los participantes
function drawWheel() {
    const lines = accountsInput.value.split('\n');
    let accounts = lines.map(acc => acc.trim()).filter(acc => acc !== "");
    accounts = [...new Set(accounts)];

    // Limpiar contenido previo de la ruleta
    wheel.innerHTML = '';

    if (accounts.length === 0) {
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    wheel.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const size = 600;
    const center = size / 2;
    const radius = center;
    const numSectors = accounts.length;
    const angle = (2 * Math.PI) / numSectors;

    const colors = ['#f09433', '#e1306c', '#bc1888', '#962fbf', '#4f5bd5'];

    for (let i = 0; i < numSectors; i++) {
        const startAngle = -Math.PI / 2 + i * angle;
        const endAngle = startAngle + angle;

        // 1. Dibujar el sector (rebanada)
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // Borde fino del sector
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.stroke();

        // 2. Dibujar el texto
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + angle / 2);
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        // Ajustar tamaño de fuente según el número de participantes (escalado para canvas de 600x600)
        let fontSize = 28;
        if (numSectors > 60) {
            fontSize = 14; // Equivale a 7px en CSS
        } else if (numSectors > 40) {
            fontSize = 18; // Equivale a 9px en CSS
        } else if (numSectors > 20) {
            fontSize = 22; // Equivale a 11px en CSS
        } else if (numSectors > 10) {
            fontSize = 26; // Equivale a 13px en CSS
        }

        ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
        
        // Recortar el nombre si es excesivamente largo
        let name = accounts[i];
        const maxChars = Math.floor((radius - 40) / (fontSize * 0.6));
        if (name.length > maxChars) {
            name = name.substring(0, maxChars - 2) + '..';
        }
        
        ctx.fillText(name, radius - 15, 0);
        ctx.restore();
    }

    // Dibujar un círculo central decorativo
    ctx.beginPath();
    ctx.arc(center, center, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#e1306c';
    ctx.stroke();
}

// Escuchar cambios en el cuadro de texto para actualizar la ruleta
accountsInput.addEventListener('input', drawWheel);
window.addEventListener('DOMContentLoaded', drawWheel);
// Dibujar inicialmente
drawWheel();


btnSpin.addEventListener('click', () => {
    // 1. Obtener las cuentas del textarea y limpiar espacios vacíos
    const lines = accountsInput.value.split('\n');
    let accounts = lines.map(acc => acc.trim()).filter(acc => acc !== "");

    // 2. Filtrar duplicados usando Set para asegurar cuentas únicas
    accounts = [...new Set(accounts)];

    if (accounts.length === 0) {
        alert("Por favor, ingresa al menos una cuenta.");
        return;
    }

    // Deshabilitar botón durante el giro para evitar interrupciones
    btnSpin.disabled = true;

    // 3. LÓGICA DEL TRUCO (RULETA TRUCADA)
    let randomIndex;
    
    // Buscamos si la cuenta elegida está en la lista (limpiamos el '@' por si acaso)
    const targetClean = RIGGED_ACCOUNT.replace('@', '').toLowerCase();
    const targetIndex = accounts.findIndex(acc => acc.replace('@', '').toLowerCase() === targetClean);

    if (targetIndex !== -1) {
        randomIndex = targetIndex;
    } else {
        randomIndex = Math.floor(Math.random() * accounts.length);
    }

    const winner = accounts[randomIndex];

    // 4. CÁLCULO DE GRADOS CON FRENADO PROGRESIVO
    // Aumentamos a 8 vueltas completas para que tenga más inercia al inicio (2880 grados)
    const extraTurns = 8; 
    const degreesPerSegment = 360 / accounts.length;
    
    // El centro del sector ganador en la ruleta
    const targetSectorCenter = (randomIndex * degreesPerSegment) + (degreesPerSegment / 2);
    
    // Calculamos el total de grados en sentido horario para que la aguja (arriba a 0°/360°)
    // apunte exactamente al sector ganador.
    const totalDegrees = (extraTurns * 360) + (360 - targetSectorCenter);

    // Alargamos el tiempo de giro a 6 segundos para que el "procrastinado" o frenado lento se disfrute más
    wheel.style.transition = 'transform 6s cubic-bezier(0.15, 0.85, 0.1, 1)';
    
    // Aplicar la rotación
    wheel.style.transform = `rotate(${totalDegrees}deg)`;

    // 5. Esperar a que la transición de CSS termine (6 segundos configurados arriba)
    setTimeout(() => {
        // Mostrar modal del ganador en el centro de la pantalla
        winnerName.innerText = winner;
        winnerModal.classList.remove('hidden');
        
        // Activar la animación JSON de celebración
        if (lottieAnimation) {
            lottieAnimation.goToAndPlay(0, true);
        }
    }, 6000); // Mismo tiempo que la transición CSS
});

// Cerrar el modal y resetear la ruleta de forma invisible
btnClose.addEventListener('click', () => {
    winnerModal.classList.add('hidden');
    if (lottieAnimation) {
        lottieAnimation.stop();
    }
    
    // Quitamos la transición para resetear a 0° instantáneamente sin que se vea
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    
    // Forzar reflow del navegador
    wheel.offsetHeight; 
    
    btnSpin.disabled = false;
});