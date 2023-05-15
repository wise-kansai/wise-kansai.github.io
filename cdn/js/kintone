/** *******************************
* tab.jsの内容
************************************/

export class Tab {
  constructor(type) {
    this.tab = [];
    this.type = type;
    this.initTab();
    this.initMenu();
    this.active(
      String(location.hash).match(/[#&]tab=(\d+)/) ? RegExp.$1 : ''
    );
  }
  initTab() {
    const tmp = [];
    let no = -1;
    const layout = document.querySelector('.layout-gaia');
    const nodes = layout.childNodes;
    for (let i = 0, j = nodes.length; i < j; i++) {
      const el = nodes[i].querySelector('.control-value-label-gaia');
      if (el && String(el.textContent).match(/^\[([^\]]+)\]$/)) {
        nodes[i].style.display = 'none';
        this.tab.push(RegExp.$1);
        tmp[++no] = [];
        continue;
      }
      if (no == -1) continue;
      tmp[no].push(nodes[i]);
    }
    for (let i = 0, j = tmp.length; i < j; i++) {
      const layer = document.createElement('div');
      layer.style.display = 'none';
      layer.id = 'tab-layer' + i;
      layout.appendChild(layer);
      for (let k = 0, l = tmp[i].length; k < l; k++) {
        layer.appendChild(tmp[i][k]);
        tmp[i][k] = null;
      }
    }
  }
  initMenu() {
    const width = document.documentElement.clientWidth;
    const menu = document.querySelector('#user-js-tab-menu');
    menu.className = 'tab-menu';
    menu.style.width = (width - 20) + 'px';
    const inner = document.createElement('div');
    inner.className = 'tab-menu-inner';
    menu.appendChild(inner);
    const ul = document.createElement('ul');
    inner.appendChild(ul);
    for (let i = 0, j = this.tab.length; i < j; i++) {
      const li = document.createElement('li');
      const div = document.createElement('div');
      div.id = 'tab-menu-item' + i;
      div.classList.add('tab-menu-item');
      div.appendChild(document.createTextNode(this.tab[i]));
      li.appendChild(div);
      ul.appendChild(li);
      li.addEventListener('click', this.onClick.bind(this));
    }
  }
  active(no) {
    no = parseInt(no, 10);
    if (Number.isNaN(no)) no = 0;
    for (let i = 0, j = this.tab.length; i < j; i++) {
      const layer = document.querySelector('#tab-layer' + i);
      const div = document.querySelector('#tab-menu-item' + i);
      div.classList.remove('tab-menu-item-active');
      let display = 'none';
      if (no == i) {
        display = '';
        div.classList.add('tab-menu-item-active');
      }
      layer.style.display = display;
    }
    if (this.type != 'app.record.create.show') {
      const hash = String(location.hash).replace(/[#&]tab=\d+/, '');
      location.hash = hash + (hash == '' ? '#' : '&') + 'tab=' + no;
    }
  }
  onClick() {
    this.active(
      String(event.target.id).replace(/^tab-menu-item/, '')
    );
  }
}
