import { useRef, useEffect } from "react";

const CUBES = 40;

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Cubos con posición, tamaño, velocidad y color
    const cubes = Array.from({ length: CUBES }, () => ({
      x: random(0, width),
      y: random(0, height),
      size: random(20, 60),
      dx: random(-1, 1),
      dy: random(-1, 1),
      color: `rgba(${random(100,255)},${random(100,255)},${random(100,255)},0.15)`
    }));

    function animate() {
      ctx!.clearRect(0, 0, width, height);
      cubes.forEach(cube => {
        ctx!.fillStyle = cube.color;
        ctx!.fillRect(cube.x, cube.y, cube.size, cube.size);

        cube.x += cube.dx;
        cube.y += cube.dy;

        // Rebote en los bordes
        if (cube.x < 0 || cube.x + cube.size > width) cube.dx *= -1;
        if (cube.y < 0 || cube.y + cube.size > height) cube.dy *= -1;
      });
      requestAnimationFrame(animate);
    }

    animate();

    // Ajustar tamaño al redimensionar
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
    />
  );
};

export default AnimatedBackground;