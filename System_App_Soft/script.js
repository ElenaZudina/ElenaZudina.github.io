document.addEventListener('DOMContentLoaded', () => {

    /*const softwareData = [
        { name: "Windows 11", type: 'System Software' },
        { name: "Microsoft Wod", type: 'Application Software' },
        { name: "Linux", type: 'System Software' },
        { name: "Photoshop", type: 'Application Software' },
        { name: "BIOS", type: 'System Software' },
    ];*/

    // --- ЭЛЕМЕНТЫ DOM ---
    const shuffleCardsBtn = document.getElementById('shuffle-cards-btn');
    const learnContainer = document.getElementById('card-container');
    const startTestBtn = document.getElementById('start-test-btn');
    const testArea = document.getElementById('test-area');
    const sourceCardsContainer = document.getElementById('source-cards');
    const dropZones = document.querySelectorAll('.drop-zone');
    const checkBtn = document.getElementById('check-btn');
    const resultContainer = document.getElementById('results');
    const newLearningBtn = document.getElementById('new-learning');
    const newTestBtn = document.getElementById('new-test-btn');


    /**
     * Создает начальный набор переворачиваемых карточек для обучения 
     */

    shuffleCardsBtn.disabled = false;
    newLearningBtn.classList.add('hidden');

    let learnedCards = []; // храним изученные карточки

    function createLearningCards() {
        learnContainer.innerHTML =''; //очищаем контейнер, чтобы при клике на кнопку "Перемешать карточки", новые карточки не добавлялись к существующим
        const shuffleData = [...softwareData]
        .filter(item => !learnedCards.includes(item.name)) // скрываем изученные карточки, 
        .sort(() => Math.random() - 0.5);

        shuffleData.forEach(item => {
            const card = document.createElement('div');
            const learned = document.createElement('span');
            
            card.classList.add('card');
            card.dataset.learned = "false"; //убираем, так как проверка бна флаг больше не нужна
            card.innerHTML = `
            <div class="card-face card-front">${item.name}</div>
            <div class="card-face card-back"><h3>${item.type}</h3></div>
            `;
            learned.textContent = 'X';
            card.addEventListener('click', () => card.classList.toggle('is-flipped'));
            learned.addEventListener('click', (e) => {
                e.stopPropagation();
                //card.dataset.learned = "true";
                //learned.style.color = "gray";
                //card.style.display = "none";
                learnedCards.push(item.name);
                //card.style.display = "none";
                //------- добавила эффект плавного исчезновения ---
                card.classList.add('hidden');
                shuffleCardsBtn.disabled = true;
                shuffleCardsBtn.title = "Shuffling is not allowed once learning has started";
                newLearningBtn.classList.remove('hidden');
                setTimeout(() => card.remove(), 500);
            });
            card.appendChild(learned);
            learnContainer.appendChild(card);
        });
    }

    function restartLearning() {
        learnedCards = [];
        shuffleCardsBtn.disabled = false;
        newLearningBtn.classList.add('hidden')
        shuffleCardsBtn.title = '';
        createLearningCards();

        learnContainer.classList.remove('hidden');
        testArea.classList.add('hidden');
        startTestBtn.classList.remove('hidden');
        shuffleCardsBtn.classList.remove('hidden');
    }

    function initializeTest() {
        // Скрыть область обучения и показать область теста
        learnContainer.classList.add('hidden');
        startTestBtn.classList.add('hidden');
        testArea.classList.remove('hidden');
        shuffleCardsBtn.classList.add('hidden');
        newTestBtn.classList.add('hidden');


        // Сбросить предыдущее состояние теста
        sourceCardsContainer.innerHTML = '';
        resultContainer.innerHTML = '';
        checkBtn.classList.add('hidden');
        dropZones.forEach(zone => {
            zone.innerHTML = `<h3>${zone.dataset.type}</h3>`; // Сбросить содержимое, но сохранить загловок
        });

        
        // Создать перетаскиваемые карточки
        const shuffleData = [...softwareData].sort(() => Math.random() - 0.5).slice(0, 20);
        shuffleData.forEach((item, index) => {
            const card = document.createElement('div');
            card.id = `card-${index}`;
            card.classList.add('card'); // Повтороное сипользование стиля .card, но он будет вести себя по-другому
            card.draggable = true;
            card.textContent = item.name;
            card.dataset.type = item.type;
            sourceCardsContainer.appendChild(card);
        });

        addDragandDropListners();
    }

    /**
     * Добавляет все необходимые слушатели событий для функциональности перетаскивания
     */
    function addDragandDropListners() {
        const draggableCards = document.querySelectorAll('#source-cards .card');

        draggableCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
                setTimeout(() => card.classList.add('hidden'), 0); // Скрыть во время перетаскивания
            });
            card.addEventListener('dragend', () => {
                // Это событие не является строго необходимым здесь, но хорошо для очистки
                card.classList.remove('hidden');
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const id = e.dataTransfer.getData('text/plain');
                const draggable = document.getElementById(id);
                if (draggable) {
                    zone.appendChild(draggable);
                }
                checkTestCompletion();
            });
        });
    }

    function restartTest() {
        newTestBtn.classList.add('hidden');
        newLearningBtn.classList.add('hidden');
        initializeTest();
    }

    /**
     * Проверяет, перемещены ли все карточки в зоны сброса, и показывает кнопку проверки
     */
    function checkTestCompletion() {
        if (sourceCardsContainer.children.length === 0) {
            checkBtn.classList.remove('hidden');
            newTestBtn.classList.add('hidden');
            newLearningBtn.classList.add('hidden');
        }
    }

    /**
     * Вычисляет и отображает результаты теста
     */
    function calculateResults() {
        let correctAnswers = 0;
        let incorrectAnswers = 0;

        dropZones.forEach(zone => {
            const zoneType = zone.dataset.type;
            const cardsInZone = zone.querySelectorAll('.card');

            cardsInZone.forEach(card => {
                card.draggable = false; // отключить дальнейшее перетаскивание
                card.style.cursor = 'default';
                if (card.dataset.type === zoneType) {
                    correctAnswers++;
                    card.classList.add('correct');
                } else {
                    incorrectAnswers++;
                    card.classList.add('incorrect');
                }
            });
        });

        resultContainer.textContent = `Правильно: ${correctAnswers}, Ошибочно: ${incorrectAnswers}`;
        checkBtn.classList.add('hidden');
        newLearningBtn.classList.remove('hidden');
        newTestBtn.classList.remove('hidden');
    }

    // --- ИНИЦИАЛИЗАЦИЯ ---
    createLearningCards();
    startTestBtn.addEventListener('click', initializeTest);
    checkBtn.addEventListener('click', calculateResults);
    shuffleCardsBtn.addEventListener('click', createLearningCards);
    newLearningBtn.addEventListener('click', restartLearning);
    newTestBtn.addEventListener('click', restartTest);

});