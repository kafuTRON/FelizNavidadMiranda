// ===== CONFIGURACIÓN AUTOMÁTICA DE RUTAS =====
// Este archivo detecta automáticamente la ruta correcta para los recursos

class AutoPathConfig {
    constructor() {
        this.detectedBasePath = null;
        this.isInitialized = false;
    }

    // Detectar automáticamente la ruta base correcta
    async detectBasePath() {
        console.log('🔍 Detectando ruta base automáticamente...');
        
        const testPaths = [
            './Recursos/',                      // Ruta relativa normal
            'Recursos/',                       // Sin punto
            './paginafeliznavidadXD/Recursos/', // Desde raíz del proyecto
            'paginafeliznavidadXD/Recursos/',  // Sin punto desde raíz
            '../paginafeliznavidadXD/Recursos/', // Desde carpeta padre
            '/paginafeliznavidadXD/Recursos/',  // Ruta absoluta
        ];

        // Probar con SuperPino.png como imagen de referencia
        for (const basePath of testPaths) {
            const testUrl = basePath + 'Principal/SuperPino.png';
            console.log(`   Probando: ${testUrl}`);
            
            if (await this.testImageExists(testUrl)) {
                console.log(`   ✅ Ruta encontrada: ${basePath}`);
                this.detectedBasePath = basePath;
                return basePath;
            }
        }

        console.log('   ❌ No se encontró ninguna ruta válida');
        this.detectedBasePath = './Recursos/'; // Fallback
        return this.detectedBasePath;
    }

    // Probar si una imagen existe
    async testImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            
            // Timeout de 2 segundos
            setTimeout(() => resolve(false), 2000);
        });
    }

    // Obtener la configuración completa de rutas
    async getConfig() {
        if (!this.isInitialized) {
            await this.detectBasePath();
            this.isInitialized = true;
        }

        const basePath = this.detectedBasePath;
        
        return {
            BASE_PATH: basePath,
            RESOURCES: {
                ENTRY_IMAGES: basePath + 'EntradaAlPino/Imagenes/',
                ENTRY_VIDEOS: basePath + 'EntradaAlPino/Videos/',
                GIFTS: basePath + 'Regalos/',
                EXPLOSION: basePath + 'Explosion/',
                CHRISTMAS_VIDEOS: basePath + 'VideosNavideños/',
                NEGATIVE_IMAGES: basePath + 'ParaLaDesicionNegativa/',
                MAIN_PINE: basePath + 'Principal/SuperPino.png',
                BACKGROUND: basePath + 'Principal/fondoXD.webp',
                CARE_PINE: basePath + 'EntradaAlPino/cuidaelpino.jpg',
                LETTER_CLOSED: basePath + 'Carta/CartaCerrada.jpeg',
                LETTER_OPEN: basePath + 'Carta/CartaAbierta.png',
                GIFT_CLOSED: basePath + 'Principal/RegaloCerrado.png',
                GIFT_OPEN: basePath + 'Principal/RegaloAbierto.png',
                EXPLOSION_GIF: basePath + 'Explosion/deltarune-explosion.gif',
                EXPLOSION_SOUND: basePath + 'Explosion/ExplosionDeltaruneFX.mp3',
                FINAL_IMAGE: basePath + 'ParaElFinal/yoquelerlamucho.jpeg',
                BACKGROUND_MUSIC: basePath + 'Musica/001.mp3'
            }
        };
    }

    // Actualizar elementos HTML con las rutas correctas
    async updateHTMLElements() {
        const config = await this.getConfig();
        console.log('🔄 Actualizando elementos HTML con rutas detectadas...');

        // Actualizar imagen principal del pino
        const mainPine = document.getElementById('main-pine');
        if (mainPine) {
            mainPine.src = config.RESOURCES.MAIN_PINE;
            console.log('   ✅ SuperPino actualizado:', config.RESOURCES.MAIN_PINE);
        }

        // Actualizar imagen de la carta cerrada
        const letter = document.getElementById('letter');
        if (letter) {
            letter.src = config.RESOURCES.LETTER_CLOSED;
            console.log('   ✅ Carta cerrada actualizada:', config.RESOURCES.LETTER_CLOSED);
        }

        // Actualizar imagen final de la carta
        const letterFinalImg = document.getElementById('letter-final-img');
        if (letterFinalImg) {
            letterFinalImg.src = config.RESOURCES.FINAL_IMAGE;
            console.log('   ✅ Imagen final de carta actualizada:', config.RESOURCES.FINAL_IMAGE);
        }

        // Actualizar imagen de cuidar el pino
        const carePineImage = document.getElementById('care-pine-image');
        if (carePineImage) {
            carePineImage.src = config.RESOURCES.CARE_PINE;
            console.log('   ✅ Imagen de cuidar el pino actualizada:', config.RESOURCES.CARE_PINE);
        }

        // Actualizar música de fondo
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
            backgroundMusic.src = config.RESOURCES.BACKGROUND_MUSIC;
            console.log('   ✅ Música de fondo actualizada:', config.RESOURCES.BACKGROUND_MUSIC);
        }

        // Actualizar fondo CSS
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = `url('${config.RESOURCES.BACKGROUND}')`;
            console.log('   ✅ Fondo actualizado:', config.RESOURCES.BACKGROUND);
        }

        // Actualizar CONFIG global si existe
        if (window.CONFIG) {
            window.CONFIG.RESOURCES = config.RESOURCES;
            console.log('   ✅ CONFIG global actualizado');
        }

        return config;
    }

    // Verificar que todas las imágenes críticas cargan correctamente
    async verifyAllImages() {
        const config = await this.getConfig();
        const criticalImages = [
            { name: 'SuperPino', url: config.RESOURCES.MAIN_PINE },
            { name: 'Carta Cerrada', url: config.RESOURCES.LETTER_CLOSED },
            { name: 'Carta Abierta', url: config.RESOURCES.LETTER_OPEN },
            { name: 'Regalo Cerrado', url: config.RESOURCES.GIFT_CLOSED },
            { name: 'Regalo Abierto', url: config.RESOURCES.GIFT_OPEN },
            { name: 'Imagen Final', url: config.RESOURCES.FINAL_IMAGE },
            { name: 'Cuidar Pino', url: config.RESOURCES.CARE_PINE }
        ];

        console.log('🔍 Verificando imágenes críticas...');
        const results = [];

        for (const image of criticalImages) {
            const exists = await this.testImageExists(image.url);
            results.push({ ...image, exists });
            console.log(`   ${exists ? '✅' : '❌'} ${image.name}: ${image.url}`);
        }

        const successCount = results.filter(r => r.exists).length;
        console.log(`📊 Resultado: ${successCount}/${results.length} imágenes verificadas`);

        return results;
    }
}

// Función de inicialización global
async function initAutoPathConfig() {
    console.log('🚀 Iniciando configuración automática de rutas...');
    
    const pathConfig = new AutoPathConfig();
    const config = await pathConfig.updateHTMLElements();
    
    // Verificar que todo funciona
    await pathConfig.verifyAllImages();
    
    console.log('✅ Configuración automática completada');
    console.log('📋 Configuración final:', config);
    
    return config;
}

// Exportar para uso global
window.AutoPathConfig = AutoPathConfig;
window.initAutoPathConfig = initAutoPathConfig;

console.log('📦 Sistema de configuración automática de rutas cargado');