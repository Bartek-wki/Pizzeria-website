import { select, settings, classNames, templates } from '../settings.js';
import CartProduct from './CartProduct.js';
import { utils } from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);

    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toogleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toogleTrigger.addEventListener('click', function (event) {
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
      console.log(thisCart.product);
    });

    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    /* generete HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log(generatedHTML);

    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /* add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);

    console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    console.log(thisCart.products);

    thisCart.update();
  }

  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
      console.log(thisCart.totalNumber);
      console.log(thisCart.subtotalPrice);
    }

    thisCart.totalPrice = 0;

    if (thisCart.subtotalPrice != 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    } else {
      thisCart.deliveryFee = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

    for (let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
    }
  }

  remove(removedProduct) {
    const thisCart = this;
    console.log(thisCart);
    console.log(removedProduct);
    const indexOfRemovedProduct = thisCart.products.indexOf(removedProduct);
    //console.log(indexOfRemovedProduct);
    const removedValues = thisCart.products.splice(indexOfRemovedProduct, 1);
    console.log(removedValues);

    removedProduct.dom.wrapper.remove();

    thisCart.update();

  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function () {
        alert('Zamówienie przyjęte');
      });

  }
}

export default Cart;