# Promise A+

### 1、`promise` 是通过 `new` 调用，是一个构造函数

```js
// 原生promise是一个构造函数
new Promise()

// 因此我们可以将自己的promise写成es6中的类形式
class MyPromise {}
```

### 2、`A+` 规范：一个 `Promise` 的当前状态必须为以下三种状态中的一种：等待态 `Pending` 、执行态 `Fulfilled` 和拒绝态 `Rejected` 。

```js
// A+规范规定一个promise的状态只能是以下三种之一，这里我们先声明三个状态常量
const PENDING = 'Pending';
const FULFILLED = 'Fulfilled';
const REJECTED = 'Rejected';

class MyPromise {
  constructor(exector) {
    this.state = PENDING; // 初始状态为等待态
    this.value = undefined; // 成功的结果
    this.reason = undefined; // 失败的原因

    const resolve = () => {};
    const reject = () => {};
    // 执行器，原生promise调用时，new Promise(fn).then()，这里面的fn就是执行器
    exector(resolve, reject);
  }
}
```

+ A+规范规定：只有等待态可以迁移至执行态或拒绝态，需要判断当前状态是否为等待态
```js
const resolve = (value) => {
  // A+规范规定：只有等待态可以迁移至执行态或拒绝态
  if (this.state === PENDING) {
    // 状态一旦确定就不能再改变了，这里修改promise的状态，防止再次修改
    this.state = FULFILLED;
    this.value = value;
  }
}
const reject = (reason) => {
  // A+规范规定：只有等待态可以迁移至执行态或拒绝态
  if (this.state === PENDING) {
    this.state = REJECTED;
    this.reason = reason;
  }
}
```

+ 执行器可能出现异常，比如出现语法错误，这里需要`try catch`包裹
```js
// 原生promise调用时，new Promise(fn).then...，这里面的fn就是执行器
try {
  exector(resolve, reject);
} catch (error) {
  // 如果执行器出错，直接将promise的状态修改为失败态，失败的原因就是js执行错误的原因
  reject(error);
}
```

### 3、一个 `promise` 必须提供一个 `then` 方法以访问其当前值、终值和据因

```js
class MyPromise {
  constructor(exector) {
    // ...省略
  }

  // A+：一个 promise 必须提供一个 then 方法以访问其当前值、终值和据因。
  then(onFulfilled, onRejected) {
    // A+规定：如果 onFulfilled 不是函数，其必须被忽略，这里如果不是函数直接覆盖
    if (typeof onFulfilled !== 'function') {
      // 这里为啥要用这个函数覆盖onFulfilled -- ①
      onFulfilled = (value) => value;
    }
    // A+规定：如果 onRejected 不是函数，其必须被忽略，这里如果不是函数直接覆盖
    if (typeof onRejected !== 'function') {
      // 这里为啥要用这个函数覆盖onRejected -- ②
      onRejected = (reason) => { throw reason };
    }

    // 成功态调用
    if (this.state === FULFILLED) {
      onFulfilled(this.value)
    }

    // 失败态调用
    if (this.state === REJECTED) {
      onRejected(this.reason);
    }
  }
}
```

#### ①：如果`onFulfilled`不是函数需要将成功的结果传递下去，下列第一个`then`没有参数，即`onFulfilled`不为函数，但是第二个`then`接收到了`resolve`的结果，`resolve`的结果传递下去了
```js
// 原生Promise
new Promise((resolve) => {
  resolve('成功')
})
.then()
.then((res) => {
  console.log(res); // 成功
})
```
#### ②：如果`onRejected`不是函数需要将失败的原因传递下去，下列第一个`then`没有参数，即`onRejected`不为函数，但是第二`then`的`onRejected`方法接收到`reject`的结果，`reject`的结果传递下去了
```js
// 原生Promise
new Promise((resolve, reject) => {
  reject('失败')
})
.then()
.then(() => {}, (res) => {
  console.log(res); // 失败
})
```

#### 3.1、实现`MyPromise`异步
> 下面案列2未打印出结果，`promise`的状态在`setTimeout`中被修改，当then方法执行时，`promise`的状态还处于初始态，这里需要将`onFulfilled`和`onRejected`暂存，等待promise的状态转变为执行态或失败态时，执行相应的函数。
```js
// 1
new MyPromise((resolve, reject) => {
  resolve('成功🌶');
}).then(res => {
  console.log(res); // 成功🌶
})
// 2
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功🌶');
  }, 1000)
}).then(res => {
  console.log(res); // 未执行
})
```

#### 3.1.1、将`onFulfilled`和`onRejected`缓存，等待promise的状态改变后依次执行回调

