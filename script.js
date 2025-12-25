// ===== PÁGINA FELIZ NAVIDAD INTERACTIVA =====
// Implementación completa del sistema interactivo navideño

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    RESOURCES: {
        ENTRY_IMAGES: './Recursos/EntradaAlPino/Imagenes/',
        ENTRY_VIDEOS: './Recursos/EntradaAlPino/Videos/',
        GIFTS: './Recursos/Regalos/',
        EXPLOSION: './Recursos/Explosion/',
        CHRISTMAS_VIDEOS: './Recursos/VideosNavideños/',
        NEGATIVE_IMAGES: './Recursos/ParaLaDesicionNegativa/',
        MAIN_PINE: './Recursos/Principal/SuperPino.png',
        BACKGROUND: './Recursos/Principal/fondoXD.webp',
        CARE_PINE: './Recursos/EntradaAlPino/cuidaelpino.jpg',
        LETTER: './Recursos/Carta/CartaCerrada.jpeg',
        LETTER_OPEN: './Recursos/Carta/CartaAbierta.png',
        FINAL_IMAGE: './Recursos/ParaElFinal/yoquelerlamucho.jpeg',
        BACKGROUND_MUSIC: './Recursos/Musica/001.mp3'
    },
    GIFT_MESSAGES: {
        '1.jpg': 'rico tamalito ñom ñom',
        '2.webp': 'mira te has llevado un pelushe de los bities',
        '3.webp': 'te has ganado un puticornio de bete21',
        '4.webp': 'orales un koala azul :O',
        '5.jpg': 'orales yun cock, bueno ese se me infiltro no eso ya estrata de personas, pero deseo que te llegue un chino',
        '6.webp': 'una alcanciaaaa orales para que guardes tus 4 pesos de aguinaldo :O',
        '7.webp': 'Una super piedra yiyi rocky la piegra que envidia'
    },
    NEGATIVE_MESSAGES: [
        'se te fue el dedo amiga',
        'miri no quierer navidad?',
        'mmmm nah creo',
        'ostras ya 4 veces no? :O',
        'tas bien?',
        'yaya mija ya que te hizo santa?',
        'porque? no quieres ver lo que hice pa ti?',
        'nooo quiere nada mio pipipi',
        'orales tenga un foxy'
    ],
    TIMERS: {
        GIFT_AUTO_CLOSE: 10000, // 10 segundos
        IMAGE_TRANSITION: 3000,  // 3 segundos entre imágenes negativas
        VIDEO_CHECK_INTERVAL: 100, // Verificar estado del video cada 100ms
        CARE_PINE_DISPLAY: 3000  // 3 segundos para mostrar imagen de cuidar el pino
    },
    AUDIO: {
        BACKGROUND_VOLUME: 0.15, // 15% de volumen para música de fondo
        EFFECTS_VOLUME: 0.7      // 70% de volumen para efectos
    }
};

// ===== GESTIÓN DE ESTADOS =====
class StateManager {
    constructor() {
        this.currentState = 'welcome';
        this.openedGifts = new Set();
        this.usedGiftImages = new Set(); // Para evitar repetir imágenes
        this.isInteractionBlocked = false;
        this.negativeSequenceIndex = 0;
        this.negativeClickCount = 0; // Contador de clicks en "No"
        this.maxNegativeClicks = 9; // Máximo 9 clicks permitidos
    }

    setState(newState) {
        console.log(`Cambiando estado de ${this.currentState} a ${newState}`);
        this.currentState = newState;
        this.updateUI();
    }

    updateUI() {
        console.log(`🔄 Actualizando UI para estado: ${this.currentState}`);
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostrar pantalla actual
        let screenId = `${this.currentState}-screen`;
        
        // Mapear estados especiales
        if (this.currentState === 'care-pine') {
            screenId = 'care-pine-screen';
        }
        
        const currentScreen = document.getElementById(screenId);
        if (currentScreen) {
            currentScreen.classList.add('active');
            console.log(`✅ Pantalla ${screenId} activada`);
        } else {
            console.error(`❌ No se encontró la pantalla: ${screenId}`);
            console.log('Pantallas disponibles:', Array.from(document.querySelectorAll('.screen')).map(s => s.id));
        }
    }

    addOpenedGift(giftIndex) {
        this.openedGifts.add(giftIndex);
        console.log(`Regalo ${giftIndex} abierto. Total: ${this.openedGifts.size}/7`);
    }

