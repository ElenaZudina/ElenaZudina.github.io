import {getResource} from '../services/services';
function cards() {
    class MenuCard {
            constructor(src, alt, title, descr, price, type, parentSelector, ...classes) {
                this.src = src;
                this.alt = alt;
                this.title = title;
                this.descr = descr;
                this.price = price;
                this.type = type;
                this.classes = classes;
                this.parent = document.querySelector(parentSelector);
                this.transfer = 1;
                this.changeToUSD();
            }

            changeToUSD() {
                this.price = this.price * this.transfer;
            }

            render() {
                const element = document.createElement('div');

                if (this.classes.length === 0) {
                    this.classes = ["menu__item"];
                    element.classList.add(...this.classes);
                } else{
                    this.classes.forEach(className => element.classList.add(className)); 
                }

                element.innerHTML =  `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена</div>
                    <div class="menu__item-total"><span>${this.price}</span> EUR/день</div>
                </div>
                `;
                this.parent.append(element);
            }
        }

        const parentSelector = ".menu .container";
        const tabs = document.querySelectorAll(".services__tabs .tabheader__item");
        const parent = document.querySelector(parentSelector);

        let allCards = [];

        function renderCardsByType(type) {
            parent.innerHTML = "";

            allCards
                .filter(card => card.type === type)
                .forEach(({ img, altimg, title, descr, price, type}) => {
                    new MenuCard(img, altimg, title, descr, price, type, parentSelector).render();
                });
        }

        getResource('http://localhost:3001/services')
        .then(data => {
            allCards = data;

            renderCardsByType("cosmetic");
        });

        tabs.forEach(tab => {
            tab.addEventListener("click", (e) => {
                tabs.forEach(t => t.classList.remove("tabheader__item_active"));
                e.target.classList.add("tabheader__item_active");

                const type = e.target.dataset.type;
                renderCardsByType(type);
            })
        });
    }

    export default cards;