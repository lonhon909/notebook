# less

`less`是一门`css`预处理语言，它扩展了`css`语言，增加了变量、Minxi、函数等特性，使`css`易于维护和扩展。

## install - 安装

```js
npm install -D less less-loader style-loader css-loader postcss-loader autoprefixer
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader','postcss-loader', 'less-loader']
      }
    ]
  }
}
```

## Variables - 变量

`举个🌰1 - 作为普通变量`
```less
// less
@color: red;
@font: 12px;
.container {
  background-color: @color;
  font-size: @font;
}
// 编译成css
.container {
  background-color: red;
  font-size: 12px;
}
```

`举个🌰2 - class类名`
```less
// less
@className: test;
@color: green;

.@{className} {
  color: @color;
}
.@{className}-name {
  font-size: 20px;
}
// 编译成css
.test {
  color: green;
}
.test-name {
  font-size: 20px;
}
```

`举个🌰3 - 作为css属性`
```less
// less
@property: color;
.test-name {
  @{property}: red;
  background-@{property}: blue;
}
// 编译成css
@property: green;

.test-name {
  color: red;
  background-color: blue;
}
```

`举个🌰4 - 作为URL的一部分`

```less
// less
@images: "../img";
body {
  background: url("@{images}/white-sand.png");
}
// 编译成css
body {
  color: #444;
  background: url("../img/white-sand.png");
}
```

`举个🌰5 - 将属性作为变量`

```less
.test-name {
  color: red;
  // 使用属性作为变量
  background-color: $color;
  &::after {
    content: 'oo^_^oo';
    // 使用属性作为变量
    background-color: $color;
  }
}
// 编译成css
.test-name {
  color: red;
  background-color: red;
}
.test-name::after {
  content: 'oo^_^oo';
  background-color: red;
}
```

`举个🌰6 - 父类名选择器`

```less
// less
.test {
  color: red;
  &-name {
    color: blue;
  }
  &top {
    color: pink;
  }
}
// 编译成css
.test {
  color: red;
}
.test-name {
  color: blue;
}
.testtop {
  color: pink;
}
```

## Minxi - 混合

混合（Mixin）是一种将一组属性从一个规则集包含（或混入）到另一个规则集的方法。

```less
.test {
  color: pink;
}
.title, .footer {
  font-size: 20px;
  .test(); // 括号目前是可选的，但是建议加上括号，因为将来less将这条规则改为是必选的
}
// 编译css
.test {
  color: pink;
}
.title, .footer {
  font-size: 20px;
  color: pink;
}
```

如果你想创建一个`Mixin`但是又不想它编译，在定义变量后加上括号

```less
// 这个不被编译输出
.test() {
  color: pink;
}
.title, .footer {
  font-size: 20px;
  .test(); // 括号目前是可选的，但是建议加上括号，因为将来less将这条规则改为是必选的
}
// 编译css
.title, .footer {
  font-size: 20px;
  color: pink;
}
```

- 当输入的宽度大于等于150px 的时候，给div添加一种样式；
- 当输入的宽度小于150px的时候，给div添加另外一种样式；

```less
// less
// 当输入的宽度大于等于150px 的时候，给div添加一种样式；
.width(@width) when (@width > 100px) {
  background-color: pink;
}
// 当输入的宽度小于150px的时候，给div添加另外一种样式；
.width(@width) when (@width <= 100px) {
  background-color: red;
}
.title, .footer {
  // 根据输入值判断
  .width(199px);
}
```

`@arguments - 变量`

```less
.box-shadow(@x: 0; @y: 0; @blur: 1px; @color: #000) {
  // arguments变量
  box-shadow: @arguments;
}
```

## Function - 函数

### 逻辑函数

```less
/* 
  params:
    condition: 一个布尔表达式
    value1: 如果表达式为true
    value2: 如果表达式为false
*/
@some: red;
.test {
  width: if(2 > 1, 100px, 200px);
  color: if(iscolor(@some), @some, blue);

}

@some: red;
@foo: 12px;
@bar: 24px;
.test {
  // if与括号紧靠，否则会报错
  width: if(2 > 1, 100px, 200px);
  color: if(iscolor(@some), @some, blue);
  font-size: if(true and (3 > 12), @foo, @bar);
  background-color: if(not (true), pink, yellow);
  line-height: if(false or (true), 55px, 155px);
}
```

