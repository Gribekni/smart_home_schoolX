// Состояние приложения
let currentPage = 'cameras';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupNavigationButtons();
    setupCameras();
});

// Настройка навигационных кнопок
function setupNavigationButtons() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Удаляем активный класс у всех кнопок
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс нажатой кнопке
            button.classList.add('active');
            // Сохраняем текущую страницу
            currentPage = button.dataset.page;
            // В реальном приложении здесь был бы код для загрузки соответствующей страницы
            console.log(`Переключение на страницу: ${currentPage}`);
        });
    });
}

// Настройка камер
async function setupCameras() {
    try {
        // Запрашиваем доступ к камере
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Получаем все элементы video
        const videoElements = document.querySelectorAll('video');

        // Подключаем поток ко всем video элементам
        videoElements.forEach(video => {
            // Клонируем поток для каждой камеры
            const trackClone = stream.getVideoTracks()[0].clone();
            const newStream = new MediaStream([trackClone]);
            video.srcObject = newStream;
        });
    } catch (error) {
        console.error('Ошибка при получении доступа к камере:', error);
        // В случае ошибки показываем заглушку
        showFallbackImages();
    }
}

// Функция для показа заглушек вместо видео
function showFallbackImages() {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
        // Создаем элемент изображения
        const img = document.createElement('img');
        img.src = 'https://via.placeholder.com/640x360.png?text=Нет+доступа+к+камере';
        img.alt = 'Камера недоступна';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        // Заменяем видео на изображение
        video.parentNode.replaceChild(img, video);
    });
}

//климат-контроль

// Создаем канал для обмена данными между страницами
const controlChannel = new BroadcastChannel('smartHomeControl');

// Функция для обновления состояния переключателей
function updateSwitchState(switchId, isOn) {
    const switchElement = document.getElementById(switchId);
    if (switchElement) {
        switchElement.checked = isOn;
    }
}

// Функция для обновления значения влажности
function updateHumidity(value) {
    const humidityElement = document.getElementById('humidity-value');
    if (humidityElement) {
        humidityElement.textContent = value;
    }
}

// Обработчики событий для переключателей
document.querySelectorAll('.switch input').forEach(switchInput => {
    switchInput.addEventListener('change', (e) => {
        // Отправляем сообщение о изменении состояния
        controlChannel.postMessage({
            type: 'switchToggle',
            id: e.target.id,
            isOn: e.target.checked
        });
    });
});

// Слушаем сообщения от других страниц
controlChannel.onmessage = (event) => {
    const { type, id, isOn, humidity } = event.data;

    if (type === 'switchToggle') {
        updateSwitchState(id, isOn);
    } else if (type === 'humidityUpdate') {
        updateHumidity(humidity);
    }
};

// Симуляция получения данных о влажности
function simulateHumidityData() {
    // Генерируем случайное значение влажности от 30 до 70
    const humidity = Math.floor(Math.random() * (70 - 30 + 1)) + 30;

    // Отправляем сообщение об обновлении влажности
    controlChannel.postMessage({
        type: 'humidityUpdate',
        humidity: humidity
    });

    // Обновляем значение на странице
    updateHumidity(humidity);
}

// Обновляем данные каждые 5 секунд
setInterval(simulateHumidityData, 5000);

// Инициализируем начальное значение влажности
simulateHumidityData();

