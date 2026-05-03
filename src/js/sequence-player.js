
export class SequencePlayer {
    constructor(canvasId, frameCount, pathTemplate) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.frameCount = frameCount;
        this.pathTemplate = pathTemplate;
        this.images = [];
        this.currentFrame = 0;
        this.isLoaded = false;
        this.fps = 24;
        this.lastTime = 0;
        this.interval = 1000 / this.fps;

        this.init();
    }

    async init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        
        // Start loading images, but don't wait for all of them
        this.preloadImages();
        
        // Wait for a buffer of frames to be ready before starting animation
        await this.waitForBuffer(30);
        this.animate(0);
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.isLoaded) {
            this.renderFrame(this.currentFrame);
        }
    }

    async preloadImages() {
        for (let i = 0; i < this.frameCount; i++) {
            const path = this.pathTemplate(i);
            const img = new Image();
            img.src = path;
            
            this.images.push({
                img: img,
                loaded: false
            });

            img.onload = () => {
                this.images[i].loaded = true;
                if (i === this.frameCount - 1) {
                    this.isLoaded = true;
                    console.log('All frames loaded');
                }
            };
            img.onerror = () => {
                this.images[i].loaded = true; // Mark as done even if error to avoid blocking
            };
        }
    }

    async waitForBuffer(count) {
        return new Promise((resolve) => {
            const check = () => {
                const loadedCount = this.images.filter(img => img.loaded).length;
                if (loadedCount >= count) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    renderFrame(index) {
        const frame = this.images[index];
        if (!frame || !frame.loaded) return;
        
        const img = frame.img;
        const canvasAspect = this.canvas.width / this.canvas.height;
        const imgAspect = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
            drawWidth = this.canvas.width;
            drawHeight = this.canvas.width / imgAspect;
            offsetX = 0;
            offsetY = (this.canvas.height - drawHeight) / 2;
        } else {
            drawHeight = this.canvas.height;
            drawWidth = this.canvas.height * imgAspect;
            offsetX = (this.canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    animate(time) {
        requestAnimationFrame((t) => this.animate(t));

        const deltaTime = time - this.lastTime;
        if (deltaTime > this.interval) {
            this.lastTime = time - (deltaTime % this.interval);
            this.renderFrame(this.currentFrame);
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        }
    }
}

// Initialize the player
const pathTemplate = (i) => {
    const frameNumber = String(i).padStart(3, '0');
    return `/ezgif-split/frame_${frameNumber}_delay-0.041s.webp`;
};

new SequencePlayer('sequence-canvas', 192, pathTemplate);
