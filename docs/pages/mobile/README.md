# mobile

## iOS滑动不流畅

当在容器内部上下滑动滚动时，页面会产生卡顿，手指离开页面，页面立即停止运动。整体表现就是滑动不流畅，没有滑动惯性

```css
.container {
  -webkit-overflow-scrolling: touch;
}
```

```html
<body>
  <div class="header"></div>
  <div class="container">
    <ul class="list">
      <li v-for="item in 50" :key="item">{{ item }}</li>
    </ul>
  </div>
  <div class="footer"></div>
</body>
```

```css
body {
  display: flex;
  flex-direction: column;
}
.header {
  height: 50px;
  background-color: red;
}
.footer {
  height: 50px;
  background-color: #000000;
}
.list li{
  text-align: center;
  line-height: 100px;
}
.container {
  flex: 1;
  /* 容器内部滚动 */
  overflow-y: auto;
  /* 不加👇的css在ios Safair浏览器上滚动表现为无惯性，粘手 */
  -webkit-overflow-scrolling: touch; /* 默认值：auto */
}
```

在ios浏览器打开时,如果有`fixed`定位，页面滚动可能被卡住，此时将`fixed`元素置于滚动容器元素下方即可解决滚动卡住问题

```css
.nav {
  width: 50px;
  height: 50px;
  background-color: coral;
  position: fixed;
  top: 200px;
  left: 0;
}
```

```html
<!-- 页面卡住 -->
<body>
  <div class="header">header</div>
  <div class="nav"></div>
  <div class="container">
    <ul class="list" v-show="show">
      <li v-for="item in lnum" :key="item">{{ item }}</li>
    </ul>
  </div>
  <div class="footer"></div>
</body>
```

```html
<body>
  <div class="header">header</div>
  <div class="container">
    <ul class="list" v-show="show">
      <li v-for="item in lnum" :key="item">{{ item }}</li>
    </ul>
  </div>
  <!-- 将fixed元素置于滚动元素下方 -->
  <div class="nav"></div>
  <div class="footer"></div>
</body>
```