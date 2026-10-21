const detailDataElement = document.getElementById('product-data');
if (detailDataElement) {
  const items = JSON.parse(detailDataElement.textContent);
  const itemId = new URLSearchParams(window.location.search).get('id');
  const item = items.find((product) => product.id === itemId);
  if (item) {
    document.getElementById('product-detail').hidden = false;
    document.getElementById('detail-crumb').textContent = item.name;
    document.getElementById('detail-title').textContent = item.name;
    document.getElementById('detail-description').textContent = item.description;
    document.getElementById('detail-price').textContent = `Цена: ${item.price} руб.`;
    const image = document.getElementById('detail-image');
    if (!item.image) {
      document.querySelector('.product-detail__media').hidden = true;
      document.getElementById('product-detail').classList.add('product-detail--service');
    }
    if (item.image) {
      image.src = item.image;
      image.alt = item.alt;
      image.hidden = false;
    }
    const orderButton = document.getElementById('detail-order');
    orderButton.dataset.product = item.name === 'Футболка с принтом. АМ-НЯМ' ? 'Футболка с принтом' : item.name;
    orderButton.dataset.category = item.category;
  } else {
    document.getElementById('detail-not-found').hidden = false;
  }
}

// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Получаем все кнопки заказа в карточках товаров.
const orderButtons = document.querySelectorAll('.product-card__button');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('order-product');

// Получаем кнопку открытия формы обратной связи.
const openDialogButton = document.querySelector('[data-open-order-dialog]:not(.product-card__button)');

// Открываем модальное окно обратной связи.
if (openDialogButton && orderDialog) {
  openDialogButton.addEventListener('click', () => {
    orderDialog.showModal();
  });
}

// Перебираем все кнопки «Заказать».
orderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Получаем название товара из data-атрибута.
    const productName = button.dataset.product;

    // Записываем название товара в поле формы.
    if (selectedProductInput) {
      selectedProductInput.value = productName;
    }

    const sizeField = document.getElementById('order-size-field');
    const sizeInput = document.getElementById('order-size');
    if (sizeField && sizeInput) {
      const needsSize = productName === 'Тапочки' || productName === 'Футболка с принтом';
      sizeField.hidden = !needsSize;
      sizeInput.required = needsSize;
      sizeInput.value = '';
    }

    const isService = (button.closest('.product-card')?.dataset.category || button.dataset.category) === 'services';
    const deliveryField = document.getElementById('order-delivery')?.closest('.order-form__field');
    const addressField = document.getElementById('order-address')?.closest('.order-form__field');
    const quantityField = document.getElementById('order-quantity')?.closest('.order-form__field');
    [deliveryField, addressField, quantityField].forEach((field) => { if (field) field.hidden = isService; });
    if (addressInput) addressInput.required = !isService;
    const quantityInput = document.getElementById('order-quantity');
    if (quantityInput) quantityInput.required = !isService;
    if (deliverySelect) deliverySelect.required = !isService;

    // Открываем модальное окно.
    orderDialog.showModal();
  });
});

// Закрываем модальное окно по кнопке «Закрыть».
if (closeDialogButton) {
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });
}

const deliverySelect = document.getElementById('order-delivery');
const addressLabel = document.getElementById('order-address-label');
const addressInput = document.getElementById('order-address');

if (deliverySelect && addressLabel && addressInput) {
  deliverySelect.addEventListener('change', () => {
    const isPickup = deliverySelect.value === 'pickup';
    addressLabel.textContent = isPickup ? 'Пункт самовывоза' : 'Адрес доставки';
    addressInput.placeholder = isPickup ? 'Укажите удобный пункт выдачи' : 'Укажите адрес доставки';
    addressInput.value = '';
  });
}

// Получаем форму заявки.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Обрабатываем отправку формы.
if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Сбрасываем предыдущие признаки ошибок.
    const formElements = Array.from(orderForm.elements);

    formElements.forEach((element) => {
      if (element.willValidate) {
        element.removeAttribute('aria-invalid');
      }
    });

    // Проверяем встроенные HTML-ограничения формы.
    if (!orderForm.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });

      // Показываем стандартные сообщения браузера.
      orderForm.reportValidity();
      return;
    }

    // Показываем сообщение об успешной отправке.
    if (successMessage) {
      successMessage.hidden = false;
    }

    // Очищаем форму.
    orderForm.reset();

    // Закрываем модальное окно.
    orderDialog.close();
  });
}

const catalogCards = document.querySelectorAll('.catalog-products .product-card');
const categoryButtons = document.querySelectorAll('.catalog-filters__category');
const catalogFilters = document.querySelector('.catalog-filters__form');
const emptyCatalog = document.querySelector('.catalog-products__empty');
let activeCategory = 'all';

function filterCatalog() {
  const minInput = document.getElementById('price-from');
  const maxInput = document.getElementById('price-to');
  const minPrice = minInput?.value === '' ? 0 : Number(minInput.value);
  const maxPrice = maxInput?.value === '' ? Infinity : Number(maxInput.value);
  let visible = 0;
  catalogCards.forEach((card) => {
    const price = Number(card.dataset.price);
    const matches = (activeCategory === 'all' || card.dataset.category === activeCategory) && price >= minPrice && price <= maxPrice;
    card.hidden = !matches;
    if (matches) visible++;
  });
  if (emptyCatalog) emptyCatalog.hidden = visible !== 0;
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('catalog-filters__category--active', selected);
      item.classList.toggle('button--primary', selected);
      item.classList.toggle('button--secondary', !selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    filterCatalog();
  });
});

if (catalogFilters) {
  catalogFilters.addEventListener('submit', (event) => {
    event.preventDefault();
    filterCatalog();
  });
}
