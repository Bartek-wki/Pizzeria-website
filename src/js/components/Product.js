import { templates, select, classNames} from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();

    thisProduct.getElement();

    thisProduct.initAccordion();

    thisProduct.initOrderForm();

    thisProduct.initAmountWidget();

    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;

    /* generete HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(generatedHTML);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);

  }

  getElement() {
    const thisProduct = this;

    thisProduct.dom = {},

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    //console.log(thisProduct.form);
    thisProduct.dom.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    //console.log(thisProduct.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    //console.log(thisProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    //console.log(thisProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;
    
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
      //console.log('Link was clicked');
    
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      //console.log(activeProduct);
      //console.log(thisProduct.element);


      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct != null && activeProduct != thisProduct.element) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm() {
    const thisProduct = this;
    //console.log(thisProduct);

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  
  processOrder() {
    const thisProduct = this;
    //console.log(thisProduct);

    const formData = utils.serializeFormToObject(thisProduct.form);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.q. paramId= 'toppings', param = {label: 'Toppings...}
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {
        const option = param.options[optionId];
        //console.log(optionId, option);

        // check if optionId is selected
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          //console.log('select');

          // check if option is default, if it is do nothing, if it isn't increase price
          if (!option.default) {
            price += option.price;
          }
        } else {
          // check if option is default, if it is reduce price, if it isn't do nothing
          if (option.default) {
            price -= option.price;
          }
        }        
        // make selector .paramId-optionId
        const imageSelector = '.' + paramId + '-' + optionId;
        //console.log(imageSelector);

        // find image with selector .paramId-optionId
        const image = thisProduct.dom.imageWrapper.querySelector(imageSelector);
        //console.log(image);

        // Check if image is in imageWrapper
        if (image) {

          // Check if optionId is selected. If it is add class 'active', if it isn't remove class 'active'
          if (optionSelected) {
            image.classList.add(classNames.menuProduct.imageVisible);
          } else {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // Add single price to object
    thisProduct.priceSingle = price;
    //console.log(thisProduct.priceSingle);

    // multiply price by amount
    price *= thisProduct.amountWidget.value;

    
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);

    const productParams = {};

    
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.q. paramId= 'toppings', param = {label: 'Toppings...}
      const param = thisProduct.data.params[paramId];

      productParams[paramId] = {
        label: param.label,
        options: {}
      };

      // for every option in this category
      for (let optionId in param.options) {
        const option = param.options[optionId];

        // check if optionId is selected
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          productParams[paramId].options[optionId] = option.label;
        }
      }
      //console.log(productParams);
    }
    return productParams;
  }
}

export default Product;