    areAllGiftsOpened() {
        return this.openedGifts.size >= 7;
    }

    resetNegativeSequence() {
        this.negativeClickCount = 0;
        this.negativeSequenceIndex = 0;
        
        // Re-habilitar el botón "No" si estaba deshabilitado
        const btnNo = document.getElementById('btn-no');
        if (btnNo) {
            btnNo.disabled = false;
            btnNo.style.opacity = '1';
            btnNo.style.cursor = 'pointer';
        }
        
        console.log('Secuencia negativa reseteada');
    }

    blockInteractions() {
        this.isInteractionBlocked = true;
        document.body.style.pointerEvents = 'none';
    }

    unblockInteractions() {
        this.isInteractionBlocked = false;
        document.body.style.pointerEvents = 'auto';
    }
}

// ===== GENERADOR DE ELEMENTOS ALEATORIOS =====
class RandomGenerator {
    static getRandomPosition(containerWidth, containerHeight, elementSize = 80) {
        const margin = 50;
        const x = Math.random() * (containerWidth - elementSize - margin * 2) + margin;
        const y = Math.random() * (containerHeight - elementSize - margin * 2) + margin;
        return { x, y };
    }

    static getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static generateNonOverlappingPositions(count, containerWidth, containerHeight, elementSize = 80) {
        const positions = [];
        const minDistance = elementSize + 20;
        let attempts = 0;
        const maxAttempts = 1000;

        while (positions.length < count && attempts < maxAttempts) {
            const newPos = this.getRandomPosition(containerWidth, containerHeight, elementSize);
            let isValid = true;

            // Verificar que no se superponga con posiciones existentes
            for (const pos of positions) {
                const distance = Math.sqrt(
                    Math.pow(newPos.x - pos.x, 2) + Math.pow(newPos.y - pos.y, 2)
                );
                if (distance < minDistance) {
                    isValid = false;
                    break;
                }
            }

            if (isValid) {
                positions.push(newPos);
            }
            attempts++;
        }

        return positions;
    }
}

// ===== GESTIÓN DE MULTIMEDIA =====
class MediaManager {
    static async loadRandomImage(basePath, fallbackSrc = '') {
        // Lista de imágenes disponibles según la carpeta
        const imageFiles = {
            './Recursos/EntradaAlPino/Imagenes/': ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg'],
            './Recursos/Regalos/': ['1.jpg', '2.webp', '3.webp', '4.webp', '5.jpg', '6.webp', '7.webp']
        };

        const files = imageFiles[basePath] || ['imagen1.jpg'];
        const randomFile = RandomGenerator.getRandomFromArray(files);
        return basePath + randomFile;
    }

    static async loadRandomGiftWithMessage(stateManager) {
        // Lista de todas las imágenes de regalos disponibles
        const giftFiles = ['1.jpg', '2.webp', '3.webp', '4.webp', '5.jpg', '6.webp', '7.webp'];
        
        // Filtrar las imágenes que ya se han usado
        const availableFiles = giftFiles.filter(file => !stateManager.usedGiftImages.has(file));
        
        // Si no quedan imágenes disponibles, reiniciar la lista
        if (availableFiles.length === 0) {
            stateManager.usedGiftImages.clear();
            availableFiles.push(...giftFiles);
        }
        
        // Seleccionar una imagen aleatoria de las disponibles
        const randomFile = RandomGenerator.getRandomFromArray(availableFiles);
        
        // Marcar la imagen como usada
        stateManager.usedGiftImages.add(randomFile);
        
        const imagePath = CONFIG.RESOURCES.GIFTS + randomFile;
        const message = CONFIG.GIFT_MESSAGES[randomFile];
        
        return {
            imagePath: imagePath,
            message: message,
            fileName: randomFile
        };
    }

    static async loadRandomVideo(basePath) {
        // Lista de videos disponibles según la carpeta
        const videoFiles = {
            './Recursos/EntradaAlPino/Videos/': ['1.mp4', '2.mp4'],
            './Recursos/VideosNavideños/': ['FelizNavidad1.mp4', 'FelizNavidad2.mp4', 'FelizNavidad3.mp4', 'FelizNavidad4.mp4', 'FelizNavidad5.mp4', 'FelizNavidad6.mp4', 'FelizNavidad7.mp4', 'FelizNavidad8.mp4']
        };

        const files = videoFiles[basePath] || ['video1.mp4'];
        const randomFile = RandomGenerator.getRandomFromArray(files);
        return basePath + randomFile;
    }

