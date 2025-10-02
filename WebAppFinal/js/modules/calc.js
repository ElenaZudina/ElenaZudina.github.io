function calc() {
    const result = document.querySelector('.calculating__result span');

        let type, area, ratio;

        if(localStorage.getItem('renovationType')) {
            type = localStorage.getItem('renovationType');
        } else {
            type = 'cosmetic';
            localStorage.setItem('renovationType', 'cosmetic');
        }

        if (localStorage.getItem('ratio')) {
            ratio = +localStorage.getItem('ratio');
        } else {
            ratio = 50;
            localStorage.setItem('ratio', 50);
        }

    function calcTotal() {
        if (!type || !area || !ratio) {
            result.textContent = '____';
            return;
        }

            result.textContent = Math.round(area * ratio);
        }

    calcTotal();
    
    function initLocalSettings(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.classList.remove(activeClass);
            if (elem.getAttribute('id') === localStorage.getItem('renovationType')) {
                elem.classList.add(activeClass);
            }
            if (+elem.getAttribute('data-ratio') === +localStorage.getItem('ratio')) {
            elem.classList.add(activeClass);
            }
        });
    }

    initLocalSettings('#renovation-type div', 'calculating__choose-item_active');

    function getStaticInformation(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                type = e.target.getAttribute('id');
                ratio = +e.target.getAttribute('data-ratio');

                localStorage.setItem('renovationType', type);
                localStorage.setItem('ratio', ratio);

                elements.forEach(el => 
                    el.classList.remove(activeClass)
                );

                e.target.classList.add(activeClass);

                calcTotal();
            });
        });
    }

    getStaticInformation('#renovation-type div', 'calculating__choose-item_active');
    

    function getDynamicInformation(selector) {
        const input = document.querySelector(selector);

        input.addEventListener('input', () => {
            if (input.value.match(/\D/g)) {
                input.style.border = "1px solid red";
            } else {
                input.style.border = 'none';
            }
            area = +input.value;

            calcTotal();
        })
    }

    getDynamicInformation('#area');

}

export default calc;