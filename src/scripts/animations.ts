export const initAnimations = () => {
  // BACKGROUND ANIMATION (With Safety Check)
  const canvas = document.getElementById(
    "network-canvas",
  ) as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width: number, height: number;
    let particles: any[] = [];
    const connectionDistance = 150;
    const mouseInteractionRadius = 200;
    const mouseRepelForce = 2;
    let mouse = { x: null as number | null, y: null as number | null };

    window.addEventListener("mousemove", (e) => {
      if (window.innerWidth > 768) {
        mouse.x = e.x;
        mouse.y = e.y;
      } else {
        mouse.x = null;
        mouse.y = null;
      }
    });

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseVx: number;
      baseVy: number;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.baseVx = this.vx;
        this.baseVy = this.vy;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouseInteractionRadius) {
            const force =
              (mouseInteractionRadius - distance) /
              mouseInteractionRadius;
            this.vx -= (dx / distance) * force * mouseRepelForce;
            this.vy -= (dy / distance) * force * mouseRepelForce;
          }
        }
        this.vx += (this.baseVx - this.vx) * 0.05;
        this.vy += (this.baseVy - this.vy) * 0.05;
        if (this.x < 0 || this.x > width) {
          this.vx *= -1;
          this.baseVx *= -1;
        }
        if (this.y < 0 || this.y > height) {
          this.vy *= -1;
          this.baseVy *= -1;
        }
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx!.fill();
      }
    }

    function initParticles() {
      particles = [];
      const adjustedCount = window.innerWidth < 768 ? 40 : 90;
      for (let i = 0; i < adjustedCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < connectionDistance) {
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(5, 152, 206, ${1 - distance / connectionDistance})`;
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });
    resize();
    initParticles();
    animate();
  }
};
