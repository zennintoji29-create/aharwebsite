
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
        await this.preloadImages();
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
        const loadPromises = [];
        for (let i = 0; i < this.frameCount; i++) {
            const path = this.pathTemplate(i);
            const img = new Image();
            img.src = path;
            const promise = new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Skip failed images
            });
            loadPromises.push(promise);
            this.images.push(img);
        }

        await Promise.all(loadPromises);
        this.isLoaded = true;
        console.log('All frames loaded');
    }

    renderFrame(index) {
        if (!this.images[index]) return;
        
        const img = this.images[index];
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