```js
class MyPromise {
  constructor() {
    // ...省略

    /*********** ++ **********/
    this.onFulfilledCallbacks = []; // 成功态回调队列
    this.onRejectedCallbacks = []; // 拒绝态回调队列
    /*********** ++ **********/

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        /*********** ++ **********/
        this.onFulfilledCallbacks.forEach((fn) => fn(this.value))
        /*********** ++ **********/
      }
    }
    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        /*********** ++ **********/
        this.onRejectedCallbacks.forEach((fn) => fn(this.reason))
        /*********** ++ **********/
      }
    }
  }

  then() {
    // ... 省略

    /*********** ++ **********/
    // 异步支持，当执行到then方法时，promise的状态可能还未改变（处于初始态）
    if (this.state === PENDING) {
      // 这个onFulfilledCallbacks为啥要用数组 --- ③
      this.onFulfilledCallbacks.push((value) => {
        onFulfilled(value)
      })
      // 这个onFulfilledCallbacks为啥要用数组 --- ③
      this.onRejectedCallbacks.push((value) => {
        onRejected(value);
      })
    }
    /*********** ++ **********/
  }
}
```

#### ③：一个promsie可能被多次调用，需要将所有的回调暂存，等待promise的状态变后，按照其注册顺序依次回调
```js
const p = new Promise((resolve) => { settimeout(resolve, 1000) });
p.then((res) => {}); // 第一次
p.then((res) => {}); // 第二次
...
p.then((res) => {}); // 第n次
```

### 4、then方法必须返回一个 promise 对象，promise支持链式调用

```js
then(onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function') {
    // ...
  }
  if (typeof onRejected !== 'function') {
    // ...
  }
  
  let promise2;

  // 成功态调用
  if (this.state === FULFILLED) {
    // then方法必须返回一个promise，因此这里需要包装一层promise对象
    promise2 = new MyPromise((resolve, reject) => {
      // 同理这里执行onFulfilled可能出现js等异常，需要trycatch包裹
      try {
        const x = onFulfilled(this.value);
        resolve(x);
      } catch (error) {
        reject(error);
      }
    })
  }

  // 失败态调用
  if (this.state === REJECTED) {
    promise2 = new MyPromise((resolve, reject) => {
      try {
        const x = onRejected(this.reason);
        resolve(x);
      } catch (error) {
        reject(error);
      }
    })
  }

  if (this.state === PENDING) {
    promise2 = new MyPromise((resolve, reject) => {
      this.onFulfilledCallbacks.push((value) => {
        try {
          let x = onFulfilled(value);
          resolve(x);
        } catch (error) {
          reject(error);
        }
      })

      this.onRejectedCallbacks.push((value) => {
        try {
          const x = onRejected(value);
          resolve(x);
        } catch (error) {
          reject(error);
        }
      })
    })
  }
  return promise2;
}
```

### 5、Promise 解决过程

```js
function handlePromise(promise2, x, resolve, reject) {
  // 1、如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  if (promise2 === x) { // ---- ⑥
    return reject(new TypeError('循环引用'))
  }
  // 2、x 为 Promise
  // 如果x是一个promise对象 （该判断和下面 判断是不是thenable对象重复 所以可有可无）
  if (x instanceof MyPromise) {}
  // 3、x 为对象或函数
  if (x !== null && (typeof x === 'function' || typeof x === 'object')) {
    let called; // 避免多次调用
    try {
      // 3.1、把 x.then 赋值给 then
      let then = x.then;
      // 3.3、如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
      if (typeof then === 'function') {
        try {
          then.call(x, y => {
            // 3.3.1、如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
            if (called) return;
            called = true;
            handlePromise(promise2, y, resolve, reject);
          }, r => {
            // 3.1.1.2、如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
            if (called) return;
            called = true;
            reject(r);
          })
        } catch (error) {
          // 3.1.1.4、如果调用 then 方法抛出了异常 e
          if (called) return;
          called = true;
          reject(error);
        }
      } else {
        // 3.1.2、如果 then 不是函数，以 x 为参数执行 promise
        resolve(x);
      }
    } catch (error) {
      // 3.2、如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 3.4、如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}
```

#### ⑥：循环引用，`promise2`是`MyPromise`的实例，`then`返回的`promise2`需要取得`x`的状态，由于`promise2`===`x`，于是相互等待对方的状态，即`promise`状态一直处于`初始态`。
```js
const p = new MyPromise(resolve => { resolve() });
const promise2 = p.then(() => promise2);
promise2.catch((err) => {
  console.log(err); // TypeError: 循环引用
})
```

#### 6、`onFulfilled` 和 `onRejected` 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行

```js
// 先看下这个案例
new Promise((resolve) => {
  Promise.resolve().then(() => {
    resolve(1);
  }).then(() => {
    console.log(2)
  })
}).then((res) => {
  console.log(res)
})
```