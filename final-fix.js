// ===== CORRECCIÓN FINAL PARA FUNCIONALIDADES NUEVAS =====
// Este script se ejecuta al final para asegurar que todo funcione correctamente

class FinalFix {
    constructor() {
        this.workingBasePath = null;
        this.fixes = [];
    }

    async detectWorkingBasePath() {
        console.log('🔍 Detectando ruta base que funciona...');
        
        const testPaths = [
            './Recursos/',
            'Recursos/',
            './paginafeliznavidadXD/Recursos/',
            'paginafeliznavidadXD/Recursos/',
            '../paginafeliznavidadXD/Recursos/',
            '/paginafeliznavidadXD/Recursos/'
        ];

        // Probar con SuperPino.png como referencia
        for (const basePath of testPaths) {
            const testUrl = basePath + 'Principal/SuperPino.png';
            if (await this.testResource(testUrl)) {
                console.log(`✅ Ruta base funcional: ${basePath}`);
                this.workingBasePath = basePath;
                return basePath;
            }
        }

        console.log('❌ No se encontró ruta base funcional');
        this.workingBasePath = './Recursos/'; // Fallback
        return this.workingBasePath;
    }

    async testResource(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            setTimeout(() => resolve(false), 2000);
        });
    }

    async applyAllFixes() {
        if (!this.workingBasePath) {
            await this.detectWorkingBasePath();
        }

        console.log('🔧 Aplicando correcciones finales...');

        // 1. Corregir imagen de cuidar el pino
        this.fixCarePineImage();

        // 2. Corregir imagen final de la carta
        this.fixFinalImage();

        // 3. Corregir música de fondo
        this.fixBackgroundMusic();

        // 4. Actualizar CONFIG global
        this.updateGlobalConfig();

        // 5. Verificar que las pantallas existan
        this.verifyScreens();

        console.log('✅ Correcciones finales aplicadas');
        return this.fixes;
    }

    fixCarePineImage() {
        const carePineImage = document.getElementById('care-pine-image');
        if (carePineImage) {
            const newSrc = this.workingBasePath + 'EntradaAlPino/cuidaelpino.jpg';
            carePineImage.src = newSrc;
            this.fixes.push({ element: 'care-pine-image', src: newSrc, success: true });
            console.log('   ✅ Imagen cuidar el pino corregida:', newSrc);
        } else {
            this.fixes.push({ element: 'care-pine-image', src: 'N/A', success: false });
            console.log('   ❌ Elemento care-pine-image no encontrado');
        }
    }

    fixFinalImage() {
        const finalImage = document.getElementById('letter-final-img');
        if (finalImage) {
            const newSrc = this.workingBasePath + 'ParaElFinal/yoquelerlamucho.jpeg';
            finalImage.src = newSrc;
            this.fixes.push({ element: 'letter-final-img', src: newSrc, success: true });
            console.log('   ✅ Imagen final de carta corregida:', newSrc);
        } else {
            this.fixes.push({ element: 'letter-final-img', src: 'N/A', success: false });
            console.log('   ❌ Elemento letter-final-img no encontrado');
        }
    }

    fixBackgroundMusic() {
        const backgroundMusic = document.getElementById('background-music');
        if (backgroundMusic) {
            const newSrc = this.workingBasePath + 'Musica/001.mp3';
            backgroundMusic.src = newSrc;
            backgroundMusic.volume = 0.15;
            backgroundMusic.loop = true;
            this.fixes.push({ element: 'background-music', src: newSrc, success: true });
            console.log('   ✅ Música de fondo corregida:', newSrc);
        } else {
            this.fixes.push({ element: 'background-music', src: 'N/A', success: false });
            console.log('   ❌ Elemento background-music no encontrado');
        }
    }

    updateGlobalConfig() {
        if (window.CONFIG && window.CONFIG.RESOURCES) {
            window.CONFIG.RESOURCES.CARE_PINE = this.workingBasePath + 'EntradaAlPino/cuidaelpino.jpg';
            window.CONFIG.RESOURCES.FINAL_IMAGE = this.workingBasePath + 'ParaElFinal/yoquelerlamucho.jpeg';
            window.CONFIG.RESOURCES.BACKGROUND_MUSIC = this.workingBasePath + 'Musica/001.mp3';
            
            this.fixes.push({ element: 'CONFIG', src: 'Updated', success: true });
            console.log('   ✅ CONFIG global actualizado');
        } else {
            this.fixes.push({ element: 'CONFIG', src: 'N/A', success: false });
            console.log('   ❌ CONFIG global no encontrado');
        }
    }

    verifyScreens() {
        const screens = [
            'welcome-screen',
            'entry-screen',
            'care-pine-screen',
            'main-screen',
            'letter-screen',
            'negative-screen'
        ];

        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                this.fixes.push({ element: screenId, src: 'Exists', success: true });
                console.log(`   ✅ Pantalla ${screenId} encontrada`);
            } else {
                this.fixes.push({ element: screenId, src: 'Missing', success: false });
                console.log(`   ❌ Pantalla ${screenId} no encontrada`);
            }
        });
    }

    showReport() {
        console.log('\n📋 REPORTE DE CORRECCIONES FINALES');
        console.log('====================================');
        
        const successful = this.fixes.filter(f => f.success).length;
        const total = this.fixes.length;
        
        console.log(`🎯 Ruta base utilizada: ${this.workingBasePath}`);
        console.log(`📊 Correcciones exitosas: ${successful}/${total}`);
        
        this.fixes.forEach((fix, index) => {
            const status = fix.success ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${fix.element}: ${fix.src}`);
        });

        if (successful === total) {
            console.log('🎉 ¡Todas las correcciones aplicadas exitosamente!');
        } else {
            console.log('⚠️ Algunas correcciones fallaron. Revisa la consola para más detalles.');
        }
    }
}

// Función para ejecutar corrección final
async function runFinalFix() {
    console.log('🚀 Iniciando corrección final...');
    
    const fixer = new FinalFix();
    const fixes = await fixer.applyAllFixes();
    fixer.showReport();
    
    return fixes;
}

// Auto-ejecutar si se carga el script
if (typeof window !== 'undefined') {
    window.FinalFix = FinalFix;
    window.runFinalFix = runFinalFix;
    
    console.log('🔧 Sistema de corrección final cargado');
    
    // Ejecutar después de que todo esté listo
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runFinalFix, 2000); // Esperar 2 segundos para que otros scripts se carguen
    });
}

console.log('📦 Final Fix cargado correctamente');