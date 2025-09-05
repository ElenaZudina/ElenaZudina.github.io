$(function() {
                //Отлавливаем события "Нажатие на клавишу"
                $(this).keydown(function(event) {
                    //Создаем переменную, в коорую помещаем div с помощью data-key
                    var key = $(this).find('.key[data-key='+event.which+']');
                    //Находим на странице тег audio с нужным data-key и помещаем также  в переменную для удобства
                    var audio = $(this).find('audio[data-key='+event.which+']')[0];
                    //Присваиваем оживший класс к клавише, чтобы подсветить ее
                    key.toggleClass('playing');
                    //Проверяем, существует ли audio тег с таким data-key
                    if (!audio) return;
                    //воспроизводим звук
                    audio.play();
                    //Сбрасываем таймер звуковой дорожки снова на 0
                    audio.currentTime = 0;
                });
                //Отслеживаем событие, когда пользователь запускает кнопку
                $(this).keyup(function(event) {
                    //Снова создаем переменную с нужным data-key
                    var key = $(this).find('.key[data-key='+event.which+']');
                    //Убираем класс, который подсвечивае кнопку
                    key.toggleClass('playing');
                });
            });