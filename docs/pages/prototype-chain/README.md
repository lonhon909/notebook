# JavaScript深入之原型链

<!-- ## 函数对象和普通对象 -->

<!-- <img src="@img/1.png" class="images h260" /> -->

<!-- 通过上面可以看出，函数在`js`中也是对象，但与普通对象相比却存在着差异，`prototype`是函数对象特有的属性，普通对象上不存在该属性，`js`中内置的`Object`|`Function`|`String`（构造函数）等都是典型的**函数对象**，函数作为特殊的对象同时存在`prototype`、`__proto__`属性. -->

<!-- ```js
function Person() {}
const person = new Person();

Person.prototype; // {constructor: ƒ}
person.__proto__; // {constructor: ƒ}
person.__proto__ === Person.prototype; // true
``` -->

## 函数对象

```js
function fn1() {}
const fn2 = new Function();

typeof fn1; // 'function'
typeof fn2; // 'function'
typeof Function; // 'function'
fn1 instanceof Function; // true
```

函数对象即**函数**，所有的函数都是`Function`的实例，`js`内置的`Function`|`Object`|`Number`（构造函数）等都是**函数对象**

## 普通对象

```js
function Person() {}

const obj1 = new Person();
const obj2 = {};
const obj3 = new Object();

typeof obj1; // 'object'
typeof obj2; // 'object'
typeof obj3; // 'object'
typeof Object // 'function'
typeof new new Function(); // 'object'
```

所有 Function 的实例都是函数对象，其他的均为普通对象，其中包括 Function 实例的实例

## prototype原型

为了解决构造函数的对象实例之间无法共享属性的缺点，`js`提供了`prototype`属性，任何`function`声明的函数都有一个`prototype` 属性，注意：`prototype`只存在函数对象上，不存在普通对象上

<img src="@img/2.png" class="images h100" />


`js`中每个数据类型都是对象（除了`null`和`undefined`），而每个对象都继承自另外一个对象，后者称为“原型”（`prototype`）对象，只有`null`除外，它没有自己的原型对象。原型对象上的所有属性和方法，都会被对象实例所共享

```js
function Person() {}

Person.prototype.name = 'Hello World';
const p1 = new Person();
const p2 = new Person();
// 共享
p1.name; // 'Hello World'
p2.name; // 'Hello World'
```

## `__proto__`

`__proto__`属于对象特有属性，函数属于特殊的对象，同时具有`prototype`和`__proto__`属性

<img src="@img/3.png" class="images h200" />

`__proto__`属性是`Object.prototype` 一个简单的访问器属性，其中包含了`get`（获取）和`set`（设置）的方法，任何一个`__proto__`的存取属性都继承于`Object.prototype`

```js
function Person() {}

const p = new Person();

p.__proto__ === Person.prototype; // true
Object.getPrototypeOf(p) === Person.prototype; // true
Reflect.getPrototypeOf(p) === Person.prototype; // true
```

::: warning
使用__proto__是有争议的，也不鼓励使用它。因为它从来没有被包括在EcmaScript语言规范中，但是现代浏览器都实现了它。__proto__属性已在ECMAScript 6语言规范中标准化，用于确保Web浏览器的兼容性，因此它未来将被支持。它已被不推荐使用, 现在更推荐使用
`Object.getPrototypeOf`/`Reflect.getPrototypeOf` 和`Object.setPrototypeOf`/`Reflect.setPrototypeOf`
:::

## constructor

`constructor`是对象独有的，指向构造函数

```js
function Person() {}

const p = new Person();

Object.getPrototypeOf(p).constructor === Person; // true
```

## typeof

`typeof`一般用来判断一个变量的类型，`Number`、`String`、`Boolean`、`Null`、`Undefined`、`Symbol`、`BigInt`、`object`,但遗憾的是，对于`object`不能准确判断

```js
console.log(typeof 1 === 'number'); // true
console.log(typeof '' === 'string'); // true
console.log(typeof false === 'boolean'); // true
console.log(typeof undefined === 'undefined'); // true
console.log(typeof Symbol() === 'symbol'); // true
console.log(typeof 10n === 'bigint'); // true
// 无法准确判断
console.log(typeof null === 'object'); // true
console.log(typeof new Boolean(false) === 'object'); // true
```

为什么`typeof null = object`, js中`typeof`实现原理：

  `js`在底层存储变量的时候，会在变量的机器码的低位1-3位存储其类型信息

  - 1：整数
  - 110：布尔
  - 100：字符串
  - 010：浮点数
  - 000：对象

但是，对于`undefined`和`null`来说，这两个值的信息存储是有点特殊的

- `null`：所有机器码均为0
- `undefined`：用 −2^30 整数来表示

所以，`typeof` 在判断 `null` 的时候就出现问题了，由于 `null` 的所有机器码均为0，因此直接被当做了对象来看待。

## instanceof

instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。

```js
class Person {}
class Flagment {}
class Man extends Person {}

const man = new Man();
man instanceof Man; // true
man instanceof Person; // true
man instanceof Flagment; // false
```

检测对象/实例是否是其父类型或者祖先类型的实例

<img src="@img/4.png" class="images h260" />

## 手写实现 instanceof

```js
function new_instance_of(left, right) {
  if (left === null || typeof left !== 'object') return false;
  let rightProto = right.prototype;
  left = Object.getPrototypeOf(left);
  while(true) {
    // 查找到尽头，还没找到
    if (left == null) {
      return false
    }
    if (left === rightProto) {
      return true
    }
    left = Object.getPrototypeOf(left)
  }
}

new_instance_of(man, Person); // true
new_instance_of(man, Man); // true
new_instance_of(man, Object); // true
```

## 原型链

什么是原型链？

任何对象都有`__proto__`属性，当访问一个对象的某个属性时，会先在这个对象本身属性上查找，如果没有找到，则会去它的`__proto__`隐式原型上查找，即它的构造函数的`prototype`，如果还没有找到就会再在构造函数的`prototype`的`__proto__`中查找，这样一层一层向上查找就会形成一个链式结构，我们称为原型链

```js
Object.prototype.name = '10086';
function Person() {}
const p = new Person();
// 第一步，在对象本身查找
p.hasOwnProperty('name'); // false
// 第二步，在对象隐式原型上查找
let fp = Object.getPrototypeOf(p);
fp.hasOwnProperty('name'); // false
// 第三步，在原型的原型上查找
fp = Object.getPrototypeOf(fp);
fp.hasOwnProperty('name'); // true --- 找到了
```