    static playAudio(audioElement, loop = false, volume = 1.0) {
        if (audioElement) {
            audioElement.loop = loop;
            audioElement.volume = volume;
            audioElement.play().catch(e => console.log('Error reproduciendo audio:', e));
        }
    }

    static stopAudio(audioElement) {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    }

    static startBackgroundMusic() {
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
            backgroundMusic.src = './Recursos/Musica/001.mp3';
            backgroundMusic.volume = 0.15;
            backgroundMusic.loop = true;
            
            console.log('🎵 Configurando música de fondo...');
            
            // Función para iniciar música
            const playMusic = () => {
                backgroundMusic.play().then(() => {
                    console.log('🎵 Música de fondo iniciada al 15% de volumen');
                }).catch(error => {
                    console.log('🎵 Error reproduciendo música:', error);
                });
            };
            
            // Intentar reproducir inmediatamente
            playMusic();
            
            // Si falla, agregar listener para el primer click
            const startMusicOnClick = () => {
                playMusic();
                document.removeEventListener('click', startMusicOnClick);
                document.removeEventListener('touchstart', startMusicOnClick);
            };
            
            document.addEventListener('click', startMusicOnClick);
            document.addEventListener('touchstart', startMusicOnClick);
        }
    }

    static stopBackgroundMusic() {
        const backgroundMusic = document.getElementById('background-music');
        this.stopAudio(backgroundMusic);
        console.log('🎵 Música de fondo detenida');
    }
}

