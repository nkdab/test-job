import jQuery from 'jquery';
import jsrender from 'jsrender';

window.$ = window.jQuery = jQuery;

jsrender();
let info; // Храним полученные данные

//Получаем данные, грузим карточку компании
function init() {
  const loader = `
          <div class="d-flex flex-column justify-content-center align-items-center">
            <div class="spinner-border text-primary" role="status">
               <span class="sr-only">Loading...</span>
            </div>
          </div>`;
  $('#app').html(loader);
  $.getJSON('test.json')
    .done((companyData) => {
      info = companyData.Data.Report;
      const page = window.location.hash.replace('#', '');
      renderPage(page);
    })
    .fail((e) => console.error(e));
}
//Загружаем шаблон, отрисовываем
function renderPage(page) {
  setActiveLink();
  const pageLocation = page + '.html';
  $.get(pageLocation)
    .done((templ) => {
      const template = $.templates(templ);
      const html = template.render(info);
      $('#app').html(html);
    })
    .fail((e) => console.error(e));
}
//Отменяем дефолтное поведение ссылок, маршрутизуем на нужную страницу
function navigate(e) {
  e.stopPropagation();
  e.preventDefault();
  const page = $(e.target).attr('href');
  window.location.hash = page;
}

function setActiveLink() {
  const selector = 'a[href="' + window.location.hash + '"]';
  $(document).find('a[data-link="ajax"]').removeClass('active');
  $(document).find(selector).addClass('active');
}

//Вешаем обработчик на все внутренние ссылки
$('body').on('click', 'a[data-link="ajax"]', navigate);

//Псевдороутер
$(window).on('hashchange', () => {
  const page = window.location.hash.replace('#', '');
  renderPage(page);
});

//Хэлперы для правильной отрисовки данных в шаблоне
function dateFormat(val) {
  const raw = new Date(val);
  return raw.getDate() + '.' + raw.getDate() + '.' + raw.getFullYear();
}

function moneyFormat(val) {
  return (+val).toLocaleString('ru-RU') + ' руб.';
}

$.views.helpers({ date: dateFormat, money: moneyFormat });

//Запуск всего приложения
init();
