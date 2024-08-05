document.addEventListener("DOMContentLoaded", function () {
    const mainCanvas = document.getElementById('mainCanvas');
    const maskCanvas1 = document.getElementById('maskCanvas1');
    const maskCanvas2 = document.getElementById('maskCanvas2');
    const maskCanvas3 = document.getElementById('maskCanvas3');
    const colorPicker1 = document.getElementById('color1');
    const colorPicker2 = document.getElementById('color2');
    const colorPicker3 = document.getElementById('color3');

    const mainCtx = mainCanvas.getContext('2d');
    const maskCtx1 = maskCanvas1.getContext('2d');
    const maskCtx2 = maskCanvas2.getContext('2d');
    const maskCtx3 = maskCanvas3.getContext('2d');

    const image = new Image();
    const mask1 = new Image();
    const mask2 = new Image();
    const mask3 = new Image();

    image.src = 'images/image.png';
    mask1.src = 'images/mask1.png';
    mask2.src = 'images/mask2.png';
    mask3.src = 'images/mask3.png';

    image.onload = function () {
        mainCanvas.width = image.width;
        mainCanvas.height = image.height;
        maskCanvas1.width = image.width;
        maskCanvas1.height = image.height;
        maskCanvas2.width = image.width;
        maskCanvas2.height = image.height;
        maskCanvas3.width = image.width;
        maskCanvas3.height = image.height;

        mainCtx.drawImage(image, 0, 0);
        maskCtx1.drawImage(mask1, 0, 0);
        maskCtx2.drawImage(mask2, 0, 0);
        maskCtx3.drawImage(mask3, 0, 0);

        updateCanvas();
    };

    colorPicker1.addEventListener('input', updateCanvas);
    colorPicker2.addEventListener('input', updateCanvas);
    colorPicker3.addEventListener('input', updateCanvas);

    function updateCanvas() {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(image, 0, 0);

        applyMask(maskCtx1, colorPicker1.value, maskCanvas1);
        applyMask(maskCtx2, colorPicker2.value, maskCanvas2);
        applyMask(maskCtx3, colorPicker3.value, maskCanvas3);
    }

    function applyMask(ctx, color, maskCanvas) {
        const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // Si alpha > 0
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

    function hexToR(h) { return parseInt(h.slice(1, 3), 16) }
    function hexToG(h) { return parseInt(h.slice(3, 5), 16) }
    function hexToB(h) { return parseInt(h.slice(5, 7), 16) }
});
