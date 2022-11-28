
class Slider {
  constructor({ container, cycle = 3000 }) {
    this.container = container;
    this.items = this.container.querySelectorAll(
      '.slider-list__item, .slider-list__item--selected'
    );
    this.cycle = cycle;
  }

  registerPlugins(...plugins) {
    plugins.forEach(plugin => plugin(this))
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
const slider = new Slider({ container });
slider.registerPlugins(pluginController, pluginNext, pluginPrevious)
slider.start();


// 插件接收的参数就是组件的实例，将控制流中的事件写在这里，插件中的逻辑就是之前构造函数中的逻辑。
function pluginController(slider){
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

// 将左翻页的控制抽离成插件pluginPrevious
function pluginPrevious(slider){
  const previous = slider.container.querySelector('.slide-list__previous');
  if(previous){
    previous.addEventListener('click', evt => {
      slider.stop();
      slider.slidePrevious();
      slider.start();
      evt.preventDefault();
    });
  }  
}

// 将右翻页的控制抽离成插件pluginNext
function pluginNext(slider){
  const next = slider.container.querySelector('.slide-list__next');
  if(next){
    next.addEventListener('click', evt => {
      slider.stop();
      slider.slideNext();
      slider.start();
      evt.preventDefault();
    });
  }  
}