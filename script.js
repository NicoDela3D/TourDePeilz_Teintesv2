window.onload = function () {
    const mainCanvas = document.getElementById('mainCanvas');
    const colorPicker = document.getElementById('color1');

    if (!mainCanvas || !colorPicker) {
        console.error('Cannot find the canvas or color picker elements.');
        return;
    }

    const mainCtx = mainCanvas.getContext('2d');

    const baseImage = new Image();
    const maskImage = new Image();

    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;

    baseImage.crossOrigin = "Anonymous";
    maskImage.crossOrigin = "Anonymous";

    baseImage.src = 'images/aerienneBase.jpg';
    maskImage.src = 'images/aerienneMask1.png';

    baseImage.onload = function () {
        console.log("Base image loaded.");
        resizeAndDrawImages();
    };

    maskImage.onload = function () {
        console.log("Mask image loaded.");
        resizeAndDrawImages();
    };

    function resizeAndDrawImages() {
        if (!baseImage.complete || !maskImage.complete) return;

        let { width, height } = baseImage;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const aspectRatio = width / height;
            if (width > MAX_WIDTH) {
                width = MAX_WIDTH;
                height = MAX_WIDTH / aspectRatio;
            }
            if (height > MAX_HEIGHT) {
                height = MAX_HEIGHT;
                width = MAX_HEIGHT * aspectRatio;
            }
        }

        mainCanvas.width = width;
        mainCanvas.height = height;

        mainCtx.drawImage(baseImage, 0, 0, width, height);
        applyMask(maskImage, colorPicker.value, width, height);
    }

    colorPicker.addEventListener('input', updateCanvas);

    function updateCanvas() {
        console.log("Updating canvas with color:", colorPicker.value);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(baseImage, 0, 0, mainCanvas.width, mainCanvas.height);
        applyMask(maskImage, colorPicker.value, mainCanvas.width, mainCanvas.height);
    }

    function applyMask(mask, color, width, height) {
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        maskCtx.drawImage(mask, 0, 0, width, height);

        const imageData = maskCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const r = hexToR(color);
        const g = hexToG(color);
        const b = hexToB(color);

        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // If alpha > 0
                data[i] = (data[i] * r) / 255;     // Red
                data[i + 1] = (data[i + 1] * g) / 255; // Green
                data[i + 2] = (data[i + 2] * b) / 255; // Blue
            }
        }

        maskCtx.putImageData(imageData, 0, 0);
        mainCtx.globalCompositeOperation = 'multiply'; // Use multiply blend mode
        mainCtx.drawImage(maskCanvas, 0, 0);
        mainCtx.globalCompositeOperation = 'source-over'; // Reset blend mode to default
    }

    function hexToR(h) { return parseInt(h.slice(1, 3), 16); }
    function hexToG(h) { return parseInt(h.slice(3, 5), 16); }
    function hexToB(h) { return parseInt(h.slice(5, 7), 16); }
};
