// Получаем элементы DOM
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
const colorSwatches = document.querySelectorAll('.color-swatch');
const brushSize = document.getElementById('brushSize') as HTMLInputElement;
const brushSizeValue = document.getElementById('brushSizeValue') as HTMLSpanElement;
const newBtn = document.getElementById('newBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const clearGalleryBtn = document.getElementById('clearGalleryBtn') as HTMLButtonElement;
const gallery = document.getElementById('gallery') as HTMLDivElement;

// Устанавливаем начальные значение
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';

// Функции для очистки холста
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Функция для рисования
function draw(e: MouseEvent) {
    if (!isDrawing) return; // если не в режиме рисования, выходим
    ctx.lineWidth = parseInt(brushSize.value, 10);
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor; // устанавливаем цвет линии
    ctx.beginPath();
    ctx.moveTo(lastX, lastY); // начинаем с последней позиции
    ctx.lineTo(e.offsetX, e.offsetY); // рисуем линию до текущей позиции
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY]; // обновляем последнюю подицию
}

// Обработчик событий мыши
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Обработчик для кнопки "New"
newBtn.addEventListener('click', clearCanvas);

// Обработчик для палитры цветов
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        currentColor = (swatch as HTMLElement).dataset.color!;
        document.querySelector('.color-swatch.active')?.classList.remove('active');
        swatch.classList.add('active');
    });
});

colorPicker.addEventListener('input', (e) => {
    currentColor = (e.target as HTMLInputElement).value;
});

// обработчик для размера кисти
brushSize.addEventListener('input', (e) => {
    brushSizeValue.textContent = (e.target as HTMLInputElement).value;
});

// Фукнции для сохранения рисунка
async function saveDrawing() {
    const image = canvas.toDataURL('image/png');
    const response = await fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image })
    });
    const data = await response.json();
    console.log(data.message);
    loadGallery(); // перезагружаем галерею
}

saveBtn.addEventListener('click', saveDrawing);

// Функция для удаления рисунка
async function deleteDrawing(filename:string) {
    const response = await fetch(`/images/${filename}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    console.log(data.message);
    loadGallery(); //перезагружаем галерею
}

clearGalleryBtn.addEventListener('click', clearGallery);

// Функция для очистки галереи
async function clearGallery() {
    const response = await fetch('/images', {
        method: 'DELETE'
    });
    const data = await response.json();
    console.log(data.message);
    loadGallery();
}

// Функция для загрузки галереи
async function loadGallery() {
    const response = await fetch('/images');
    const images = await response.json();
    gallery.innerHTML = ''; // очищаем галерею
    images.forEach((image: string) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gallery-item';

        const imgElement = document.createElement('img');
        imgElement.src = `img/${image}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteDrawing(image));

        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(deleteBtn);
        gallery.appendChild(imgContainer);
    });
}

// Загружаем галерею при загрузке страницы
loadGallery();