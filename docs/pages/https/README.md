# http / https

## http/https - 重定向，状态码：3xx

`URL` 重定向，也称为 `URL` 转发，是一种当实际资源，如单个页面、表单或者整个 `Web` 应用被迁移到新的 `URL` 下的时候，保持（原有）链接可用的技术。`HTTP` 协议提供了一种特殊形式的响应—— `HTTP` 重定向（`HTTP redirects`）来执行此类操作

- `301` 永久重定向，该操作比较危险，需要谨慎操作：如果设置了`301`，但是一段时间后又想取消，但是浏览器中已经有了缓存，还是会重定向
- `302` 临时重定向，但是会在重定向的时候改变 `method`: 把 `POST` 改成 `GET`，于是有了 `307`
- `307` 临时重定向，在重定向时不会改变 `method`
- `304` Not Modified，资源未被修改，会使页面跳转到本地陈旧的缓存版本当中

`知乎,淘宝`

<img src="@img/http1.png" class="images h200" />
<img src="@img/http2.png" class="images h200" />

## 状态码

- 1XX 表示消息
- 2XX 表示成功
- 3XX 表示重定向
- 4XX 表示客户端错误
- 5XX 表示服务端错误

## http Cache - 缓存

HTTP缓存可以分为强缓存和协商缓存。

- <a href="https://segmentfault.com/a/1190000021374783">HTTP缓存实战</a>

- <a href="https://juejin.im/post/5b3c87386fb9a04f9a5cb037#heading-9">面试精选之http缓存
</a>