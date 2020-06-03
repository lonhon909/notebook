let http = require('http'),
fs = require('fs'),
path = require('path'),
url = require("url")
http.createServer((req,res)=>{
  let pathname = __dirname + url.parse(req.url).pathname; // 获取文件路径
  let statusCode = 200 // 响应头状态码
  let extname = path.extname(pathname) // 获取文件扩展名
  let headType = 'text/html' // 内容类型
  if( extname){
    switch(extname){
      case '.html':
       headType = 'text/html'
      break;
      case '.js':
        headType = 'text/javascript'
      break;
    }
  }
  // fs.readFile(pathname, function (err, data) {
  //   res.writeHead(statusCode, {
  //     'Content-Type': headType,
  //     'Expires':new Date(Date.now() + 20000).toUTCString(), // 设置文件过期时间为10秒后
  //   });
  //   res.end(data);
  // });

  // 省略其他代码
  let stat = fs.statSync(pathname);
  fs.readFile(pathname, function (err, data) {
    // 判断请求头的文件修改时间是否等于服务端的文件修改时间
    /* if(req.headers['if-modified-since'] === stat.mtime.toUTCString()) { // mtime为文件内容改变的时间戳
      statusCode = 304;
    }
    res.writeHead(statusCode, {
      'Content-Type': headType,
      'Last-Modified':stat.mtime.toUTCString()
    });
    res.end(data);  */ 
    let Etag = `${data.length.toString(16)}${stat.mtime.toString(16)}`
    if((req.headers['if-modified-since'] === stat.mtime.toUTCString()) || (req.headers['if-none-match'] === Etag)) {
      statusCode = 304;
    }
    res.writeHead(statusCode, {
      'Content-Type': headType,
      Etag
    });
    res.end(data);
  });

}).listen(3000)

console.log("Server running at http://127.0.0.1:3000/");