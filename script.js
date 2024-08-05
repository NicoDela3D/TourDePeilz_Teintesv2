document.addEventListener("DOMContentLoaded", function () {
    const mainCanvas = document.getElementById('mainCanvas');
    const maskCanvas = document.getElementById('maskCanvas');
    const colorPicker = document.getElementById('color1');

    const mainCtx = mainCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');

    const image = new Image();
    const mask = new Image();

    image.src = 'images/Aerienne - Provisoire.jpg';
    mask.src = 'images/Aerienne - Provisoire Masque toles.jpg';

    image.onload = function () {
        mainCanvas.width = image.width;
        mainCanvas.height = image.height;
        maskCanvas.width = image.width;
        maskCanvas.height = image.height;

        mainCtx.drawImage(image, 0, 0);
        maskCtx.drawImage(mask, 0, 0);

        updateCanvas();
    };

    colorPicker.addEventListener('input', updateCanvas);

    function updateCanvas() {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(image, 0, 0);

        applyMask(maskCtx, colorPicker.value, maskCanvas);
    }

    function applyMask(ctx, color, maskCanvas) {
        const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200 && data[i + 3] > 0) { // If white and alpha > 0
                data[i] = hexToR(color);
                data[i + 1] = hexToG(color);
                data[i + 2] = hexToB(color);
            }
        }

        ctx.putImageData(imageData, 0, 0);
        mainCtx.globalCompositeOperation = 'multiply';
        mainCtx.drawImage(maskCanvas, 0, 0);
        mainCtx.globalCompositeOperation = 'source-over';
    }

    function hexToR(h) { return parseInt(h.slice(1, 3), 16); }
    function hexToG(h) { return parseInt(h.slice(3, 5), 16); }
    function hexToB(h) { return parseInt(h.slice(5, 7), 16); }
});
