
class Slider {
  constructor(id, opts = {
    images: [],
    cycle: 3000
  }) {
    this.options = opts
    this.container = document.getElementById(id)
    this.container.innerHTML = this.render()
    this.items = this.container.querySelectorAll(
      '.slider-list__item, .slider-list__item--selected'
    )
    this.cycle = opts.cycle || 3000
    this.slideTo(0)
  }

  render() {
    const images = this.options.images;
    const content = images.map(url => `
      <li class="slider-list__item">
        <img src="${url}"/>
      </li>    
    `.trim());

    return `<ul>${content.join('')}</ul>`;
  }

  registerPlugins(...plugins) {
    plugins.forEach(plugin => {
      const pluginContainer = document.createElement('div');
      pluginContainer.className = '.slider-list__plugin';
      pluginContainer.innerHTML = plugin.render(this.options.images);
      this.container.appendChild(pluginContainer);
      plugin.action(this)
    })
  }

  getSelectedItem() {
    const selected = this.container.querySelector('.slider-list__item--selected');
    return selected;
  }

  getSelectedItemIndex() {
    return Array.from(this.items).indexOf(this.getSelectedItem());
  }

  slideTo(idx) {
    const selected = this.getSelectedItem();
    if (selected) {
      selected.className = 'slider-list__item';
    }
    const item = this.items[idx];
    if (item) {
      item.className = 'slider-list__item--selected';
    }

    const detail = { index: idx };
    const event = new CustomEvent('slide', { bubbles: true, detail });
    this.container.dispatchEvent(event);
  }

  slideNext() {
    const currentIdx = this.getSelectedItemIndex();
    const nextIdx = (currentIdx + 1) % this.items.length;
    this.slideTo(nextIdx);
  }

  slidePrevious() {
    const currentIdx = this.getSelectedItemIndex();
    const previousIdx = (this.items.length + currentIdx - 1) % this.items.length;
    this.slideTo(previousIdx);
  }

  // 定义一个定时器，循环播放
  start() {
    this.stop();
    this._timer = setInterval(() => this.slideNext(), this.cycle);
  }

  // 停止循环播放（用户在自己操作的时候要停止自动循环）
  stop() {
    clearInterval(this._timer);
  }
}

const container = document.querySelector('#my-slider')
const slider = new Slider('my-slider', { 
  images: [
    'https://p5.ssl.qhimg.com/t0119c74624763dd070.png',
    'https://p4.ssl.qhimg.com/t01adbe3351db853eb3.jpg',
    'https://p2.ssl.qhimg.com/t01645cd5ba0c3b60cb.jpg',
    'https://p4.ssl.qhimg.com/t01331ac159b58f5478.jpg'
  ] 
});


const pluginController = {
  render(images) {
    return `
      <div class="slide-list__control">
        ${
          images.map((img, i) => `
            <span class="slide-list__control-buttons${i === 0 ? '--selected':''}"></span>
          `).join('')
        }
      </div>
    `.trim();
  },
  action(slider) {
    // 对小圆点的操作控制流
    const controller = slider.container.querySelector('.slide-list__control');
    
    if(controller){
      const buttons = controller.querySelectorAll('.slide-list__control-buttons, .slide-list__control-buttons--selected');
      
      // 鼠标经过某个小圆点，就将此圆点对应的图片显示出来，并且停止循环轮播
      controller.addEventListener('mouseover', evt=>{
        const idx = Array.from(buttons).indexOf(evt.target);
        if(idx >= 0){
          slider.slideTo(idx);
          slider.stop();
        }
      });
      
      // 鼠标移开小圆点，就继续开始循环轮播
      controller.addEventListener('mouseout', evt=>{
        slider.start();
      });
      
      // 注册slide事件，将选中的图片和小圆点设置为selected状态
      slider.container.addEventListener('slide', evt => {
        const idx = evt.detail.index
        const selected = controller.querySelector('.slide-list__control-buttons--selected');
        if(selected) selected.className = 'slide-list__control-buttons';
        buttons[idx].className = 'slide-list__control-buttons--selected';
      });
    }
  }
}

const pluginPrevious = {
  render() {
    return `<a class="slide-list__previous"></a>`;
  },
  action(slider) {
    const previous = slider.container.querySelector('.slide-list__previous');
    if (previous) {
      previous.addEventListener('click', evt => {
        slider.stop();
        slider.slidePrevious();
        slider.start();
        evt.preventDefault();
      });
    }
  }
};

const pluginNext = {
  render() {
    return `<a class="slide-list__next"></a>`;
  },
  action(slider) {
    const previous = slider.container.querySelector('.slide-list__next');
    if (previous) {
      previous.addEventListener('click', evt => {
        slider.stop();
        slider.slideNext();
        slider.start();
        evt.preventDefault();
      });
    }
  }
};

slider.registerPlugins(pluginController, pluginNext, pluginPrevious)
slider.start();