```less
// less
@bg: black;
/* 将计算结果缓存
  params:
    condition: 一个布尔表达式
*/
@bg-light: boolean(luma(@bg) > 50%);

.test {
  background: @bg; 
  color: if(@bg-light, black, white);
}
// css
.test {
  background: black;
  color: white;
}
```

### each - 遍历

```less
// less
@selectors: blue, green, red;
each(@selectors, {
  .test-@{value} {
    color: @value;
  }
})
// css
.test-blue { color: blue }
.test-green { color: green }
.test-red { color: red }
```

### range

params:
  start: 开始
  end: 结束
  step: 跨步大小

```less
// less
value: range(4);
// 编译css
value: 1 2 3 4;
// less
value: range(10px, 30px, 10); // 开始10px, 结束30px，跨步10
// 编译css
value: 10px 20px 30px;
```

```less
// less
each(range(50, 300, 50), {
  .w@{value} {
    width: @value * 1px;
  }
})
each(range(4), {
  .col-@{value} {
    height: (@value * 50px);
  }
});
each(range(50px, 300px, 50), {
  .w@{value} {
    width: @value;
  }
})
```

上例编译`css`

<img src="@img/less/1.png" class="images h200" />
<img src="@img/less/2.png" class="images h200" />
<img src="@img/less/3.png" class="images h200" />

### Math Functions

#### percentage - 将浮点数转换为百分比字符串。

```less
// less
width: percentage(0.5);
// 编译css
width: 50%;
// less
width: percentage(.6999);
// 编译css
width: 69.99%;
```

### Type Functions

#### isnumber - 如果值是数字，则返回true，否则返回false。
#### isstring - 如果值是字符串，则返回true，否则返回false。
#### iscolor - 颜色
#### isurl - 路径


```less
// less
@num: 15;
@str: 'red';
@color: #000000;
width: if(isnumber(@num), 100px, 200px); // width: 100px;
width: if(isstring(@str), 100px, 200px); // width: 100px;
color: if(iscolor(@color), @color, red); // #000000
// isurl(url(...)); // true
```

## 命名空间和访问符

有时，出于组织结构或仅仅是为了提供一些封装的目的，你希望对混合（mixins）进行分组。

```less
// 创建分组
#flex() {
  .center {
    justify-content: center;
  }
  .around {
    justify-content: space-around;
  }
  .between {
    justify-content: space-between;
  }
}
.text100 {
  display: flex;
  // 使用
  #flex.center(); // 或者写成 #bundle > .button 形式
}
#bundle() {
  .button {
    display: block;
    border: 1px solid black;
    background-color: grey;
    &:hover {
      background-color: white;
    }
  }
  .tab { ... }
  .citation { ... }
}
#header a {
  color: orange;
  #bundle.button();  // 还可以书写为 #bundle > .button 形式
}
```

注意：如果不希望它们出现在输出的 CSS 中，例如 #bundle .tab，请将 () 附加到命名空间（例如 #bundle()）后面

## px2rem - px转换rem

方法一

```less
// less
.px2rem(@num) {
  // Property属性名
  num: @num / 10px * .2rem; // 规则自己配置
}
.test {
  font-size: .px2rem(40px)[num];
  line-height: .px2rem(60px)[num];
  width: .px2rem(200px)[num];
}
// css
.test {
  font-size: 0.8rem;
  line-height: 1.2rem;
  width: 4rem;
}
```

方法二

```less
// less
.px2rem(@num) {
  // Property属性名
  default: @num / 10px * .2rem; // 规则自己配置
}
.test {
  // default 属性名省略
  font-size: .px2rem(40px)[];
  line-height: .px2rem(60px)[];
  width: .px2rem(200px)[];
}
```

方法3

```less
.px2rem(@property, @num) {
  @{property}: @num / 10px * .2rem;
}
.test {
  .px2rem(font-size, 40px);
  .px2rem(line-height, 60px);
  .px2rem(width, 300px);
}
```