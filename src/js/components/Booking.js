import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {
      wrapper: element,
      peopleAmount: document.querySelector(select.booking.peopleAmount),
      hoursAmount: document.querySelector(select.booking.hoursAmount),
    };

    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.peopleAmount.addEventListener('clink', function () {
      event.preventDefault();
    });

    thisBooking.dom.hoursAmount.addEventListener('clink', function () {
      event.preventDefault();
    });

  }
}

export default Booking;