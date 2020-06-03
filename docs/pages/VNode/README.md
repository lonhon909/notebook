## react 与 vue 数组中 key 的作用是什么

### 要想知道 `key` 在`patch`过程的作用，必须知道`VNode`的生成以及更新真实`DOM`过程中`key`的使用

### 组件生成的`VNode`

有如下`vue`组件

```html
<!-- template -->
<ul>
  <!-- 这里使用key -->
  <li v-for="item in list" :key="item.id">{{ item.value }}</li>
</ul>
```
```js
// data数据
list = [
  { id: "number", value: "Number" },
  { id: "string", value: "String" },
  { id: "boolean", value: "Boolean" }
]
```

上面组件生成`VNode`

```js
vnode = {
  tag: 'ul',
  key: null,
  children: [{
    tag: 'li',
    // 这个key即模板列表中li元素的key
    key: 'number',
    children: { tag: null, children: 'Number', ... },
    ... // 其他属性
  },{
    tag: 'li',
    key: 'string',
    children: { tag: null, children: 'String', ... }
    ...
  },{
    tag: 'li',
    key: 'boolean',
    children: { tag: null, children: 'Boolean', ... },
    ...
  }],
  ...
}
```

这个`key`将在新旧`DOM`更新时起到对比作用

如果不使用`key`的情况

```html
<ul>
  <li v-for="item in list">{{ item.value }}</li>
</ul>
```

生成的`VNode`如下

```js
// 不使用key
vnode = {
  tag: 'ul',
  key: null,
  children: [{
    tag: 'li',
    key: '0', // 实际为'|0'竖线(|)+索引拼接而成，这里直接索引，不影响理解
    children: { tag: null, children: 'Number', ... },
    ...
  },{
    tag: 'li',
    key: '1',
    children: { tag: null, children: 'String', ... }
    ...
  },{
    tag: 'li',
    key: '2',
    children: { tag: null, children: 'Boolean', ... },
    ...
  }],
  ...
}
```

注意：不使用`key`时，h函数（生成VNode函数）内部会为列表（多子节点）生成默认的`key`，默认的`key`由列表数组下标生成。

```js
// 生成key
function normalizeVNodes(children) {
  const newChildren = []
  // 遍历 children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.key == null) {
      // 如果原来的 VNode 没有key，则使用竖线(|)与该VNode在数组中的索引拼接而成的字符串作为key
      child.key = '|' + i
    }
    newChildren.push(child)
  }
  // 返回新的children
  return newChildren
}
```

> 通过上面的`VNode`可知，模板列表中使用了`key`将作为该的子节点对应`VNode`中的`key`值，如果模板列表中没有使用`key`，一个简单的`key`将会被生成。

### 核心diff - key的使用

我们都知道，当组件状态被修改时，页面上真实`DOM`需要得到更新，`Vue` 会尽可能的尝试修复/再利用相同类型元素。

如上面的列表数据发生改变时:

```js
// 顺序改变
list = [
  { id: "string", value: "String" },
  { id: "boolean", value: "Boolean" },
  { id: "number", value: "Number" }, // 下标由 0 --> 2
]
```

当组件状态改变时，组件会生成新的`VNode`:

```js
// 新VNode
// 注意新的VNode顺序使用新的数据生成
newVnode = {
  tag: 'ul',
  key: null,
  children: [{
    tag: 'li',
    key: 'string',
    children: { tag: null, children: 'String', ... }
    ...
  },{
    tag: 'li',
    key: 'boolean',
    children: { tag: null, children: 'Boolean', ... },
    ...
  },{ // 下标由 0 --> 2
    tag: 'li',
    key: 'number',
    children: { tag: null, children: 'Number', ... },
    ...
  }],
  ...
}
```

组件状态改变时会调用组件的`render`函数生成新的`VNode`，通过对比新旧`VNode`高效更新`DOM`。现在新旧`VNode`都已存在，是时候`patch`真实`DOM`了，通过对比新旧`VNode`,查找能复用的节点，添加旧`VNode`不存在的新节点，或删除新`VNode`中不需要的节点。

核心`Diff`针对新旧`VNode`子节点都是多节点的情况，也就是真实`DOM`更新前后列表都为多子元素情况，其他新旧`VNode`单个子节点或无子节点的情况不在这里讨论。

```js
/**
 * 新旧VNodeChildren都为多个子节点 patch
 * @param { VNode | VNode[] | string } prevChildren 旧子节点VNode列表
 * @param { VNode | VNode[] | string } nextChildren 新子节点VNode列表
 * @param { Element } container 容器
 */
function patchChildren(prevChildren, nextChildren, container) {
  // 遍历新的VNode列表
  for (let i = 0; i < nextChildren.length; i++) {
    const nextVNode = nextChildren[i];
    let find = false; // 是否找到对应旧节点
    // 遍历旧的VNode列表
    for (let j = 0; j < prevChildren.length; j++) {
      const prevVNode = prevChildren[j];
      // 对比新旧key,如果找到相同的key则可以直接更新复用DOM
      if (nextVNode.key === prevVNode.key) {
        find = true;
        ... // 更新真实DOM 并移动位置
        break;
      }
    }

    // 未找到旧节点，说明该节点为新增节点
    if (!find) {
      ... // 挂载新节点
    }
    
    // 遍历旧节点，查找是否新VNode列表中是否存在，如果不存在，说明这个节点需要被移除
    ...
  }
}
```

### 分析总结

- 1、遍历新的`VNode`如果在旧`VNode`中存在相同的`key`，即认为该节点应该被更新复用

  > 如果模板找中不使用`key`,此时`VNode`将会生成默认的 `key`,那么新旧 `VNode`遍历查找 `key`时，会发现新`VNode`子节点与旧`VNode`的子节点位置按数组下标一一对应。如上面组件`list`数据仅顺序有变更，最有效`patch`应该是移动节点即可，而默认的 `key`将会更新所有的子元素。

- 2、未找到旧节点，说明该节点为新增节点， 直接挂载该新节点即可

- 3、遍历旧节点，查找是否新VNode列表中是否存在，如果不存在，说明这个节点需要被移除

  > 模板不使用`key`时，可能会造成本应该移除的节点被复用，应该被复用的节点被删除。如上面组件`list`删除第二项（id="string"）时，新的`VNode`中`key`值集合为[0, 1]，而旧的`VNode`中`key`值集合为[0, 1, 2]，对比发现旧`VNode`中`key = 1`的虚拟节点（id = "string"）被复用，而应该被复用的项`key = 2`（id = "boolean"）反而被移除。