// ===== SISTEMA DE CORRECCIÓN DE RUTAS =====
// Este script detecta automáticamente las rutas correctas para las imágenes

class PathResolver {
    constructor() {
        this.basePaths = [
            './Recursos/',           // Ruta relativa normal
            'Recursos/',            // Sin punto
            './paginafeliznavidadXD/Recursos/',  // Desde raíz del proyecto
            'paginafeliznavidadXD/Recursos/',   // Sin punto desde raíz
            '../paginafeliznavidadXD/Recursos/',  // Desde carpeta padre
            '../PaginaFelizNaviadadXD/Recursos/', // Carpeta con mayúsculas
            '/paginafeliznavidadXD/Recursos/',   // Ruta absoluta
        ];
        this.resolvedPaths = new Map();
        this.testResults = new Map();
    }

    // Probar si una imagen existe en una ruta específica
    async testImagePath(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
            
            // Timeout después de 3 segundos
            setTimeout(() => resolve(false), 3000);
        });
    }

    // Encontrar la ruta correcta para un recurso específico
    async findCorrectPath(resourcePath) {
        console.log(`🔍 Buscando ruta correcta para: ${resourcePath}`);
        
        for (const basePath of this.basePaths) {
            const fullPath = basePath + resourcePath;
            console.log(`   Probando: ${fullPath}`);
            
            const exists = await this.testImagePath(fullPath);
            if (exists) {
                console.log(`   ✅ Encontrada: ${fullPath}`);
                this.resolvedPaths.set(resourcePath, basePath);
                return fullPath;
            } else {
                console.log(`   ❌ No funciona: ${fullPath}`);
            }
        }
        
        console.log(`   ⚠️ No se encontró ruta válida para: ${resourcePath}`);
        return null;
    }

    // Resolver todas las rutas críticas
    async resolveAllPaths() {
        const criticalResources = [
            'Principal/SuperPino.png',
            'Carta/CartaCerrada.jpeg',
            'Carta/CartaAbierta.png',
            'Principal/RegaloCerrado.png',
            'Principal/RegaloAbierto.png',
            'Principal/fondoXD.webp',
            'EntradaAlPino/cuidaelpino.jpg',
            'ParaElFinal/yoquelerlamucho.jpeg',
            'Musica/001.mp3'
        ];

        console.log('🚀 Iniciando resolución de rutas...');
        
        for (const resource of criticalResources) {
            const resolvedPath = await this.findCorrectPath(resource);
            this.testResults.set(resource, resolvedPath !== null);
        }

        this.logResults();
        return this.getWorkingBasePath();
    }

    // Obtener la ruta base que funciona
    getWorkingBasePath() {
        const pathCounts = new Map();
        
        for (const [resource, basePath] of this.resolvedPaths) {
            pathCounts.set(basePath, (pathCounts.get(basePath) || 0) + 1);
        }

        let bestPath = './Recursos/';
        let maxCount = 0;
        
        for (const [path, count] of pathCounts) {
            if (count > maxCount) {
                maxCount = count;
                bestPath = path;
            }
        }

        console.log(`🎯 Mejor ruta base encontrada: ${bestPath} (${maxCount} recursos)`);
        return bestPath;
    }

    // Mostrar resultados en consola
    logResults() {
        console.log('\n📊 RESULTADOS DE PRUEBAS DE RUTAS:');
        console.log('=====================================');
        
        for (const [resource, success] of this.testResults) {
            const status = success ? '✅' : '❌';
            const resolvedPath = this.resolvedPaths.get(resource) || 'NO ENCONTRADA';
            console.log(`${status} ${resource} -> ${resolvedPath}`);
        }
        
        const successCount = Array.from(this.testResults.values()).filter(Boolean).length;
        const totalCount = this.testResults.size;
        
        console.log(`\n📈 Resumen: ${successCount}/${totalCount} recursos encontrados`);
        
        if (successCount === totalCount) {
            console.log('🎉 ¡Todas las rutas funcionan correctamente!');
        } else if (successCount === 0) {
            console.log('⚠️ PROBLEMA: Ninguna ruta funciona. Verifica la estructura de carpetas.');
        } else {
            console.log('⚠️ Algunas rutas no funcionan. Revisa la estructura.');
        }
    }

    // Actualizar CONFIG con las rutas correctas
    updateConfig(workingBasePath) {
        if (window.CONFIG) {
            console.log(`🔧 Actualizando CONFIG con ruta base: ${workingBasePath}`);
            
            window.CONFIG.RESOURCES = {
                ENTRY_IMAGES: workingBasePath + 'EntradaAlPino/Imagenes/',
                ENTRY_VIDEOS: workingBasePath + 'EntradaAlPino/Videos/',
                GIFTS: workingBasePath + 'Regalos/',
                EXPLOSION: workingBasePath + 'Explosion/',
                CHRISTMAS_VIDEOS: workingBasePath + 'VideosNavideños/',
                NEGATIVE_IMAGES: workingBasePath + 'ParaLaDesicionNegativa/',
                MAIN_PINE: workingBasePath + 'Principal/SuperPino.png',
                BACKGROUND: workingBasePath + 'Principal/fondoXD.webp',
                CARE_PINE: workingBasePath + 'EntradaAlPino/cuidaelpino.jpg',
                LETTER: workingBasePath + 'Carta/CartaCerrada.jpeg',
                LETTER_OPEN: workingBasePath + 'Carta/CartaAbierta.png',
                FINAL_IMAGE: workingBasePath + 'ParaElFinal/yoquelerlamucho.jpeg',
                BACKGROUND_MUSIC: workingBasePath + 'Musica/001.mp3'
            };
            
            console.log('✅ CONFIG actualizado correctamente');
        }
    }
}