// ===== CONTROLADOR DE INTERFAZ =====
class UIController {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.currentGiftModal = null;
        this.giftTimeouts = new Map();
    }

    showGiftModal(giftIndex, giftImageSrc, message) {
        const modal = document.getElementById('gift-modal');
        const giftImage = document.getElementById('gift-image');
        const giftMessage = document.getElementById('gift-message');

        giftImage.src = giftImageSrc;
        giftMessage.innerHTML = `<strong>🎁 ¡Felicidades! 🎁</strong><br>${message}`;
        
        modal.classList.remove('hidden');
        this.currentGiftModal = giftIndex;

        // Auto-cerrar después de 10 segundos
        const timeout = setTimeout(() => {
            this.closeGiftModal();
        }, CONFIG.TIMERS.GIFT_AUTO_CLOSE);

        this.giftTimeouts.set(giftIndex, timeout);

        // Reproducir efecto de explosión
        this.playExplosionEffect();
    }

    closeGiftModal() {
        const modal = document.getElementById('gift-modal');
        modal.classList.add('hidden');

        if (this.currentGiftModal !== null) {
            // Limpiar timeout si existe
            const timeout = this.giftTimeouts.get(this.currentGiftModal);
            if (timeout) {
                clearTimeout(timeout);
                this.giftTimeouts.delete(this.currentGiftModal);
            }
            this.currentGiftModal = null;
        }
    }

    playExplosionEffect() {
        const explosionAudio = document.getElementById('explosion-audio');
        if (explosionAudio) {
            explosionAudio.src = './Recursos/Explosion/ExplosionDeltaruneFX.mp3';
            MediaManager.playAudio(explosionAudio, false, CONFIG.AUDIO.EFFECTS_VOLUME);
        }
    }

    async showEntrySequence() {
        const entryImage = document.getElementById('entry-image');
        const entryVideo = document.getElementById('entry-video');

        // Mostrar imagen aleatoria
        const randomImage = await MediaManager.loadRandomImage(CONFIG.RESOURCES.ENTRY_IMAGES);
        entryImage.src = randomImage;
        entryImage.style.display = 'block';

        // Después de un momento, mostrar video
        setTimeout(async () => {
            entryImage.style.display = 'none';
            const randomVideo = await MediaManager.loadRandomVideo(CONFIG.RESOURCES.ENTRY_VIDEOS);
            entryVideo.src = randomVideo;
            entryVideo.style.display = 'block';
            entryVideo.play();

            // Cuando termine el video, mostrar imagen de cuidar el pino
            entryVideo.addEventListener('ended', () => {
                entryVideo.style.display = 'none';
                console.log('Video terminado, mostrando imagen de cuidar el pino');
                this.showCarePineScreen();
            });
        }, 2000);
    }

    showCarePineScreen() {
        // Cambiar a la pantalla de cuidar el pino
        this.stateManager.setState('care-pine');
        
        // Configurar la imagen directamente
        const carePineImage = document.getElementById('care-pine-image');
        if (carePineImage) {
            carePineImage.src = './Recursos/EntradaAlPino/cuidaelpino.jpg';
            console.log('🌲 Imagen de cuidar el pino configurada');
        } else {
            console.error('❌ No se encontró el elemento care-pine-image');
        }
        
        console.log('🌲 Mostrando imagen de cuidar el pino por 3 segundos');
        
        // Después de 3 segundos, ir a la pantalla principal
        setTimeout(() => {
            console.log('Tiempo terminado, yendo a pantalla principal');
            this.stateManager.setState('main');
            this.initializeMainScreen();
            
            // Iniciar música de fondo cuando llegamos a la pantalla principal
            MediaManager.startBackgroundMusic();
        }, CONFIG.TIMERS.CARE_PINE_DISPLAY);
    }

    initializeMainScreen() {
        console.log('🎄 Inicializando pantalla principal - creando regalos');
        this.createGifts();
    }

    createGifts() {
        const giftsContainer = document.getElementById('gifts-container');
        const containerRect = giftsContainer.getBoundingClientRect();
        
        // Generar posiciones aleatorias sin superposición
        const positions = RandomGenerator.generateNonOverlappingPositions(
            7, 
            containerRect.width, 
            containerRect.height
        );

        positions.forEach((pos, index) => {
            const gift = document.createElement('img');
            gift.className = 'gift';
            gift.src = './Recursos/Principal/RegaloCerrado.png';
            gift.style.left = pos.x + 'px';
            gift.style.top = pos.y + 'px';
            gift.dataset.giftIndex = index;

            // Event listeners para hover
            gift.addEventListener('mouseenter', () => {
                if (!this.stateManager.openedGifts.has(index)) {
                    gift.src = './Recursos/Principal/RegaloAbierto.png';
                }
            });

            gift.addEventListener('mouseleave', () => {
                if (!this.stateManager.openedGifts.has(index)) {
                    gift.src = './Recursos/Principal/RegaloCerrado.png';
                }
            });

            // Event listener para click
            gift.addEventListener('click', () => {
                if (!this.stateManager.openedGifts.has(index) && !this.stateManager.isInteractionBlocked) {
                    this.openGift(index, gift);
                }
            });

            giftsContainer.appendChild(gift);
        });
    }

    async openGift(giftIndex, giftElement) {
        // Marcar regalo como abierto
        this.stateManager.addOpenedGift(giftIndex);
        
        // Animar desaparición del regalo
        giftElement.classList.add('opened');
        setTimeout(() => {
            giftElement.style.display = 'none';
        }, 500);

        // Obtener imagen y mensaje específicos (sin repetir imágenes)
        const giftData = await MediaManager.loadRandomGiftWithMessage(this.stateManager);
        
        console.log(`Regalo ${giftIndex} abierto: ${giftData.fileName} - "${giftData.message}"`);
        
        this.showGiftModal(giftIndex, giftData.imagePath, giftData.message);

        // Verificar si todos los regalos están abiertos
        if (this.stateManager.areAllGiftsOpened()) {
            setTimeout(() => {
                this.startFinalSequence();
            }, 2000);
        }
    }

    async startFinalSequence() {
        // Reproducir video final aleatorio
        const finalVideo = document.getElementById('final-video');
        const randomVideo = await MediaManager.loadRandomVideo(CONFIG.RESOURCES.CHRISTMAS_VIDEOS);
        
        finalVideo.src = randomVideo;
        finalVideo.classList.remove('hidden');
        finalVideo.play();

        // Cuando termine el video, mostrar la carta
        finalVideo.addEventListener('ended', () => {
            finalVideo.classList.add('hidden');
            this.showLetter();
        });
    }

    showLetter() {
        const letterContainer = document.getElementById('letter-container');
        const letter = document.getElementById('letter');
        const letterFinalImg = document.getElementById('letter-final-img');
        
        // Configurar la imagen final en la carta directamente
        letterFinalImg.src = './Recursos/ParaElFinal/yoquelerlamucho.jpeg';
        console.log('💌 Imagen final configurada en la carta');
        
        letterContainer.classList.remove('hidden');
        
        // Event listener para abrir la carta (solo una vez)
        letter.removeEventListener('click', this.letterClickHandler);
        this.letterClickHandler = () => {
            this.stateManager.setState('letter');
        };
        letter.addEventListener('click', this.letterClickHandler);
        
        console.log('💌 Carta mostrada con imagen final');
    }

    showNegativeModal() {
        const index = this.stateManager.negativeClickCount - 1; // Usar el contador de clicks
        
        // Si es la novena imagen (click 9, índice 8), mostrar pantalla completa
        if (index === 8) {
            this.showFullScreenFinalSequence();
            return;
        }
        
        const modal = document.getElementById('negative-modal');
        const modalContent = modal.querySelector('.modal-content');
        const image = document.getElementById('negative-modal-image');
        const message = document.getElementById('negative-modal-message');
        const closeButton = document.getElementById('negative-modal-close');

        // Configurar la imagen según el índice
        const imageExtensions = ['jpg', 'jpg', 'jpeg', 'jpg', 'jpeg', 'jpg', 'jpg', 'jpeg', 'gif'];
        const imagePath = `./Recursos/ParaLaDesicionNegativa/${index + 1}.${imageExtensions[index]}`;
        
        image.src = imagePath;
        message.textContent = CONFIG.NEGATIVE_MESSAGES[index];

        // Asegurar que el botón esté visible para las primeras 8 imágenes
        modalContent.classList.remove('blocked');
        closeButton.style.display = 'block';

        // Mostrar modal
        modal.classList.remove('hidden');
        
        console.log(`Mostrando modal negativo ${index + 1} de 9`);
    }

    showFullScreenFinalSequence() {
        // Ocultar modal normal
        const modal = document.getElementById('negative-modal');
        modal.classList.add('hidden');
        
        // Crear pantalla completa para la secuencia final
        const fullScreenDiv = document.createElement('div');
        fullScreenDiv.id = 'fullscreen-final';
        fullScreenDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;

        // Agregar GIF
        const gif = document.createElement('img');
        gif.src = './Recursos/ParaLaDesicionNegativa/9.gif';
        gif.style.cssText = `
            max-width: 100%;
            max-height: 70%;
            object-fit: contain;
        `;

        // Agregar mensaje final
        const finalMessage = document.createElement('div');
        finalMessage.textContent = 'te chingas ahora XDDD';
        finalMessage.style.cssText = `
            color: #ff0000;
            font-size: 3rem;
            font-weight: bold;
            font-family: 'Comic Sans MS', cursive;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            margin-top: 2rem;
            animation: pulse 2s infinite;
            text-align: center;
        `;

        fullScreenDiv.appendChild(gif);
        fullScreenDiv.appendChild(finalMessage);
        document.body.appendChild(fullScreenDiv);

        // Reproducir audio en bucle
        const audio = document.getElementById('negative-audio');
        audio.src = './Recursos/ParaLaDesicionNegativa/9.mp3';
        MediaManager.playAudio(audio, true, CONFIG.AUDIO.EFFECTS_VOLUME);
        
        // Detener música de fondo
        MediaManager.stopBackgroundMusic();
        
        // Bloquear todas las interacciones
        this.stateManager.blockInteractions();
        
        console.log('Secuencia final iniciada - pantalla bloqueada');
    }

    closeNegativeModal() {
        const modal = document.getElementById('negative-modal');
        
        // Solo permitir cerrar si no estamos en la novena imagen
        if (this.stateManager.negativeClickCount >= 9) {
            return; // No permitir cerrar en la imagen final
        }
        
        modal.classList.add('hidden');
        
        console.log(`Usuario clickeó "Dale al que sí" después de ${this.stateManager.negativeClickCount} clicks en "No"`);
        
        // NO avanzar al siguiente mensaje - el usuario tendrá que hacer click en "No" otra vez
        // NO resetear los contadores aquí - mantener el progreso
    }
}

