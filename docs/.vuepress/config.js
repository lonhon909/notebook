const path = require('path');

module.exports = {
  // base: '', // 部署站点的基础路径
  title: 'javascript', // 网站的标题，它将会被用作所有页面标题的前缀
  description: 'javascript', // 网站的描述，它将会以 <meta> 标签渲染到当前页面的 HTML 中
  // head: [ // 额外的需要被注入到当前页面的 HTML <head> 中的标签
  //   ['link', { rel: 'icon', href: '/logo.png' }]
  // ],
  // host: '', // 指定用于 dev server 的主机名。
  port: '8088', // 指定 dev server 的端口
  // theme:
  themeConfig: { // 为当前的主题提供一些配置，这些选项依赖于你正在使用的主题
    // logo: '/assets/img/logo.png', // 导航栏 Logo
    sidebarDepth: 1, //
    displayAllHeaders: true, // 显示所有页面的标题链接 0.
    activeHeaderLinks: false,
    sidebar: [
      ['', '首页'],
      ['/pages/prototype-chain/', '原型及原型链'],
      ['/pages/mobile/', '移动端H5常见问题'],
      ['/pages/less/', 'less用法'],
      ['/pages/https/', 'http/https'],
      ['/pages/VNode/', '虚拟DOM'],
      ['/pages/regular-expressions/', '正则表达式']
    ],
    smoothScroll: true
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@as': path.resolve(__dirname, './assets'),
        '@img': path.resolve(__dirname, './assets/img')
      }
    }
  }
}