// Función para inicializar la corrección de rutas
async function initializePathFix() {
    console.log('🔧 Iniciando corrección automática de rutas...');
    
    const resolver = new PathResolver();
    const workingBasePath = await resolver.resolveAllPaths();
    
    // Actualizar CONFIG si existe
    resolver.updateConfig(workingBasePath);
    
    // Actualizar elementos HTML existentes
    updateHTMLElements(workingBasePath);
    
    console.log('✅ Corrección de rutas completada');
    return workingBasePath;
}

// Actualizar elementos HTML con las rutas correctas
function updateHTMLElements(basePath) {
    console.log('🔄 Actualizando elementos HTML...');
    
    // Actualizar imagen principal del pino
    const mainPine = document.getElementById('main-pine');
    if (mainPine) {
        mainPine.src = basePath + 'Principal/SuperPino.png';
        console.log('   ✅ SuperPino actualizado');
    }
    
    // Actualizar imagen de la carta
    const letter = document.getElementById('letter');
    if (letter) {
        letter.src = basePath + 'Carta/CartaCerrada.jpeg';
        console.log('   ✅ Carta actualizada');
    }
    
    // Actualizar imagen final de la carta
    const letterFinalImg = document.getElementById('letter-final-img');
    if (letterFinalImg) {
        letterFinalImg.src = basePath + 'ParaElFinal/yoquelerlamucho.jpeg';
        console.log('   ✅ Imagen final de carta actualizada');
    }
    
    // Actualizar imagen de cuidar el pino
    const carePineImage = document.getElementById('care-pine-image');
    if (carePineImage) {
        carePineImage.src = basePath + 'EntradaAlPino/cuidaelpino.jpg';
        console.log('   ✅ Imagen de cuidar el pino actualizada');
    }
    
    // Actualizar música de fondo
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.src = basePath + 'Musica/001.mp3';
        console.log('   ✅ Música de fondo actualizada');
    }
    
    // Actualizar fondo CSS
    const mainScreen = document.getElementById('main-screen');
    if (mainScreen) {
        mainScreen.style.backgroundImage = `url('${basePath}Principal/fondoXD.webp')`;
        console.log('   ✅ Fondo actualizado');
    }
    
    console.log('✅ Elementos HTML actualizados');
}

// Exportar para uso global
window.PathResolver = PathResolver;
window.initializePathFix = initializePathFix;

console.log('📦 Sistema de corrección de rutas cargado');