// ===== MANEJADOR DE INTERACCIONES =====
class InteractionHandler {
    constructor(stateManager, uiController) {
        this.stateManager = stateManager;
        this.uiController = uiController;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Botones de bienvenida
        const btnYes = document.getElementById('btn-yes');
        const btnNo = document.getElementById('btn-no');

        btnYes.addEventListener('click', () => {
            console.log('Usuario eligió SÍ');
            this.stateManager.setState('entry');
            this.uiController.showEntrySequence();
        });

        btnNo.addEventListener('click', () => {
            console.log('Usuario eligió NO');
            
            // Verificar si ya se alcanzó el límite de clicks
            if (this.stateManager.negativeClickCount >= this.stateManager.maxNegativeClicks) {
                console.log('Límite de clicks alcanzado - botón deshabilitado');
                return;
            }
            
            // Incrementar contador de clicks
            this.stateManager.negativeClickCount++;
            console.log(`Click ${this.stateManager.negativeClickCount} de ${this.stateManager.maxNegativeClicks}`);
            
            // Mostrar modal con la imagen correspondiente al número de click
            this.stateManager.negativeSequenceIndex = this.stateManager.negativeClickCount - 1;
            this.uiController.showNegativeModal();
            
            // Si es el 9º click, deshabilitar el botón
            if (this.stateManager.negativeClickCount >= this.stateManager.maxNegativeClicks) {
                btnNo.disabled = true;
                btnNo.style.opacity = '0.5';
                btnNo.style.cursor = 'not-allowed';
                console.log('Botón "No" deshabilitado después de 9 clicks');
            }
        });

        // Botón para cerrar carta
        const closeLetter = document.getElementById('close-letter');
        closeLetter.addEventListener('click', () => {
            this.stateManager.setState('main');
        });

        // Click en modal para cerrarlo
        const giftModal = document.getElementById('gift-modal');
        giftModal.addEventListener('click', (e) => {
            if (e.target === giftModal) {
                this.uiController.closeGiftModal();
            }
        });

        // Botón para cerrar modal negativo
        const negativeModalClose = document.getElementById('negative-modal-close');
        negativeModalClose.addEventListener('click', () => {
            console.log('Usuario clickeó "Dale al que sí"');
            this.uiController.closeNegativeModal();
            
            // Mantener el progreso - NO resetear contadores
            // El usuario puede seguir clickeando "No" hasta llegar a 9
            this.stateManager.setState('welcome');
        });

        // Prevenir cerrar modal negativo clickeando fuera (excepto en la novena)
        const negativeModal = document.getElementById('negative-modal');
        negativeModal.addEventListener('click', (e) => {
            if (e.target === negativeModal && this.stateManager.negativeSequenceIndex < 8) {
                this.uiController.closeNegativeModal();
            }
        });

        // Tecla ESC para cerrar modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Cerrar modal de regalo
                this.uiController.closeGiftModal();
                
                // Cerrar modal negativo solo si no estamos en la novena imagen
                if (this.stateManager.negativeSequenceIndex < 8) {
                    this.uiController.closeNegativeModal();
                }
            }
        });
    }
}

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
class ChristmasApp {
    constructor() {
        this.stateManager = new StateManager();
        this.uiController = new UIController(this.stateManager);
        this.interactionHandler = new InteractionHandler(this.stateManager, this.uiController);
        
        this.initialize();
    }

    initialize() {
        console.log('🎄 Inicializando Página Feliz Navidad 🎄');
        
        // Configurar estado inicial
        this.stateManager.setState('welcome');
        
        // Precargar recursos críticos si es necesario
        this.preloadCriticalResources();
        
        console.log('✨ Aplicación lista para usar ✨');
    }

    preloadCriticalResources() {
        // Aquí se pueden precargar imágenes y recursos críticos
        // Por ahora, solo registramos que está listo
        console.log('Recursos críticos precargados');
    }
}

// ===== INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎄 DOM cargado - Inicializando Página Feliz Navidad 🎄');
    
    // Crear instancia de la aplicación
    window.christmasApp = new ChristmasApp();
});

// ===== MANEJO DE ERRORES GLOBALES =====
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
    // Aquí se pueden implementar fallbacks o notificaciones de error
});

// ===== UTILIDADES ADICIONALES =====
const Utils = {
    // Función para verificar si un recurso existe
    async resourceExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Función para crear efectos de partículas navideñas
    createChristmasParticles(container, count = 20) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'christmas-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(particle);
        }
    }
};

console.log('🎄 Script de Página Feliz Navidad cargado correctamente 🎄');
