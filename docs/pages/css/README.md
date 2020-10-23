# css知识

## 1.盒模型
```css
/* W3C标准盒模型 */
.box {
  box-sizing: content-box;/* 默认值 */
  /* width = content */
}
/* IE盒模型（怪异盒模型） */
.box {
  box-sizing: border-box;
  /* width = content + padding + border */
}
/* padding: 内边距 */
/*  */
```

## 2.css新增伪类
```css
:root {} /* 文档的根元素，相当于 html */
.box:empty {} /* 选择没有子元素的节点 */
:not(selector) {} /* 选择除 selector 元素意外的元素 */
input:enabled {} /* 选择可用的表单元素 */
input:disabled {} /* 选择禁用的表单元素 */
input:checked {} /* 选择被选中的表单元素 */
:after /* 在元素内部最前添加内容 */
:before /* 在元素内部最后添加内容 */
```