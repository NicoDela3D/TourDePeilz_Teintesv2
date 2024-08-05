window.onload = function () {
    const mainCanvas = document.getElementById('mainCanvas');
    const colorPicker = document.getElementById('color1');
    const exportButton = document.getElementById('exportButton');

    if (!mainCanvas || !colorPicker || !exportButton) {
        console.error('Cannot find the canvas, color picker, or export button elements.');
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

    let maskCanvas, maskCtx, originalMaskData;

    baseImage.onload = function () {
        console.log("Base image loaded.");
        if (maskImage.complete) resizeAndDrawImages();
    };

    maskImage.onload = function () {
        console.log("Mask image loaded.");
        if (baseImage.complete) resizeAndDrawImages();
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

        // Create an intermediate canvas for the mask
        maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        maskCtx = maskCanvas.getContext('2d');

        // Draw the mask image onto the intermediate canvas once
        maskCtx.drawImage(maskImage, 0, 0, width, height);
        originalMaskData = maskCtx.getImageData(0, 0, width, height);

        mainCtx.drawImage(baseImage, 0, 0, width, height);
        updateCanvas();
    }

    colorPicker.addEventListener('input', debounce(updateCanvas, 100));

    function updateCanvas() {
        console.log("Updating canvas with color:", colorPicker.value);
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainCtx.drawImage(baseImage, 0, 0, mainCanvas.width, mainCanvas.height);
        applyColorMask(colorPicker.value, mainCanvas.width, mainCanvas.height);
        drawColorText(colorPicker.value, mainCanvas.width, mainCanvas.height);
    }

    function applyColorMask(color, width, height) {
        // Reset the mask canvas with the original mask data
        maskCtx.putImageData(originalMaskData, 0, 0);

        // Get the image data from the mask canvas
        const imageData = maskCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const r = hexToR(color);
        const g = hexToG(color);
        const b = hexToB(color);

        // Apply the color to the alpha pixels of the mask
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // If alpha > 0
                data[i] = (data[i] * r) / 255;     // Red
                data[i + 1] = (data[i + 1] * g) / 255; // Green
                data[i + 2] = (data[i + 2] * b) / 255; // Blue
            }
        }

        // Put the modified image data back onto the mask canvas
        maskCtx.putImageData(imageData, 0, 0);

        // Draw the colorized mask onto the main canvas with the multiply blend mode
        mainCtx.globalCompositeOperation = 'multiply'; // Use multiply blend mode
        mainCtx.drawImage(maskCanvas, 0, 0, width, height);
        mainCtx.globalCompositeOperation = 'source-over'; // Reset blend mode to default
    }

    function drawColorText(color, width, height) {
        mainCtx.font = '20px Arial';
        mainCtx.fillStyle = '#000000'; // Black text
        mainCtx.textAlign = 'right';
        mainCtx.fillText(`Color 1 = ${color}`, width - 10, height - 10);
    }

    exportButton.addEventListener('click', function () {
        const link = document.createElement('a');
        link.download = 'colored_image.png';
        link.href = mainCanvas.toDataURL('image/png');
        link.click();
    });

    function hexToR(h) { return parseInt(h.slice(1, 3), 16); }
    function hexToG(h) { return parseInt(h.slice(3, 5), 16); }
    function hexToB(h) { return parseInt(h.slice(5, 7), 16); }

    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};
