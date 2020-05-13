import './utils/jquery-import';
import jsrender from 'jsrender';
import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import '../css/dashboard.css';

$(() => {
  jsrender($);

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
        const page = window.location.pathname.replace('/', '');
        renderPage(page);
      })
      .fail((e) => console.error(e));
  }

  //Загружаем шаблон, отрисовываем
  function renderPage(page) {
    page = page || 'company-card';
    setActiveLink(page);
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
    const page = $(e.target).attr('href').replace('/', '');
    renderPage(page);
    window.history.pushState(null, null, page);
  }

  function setActiveLink(page) {
    const selector = 'a[href="' + page + '"]';
    $(document).find('a[data-link="ajax"]').removeClass('active');
    $(document).find(selector).addClass('active');
  }

  //Вешаем обработчик на все ссылки с sidebar
  $('body').on('click', 'a[data-link="ajax"]', navigate);

  //Включаем кнопки «Назад Вперед» в браузере
  $(window).on('popstate', () => {
    const page = window.location.pathname.replace('/', '');
    renderPage(page);
  });

  //Хэлперы для правильной отрисовки данных в шаблоне
  function dateFormat(val) {
    const raw = new Date(val);
    return raw.getDate() + '.' + raw.getMonth() + '.' + raw.getFullYear();
  }

  function moneyFormat(val) {
    return (+val).toLocaleString('ru-RU') + ' руб.';
  }

  function phoneFormat(code, number) {
    return `+7 ${code} ${number}`;
  }

  $.views.helpers({
    date: dateFormat,
    money: moneyFormat,
    phone: phoneFormat});

  //Собственные тэги
  function renderTabLink(name) {
    const group = this.tagCtx.props.group || null;
    const temp = `
      <a class="nav-item nav-link" 
         id="tab-${name}-${group}-tab" data-toggle="tab" href="#tab-${name}-${group}" role="tab" 
         aria-controls="tab-${name}" aria-selected="false">${this.tagCtx.render()}</a>`;
    return temp;
  }

  function renderTabContent(name) {
    const group = this.tagCtx.props.group || null;
    const temp = `
    <div aria-labelledby="tab-${name}-${group}-tab" class="tab-pane fade" id="tab-${name}-${group}" role="tabpanel">
    ${this.tagCtx.render()}    
    </div>`;
    return temp;
  }

  function renderAccordionItem(name, title) {
    const temp = `
      <div class="card">
        <div class="card-header" id="accordion-item-${name}">
          <h2 class="mb-0">
            <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse-${name}" aria-expanded="false" aria-controls="collapseOne">
              ${title}
            </button>
          </h2>
        </div>
        <div id="collapse-${name}" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
          <div class="card-body">
            ${this.tagCtx.render()}
          </div>
        </div>
      </div>`;
    return temp;
  }

  $.views.tags({
    TabLink: renderTabLink,
    TabContent: renderTabContent,
    AccordionItem: renderAccordionItem
  });

  //Запуск всего приложения
  init();
});
