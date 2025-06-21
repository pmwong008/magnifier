const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let mouseX = 0;
let mouseY = 0;
let isMouseMoving = false;
let magnifierOn = false;

document.getElementById('toggleBtn').addEventListener('click', () => {
  magnifierOn = !magnifierOn;
});


navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {

    // Set canvas size based on video aspect ratio
    // const videoAspect = video.videoWidth / video.videoHeight;
    resizeCanvasToVideo();

    // resizeCanvas();
    // canvas.width = video.videoWidth;
    // canvas.height = video.videoHeight;
    draw();
    });
})
.catch(err => {
    console.error('Error accessing webcam:', err);
});


// Track the mouse position globally
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  isMouseMoving = true;
});

document.getElementById('resizeBtn').addEventListener('click', () => {
  resizeCanvasToVideo(); // Recalculate canvas size
});


/* function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas); */

function resizeCanvasToVideo() {
  const videoAspect = video.videoWidth / video.videoHeight;

  const containerWidth = window.innerWidth;
  const containerHeight = window.innerHeight;
  const containerAspect = containerWidth / containerHeight;

  let newWidth, newHeight;

  if (containerAspect > videoAspect) {
    newHeight = containerHeight;
    newWidth = newHeight * videoAspect;
  } else {
    newWidth = containerWidth;
    newHeight = newWidth / videoAspect;
  }

  canvas.width = newWidth;
  canvas.height = newHeight;
}


function draw() {

    const brightness = parseFloat(document.getElementById('brightness').value);
    const contrast = parseFloat(document.getElementById('contrast').value);

    ctx.filter = `brightness(${brightness}) contrast(${contrast})`;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset filter before drawing magnifier
    ctx.filter = 'none';


if (isMouseMoving && magnifierOn) {

    const zoomSize = 200;
    const zoom = 2;

    // Compute the scale ratio between video and canvas
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const scaleX = videoWidth / canvas.width;
    const scaleY = videoHeight / canvas.height;

    // Get source size in video space (half the size at zoom=2)
    const sWidth = zoomSize / zoom * scaleX;
    const sHeight = zoomSize / zoom * scaleY;

    // Scale mouse position from canvas to video space
    const sx = mouseX * scaleX - sWidth / 2;
    const sy = mouseY * scaleY - sHeight / 2;
    // const sx = mouseX * scaleX - zoomSize / (2 * zoom);
    // const sy = mouseY * scaleY - zoomSize / (2 * zoom);

    // Position on canvas 
    const dx = mouseX - zoomSize / 2;
    const dy = mouseY - zoomSize / 2;
    const dWidth = zoomSize;
    const dHeight = zoomSize;

    // Save canvas state
    ctx.save();
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, zoomSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw the zoomed-in video inside the circular area
    ctx.drawImage(
        video, 
        sx, sy, sWidth, sHeight, 
        dx, dy, dWidth, dHeight
    );

  // Restore canvas state to remove clipping
  ctx.restore();

  // Optional: draw circular border
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, zoomSize / 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
}
  requestAnimationFrame(draw);
}
