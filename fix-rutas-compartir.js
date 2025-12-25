// ===== SCRIPT DE CORRECCIÓN DEFINITIVA DE RUTAS =====
// Este script corrige automáticamente las rutas para que funcionen al compartir el proyecto

class RutasFixer {
    constructor() {
        this.workingPath = null;
        this.fixes = [];
    }

    // Detectar la ruta que funciona
    async detectWorkingPath() {
        console.log('🔍 Detectando ruta que funciona...');
        
        const testPaths = [
            './Recursos/',
            'Recursos/',
            './paginafeliznavidadXD/Recursos/',
            'paginafeliznavidadXD/Recursos/',
            '../paginafeliznavidadXD/Recursos/',
            '/paginafeliznavidadXD/Recursos/'
        ];

        for (const path of testPaths) {
            const testUrl = path + 'Principal/SuperPino.png';
            if (await this.testImage(testUrl)) {
                console.log(`✅ Ruta funcional encontrada: ${path}`);
                this.workingPath = path;
                return path;
            }
        }

        console.log('❌ No se encontró ruta funcional');
        return null;
    }

    // Probar si una imagen existe
    async testImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            setTimeout(() => resolve(false), 2000);
        });
    }

    // Aplicar correcciones a elementos HTML
    async applyHTMLFixes() {
        if (!this.workingPath) {
            await this.detectWorkingPath();
        }

        if (!this.workingPath) {
            console.log('❌ No se puede aplicar correcciones sin ruta funcional');
            return false;
        }

        console.log('🔧 Aplicando correcciones HTML...');

        // Corregir SuperPino.png
        const mainPine = document.getElementById('main-pine');
        if (mainPine) {
            const oldSrc = mainPine.src;
            mainPine.src = this.workingPath + 'Principal/SuperPino.png';
            this.fixes.push({
                element: 'SuperPino',
                oldSrc: oldSrc,
                newSrc: mainPine.src,
                success: true
            });
            console.log('   ✅ SuperPino corregido');
        }

        // Corregir CartaCerrada.jpeg
        const letter = document.getElementById('letter');
        if (letter) {
            const oldSrc = letter.src;
            letter.src = this.workingPath + 'Carta/CartaCerrada.jpeg';
            this.fixes.push({
                element: 'Carta Cerrada',
                oldSrc: oldSrc,
                newSrc: letter.src,
                success: true
            });
            console.log('   ✅ Carta cerrada corregida');
        }

        // Corregir fondo CSS
        const mainScreen = document.getElementById('main-screen');
        if (mainScreen) {
            const newBg = `url('${this.workingPath}Principal/fondoXD.webp')`;
            mainScreen.style.backgroundImage = newBg;
            this.fixes.push({
                element: 'Fondo CSS',
                oldSrc: 'CSS background',
                newSrc: newBg,
                success: true
            });
            console.log('   ✅ Fondo CSS corregido');
        }

        // Actualizar CONFIG global
        if (window.CONFIG && window.CONFIG.RESOURCES) {
            const oldConfig = { ...window.CONFIG.RESOURCES };
            
            window.CONFIG.RESOURCES = {
                ...window.CONFIG.RESOURCES,
                ENTRY_IMAGES: this.workingPath + 'EntradaAlPino/Imagenes/',
                ENTRY_VIDEOS: this.workingPath + 'EntradaAlPino/Videos/',
                GIFTS: this.workingPath + 'Regalos/',
                EXPLOSION: this.workingPath + 'Explosion/',
                CHRISTMAS_VIDEOS: this.workingPath + 'VideosNavideños/',
                NEGATIVE_IMAGES: this.workingPath + 'ParaLaDesicionNegativa/',
                MAIN_PINE: this.workingPath + 'Principal/SuperPino.png',
                BACKGROUND: this.workingPath + 'Principal/fondoXD.webp',
                CARE_PINE: this.workingPath + 'EntradaAlPino/cuidaelpino.jpg',
                LETTER: this.workingPath + 'Carta/CartaCerrada.jpeg',
                LETTER_OPEN: this.workingPath + 'Carta/CartaAbierta.png',
                FINAL_IMAGE: this.workingPath + 'ParaElFinal/yoquelerlamucho.jpeg',
                BACKGROUND_MUSIC: this.workingPath + 'Musica/001.mp3'
            };

            this.fixes.push({
                element: 'CONFIG Global',
                oldSrc: 'Configuración anterior',
                newSrc: 'Configuración actualizada',
                success: true
            });
            console.log('   ✅ CONFIG global actualizado');
        }

        return true;
    }

    // Verificar que las correcciones funcionaron
    async verifyFixes() {
        console.log('🔍 Verificando correcciones...');
        
        const criticalImages = [
            { name: 'SuperPino', url: this.workingPath + 'Principal/SuperPino.png' },
            { name: 'Carta Cerrada', url: this.workingPath + 'Carta/CartaCerrada.jpeg' },
            { name: 'Carta Abierta', url: this.workingPath + 'Carta/CartaAbierta.png' },
            { name: 'Imagen Final', url: this.workingPath + 'ParaElFinal/yoquelerlamucho.jpeg' },
            { name: 'Cuidar Pino', url: this.workingPath + 'EntradaAlPino/cuidaelpino.jpg' }
        ];

        const results = [];
        for (const image of criticalImages) {
            const works = await this.testImage(image.url);
            results.push({ ...image, works });
            console.log(`   ${works ? '✅' : '❌'} ${image.name}: ${works ? 'OK' : 'FALLA'}`);
        }

        const successCount = results.filter(r => r.works).length;
        console.log(`📊 Verificación: ${successCount}/${results.length} imágenes funcionan`);

        return results;
    }

    // Mostrar reporte de correcciones
    showReport() {
        console.log('\n📋 REPORTE DE CORRECCIONES');
        console.log('============================');
        
        if (this.workingPath) {
            console.log(`🎯 Ruta base utilizada: ${this.workingPath}`);
        }
        
        console.log(`🔧 Total de correcciones aplicadas: ${this.fixes.length}`);
        
        this.fixes.forEach((fix, index) => {
            console.log(`${index + 1}. ${fix.element}: ${fix.success ? '✅' : '❌'}`);
            if (fix.newSrc !== 'Configuración actualizada') {
                console.log(`   Nueva ruta: ${fix.newSrc}`);
            }
        });

        // Mostrar en la página si existe un elemento para ello
        const reportDiv = document.getElementById('fix-report');
        if (reportDiv) {
            let html = `
                <h3>📋 Reporte de Correcciones</h3>
                <p><strong>Ruta base:</strong> <code>${this.workingPath || 'No detectada'}</code></p>
                <p><strong>Correcciones aplicadas:</strong> ${this.fixes.length}</p>
                <ul>
            `;
            
            this.fixes.forEach(fix => {
                html += `<li>${fix.success ? '✅' : '❌'} ${fix.element}</li>`;
            });
            
            html += '</ul>';
            reportDiv.innerHTML = html;
        }
    }

    // Ejecutar corrección completa
    async runCompleteFix() {
        console.log('🚀 Iniciando corrección completa de rutas...');
        
        try {
            // Detectar ruta funcional
            const workingPath = await this.detectWorkingPath();
            if (!workingPath) {
                console.log('❌ No se pudo detectar una ruta funcional');
                return false;
            }

            // Aplicar correcciones
            const fixesApplied = await this.applyHTMLFixes();
            if (!fixesApplied) {
                console.log('❌ No se pudieron aplicar las correcciones');
                return false;
            }

            // Verificar correcciones
            await this.verifyFixes();

            // Mostrar reporte
            this.showReport();

            console.log('✅ Corrección completa finalizada');
            return true;

        } catch (error) {
            console.error('❌ Error durante la corrección:', error);
            return false;
        }
    }
}

// Función de inicialización global
async function fixRutasCompartir() {
    const fixer = new RutasFixer();
    return await fixer.runCompleteFix();
}

// Auto-ejecutar si se carga el script
if (typeof window !== 'undefined') {
    // Exportar para uso global
    window.RutasFixer = RutasFixer;
    window.fixRutasCompartir = fixRutasCompartir;
    
    console.log('🔧 Script de corrección de rutas cargado');
    console.log('💡 Ejecuta fixRutasCompartir() para corregir las rutas automáticamente');
}

// Si se ejecuta directamente cuando el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 Auto-ejecutando corrección de rutas...');
        fixRutasCompartir();
    });
} else {
    // DOM ya está listo
    setTimeout(() => {
        console.log('🔧 Auto-ejecutando corrección de rutas...');
        fixRutasCompartir();
    }, 100);
}