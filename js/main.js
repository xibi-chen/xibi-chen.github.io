/* xibichen_personal_website — tab switching */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.tabpanel'));

  function show(id) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t.id === id)); });
    panels.forEach(function (p) {
      var active = p.id === id.replace('tab-', 'panel-');
      p.setAttribute('data-active', String(active));
    });
    if (history.replaceState) {
      var name = id.replace('tab-', '');
      history.replaceState(null, '', name === 'home' ? '/' : '#' + name);
    }

    if (id === 'tab-contact') {
      var map = document.querySelector('.map-frame iframe');
      if (map) {
        var base = map.getAttribute('src').split('&_=')[0];
        map.setAttribute('src', base + '&_=' + Date.now());
      }
    }
  }

  var initial = location.hash ? location.hash.slice(1) : 'home';
  var initialId = 'tab-' + initial;
  if (!tabs.some(function (t) { return t.id === initialId; })) initialId = 'tab-home';

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { show(t.id); });
    t.addEventListener('keydown', function (e) {
      var idx = tabs.indexOf(t);
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); next.focus(); show(next.id); }
    });
  });

  show(initialId);

  // 手机端汉堡菜单:点按钮展开/收起下拉;点任意 tab 后收起;窗口拉大时复位
  var nav = document.getElementById('tabs-nav');
  var toggle = document.getElementById('menu-toggle');
  function closeMenu() {
    if (nav) nav.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  tabs.forEach(function (t) { t.addEventListener('click', closeMenu); });
  window.addEventListener('resize', function () { if (window.innerWidth > 640) closeMenu(); });

  Array.prototype.forEach.call(document.querySelectorAll('[data-tab]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var tab = document.getElementById(a.getAttribute('data-tab'));
      if (tab) tab.click();
      var scrollId = a.getAttribute('data-scroll');
      if (scrollId) {
        setTimeout(function () {
          var el = document.getElementById(scrollId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });
})();
