# 正则表达式

正则表达式是匹配模式，要么匹配字符，要么匹配位置。

## 两种模糊匹配

- 横向模糊匹配
  > 实现的方式是使用量词。譬如{m,n}，表示连续出现最少m次，最多n次
- 纵向模糊匹配
  > 其实现的方式是使用字符组。譬如[abc]，表示该字符是可以字符“a”、“b”、“c”中的任何一个。

<a href="https://juejin.im/post/5965943ff265da6c30653879">正则表达式全解</a>

## 字符组

```js
/a[123]b/中的[123],

/a[^123]b/中的[^123]

系统自带的简写
\d : [0-9]  digit(英：数字)
\D : [^0-9]
\w : [0-9a-zA-Z_] 数字、字母、下划线
\W : [^0-9a-zA-Z_]
\s : 空格、水平制表符、垂直制表符、换行符、回车符、换页符
```

## 量词

```js
{m, n} // 最少m次，最多n次
{m,} // 最少m次
{m} // 固定m次
? // {0, 1}
+ // {1,}
* // {0,}
```

### 贪婪模式与惰性模式

- 贪婪模式 ： 尽可能多的匹配
- 惰性模式 ： 尽可能少的匹配

```js
// 通过在量词后面加个问号就能实现惰性匹配
const reg = /ab{2,}?c/;

```

## 如何匹配位置呢
