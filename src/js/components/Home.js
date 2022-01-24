import {templates} from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;
    thisHome.render(element);
    thisHome.initCarousel();

  }

  render(element) {
    const thisHome = this;

    thisHome.dom = {};

    const generatedHTML = templates.home();

    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  initCarousel() {
    var elem = document.querySelector('.carousel');
    // eslint-disable-next-line
    var flkty = new Flickity( elem, {
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
    });
  }

}

export default Home;