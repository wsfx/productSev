var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')

var index = require('./routes/index');
//var users = require('./routes/users');
var users = require('./api/users');
var food_entry = require('./api/food_entry');
var base = require('./api/base');
var history = require('connect-history-api-fallback');

// var app = express({
//   setHeaders: function (res, path, stat) {
//     res.set('x-timestamp', Date.now())
//     res.set('Access-Control-Allow-Origin', '*' )
//   }
// });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'),{maxAge:1000*60*60}));
app.use(express.static(path.join(__dirname, 'uploads'),{maxAge:1000*60*60}));
app.use(cors({
  origin: '*' 
}))

app.use('/api', base);
app.use('/api/user', users);
app.use('/api/food_entry', food_entry);
app.use('*', index);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

/**
 * vue 项目打包
 * 
 * 环境区分
 * process.env.NODE_ENV   区分   production（运行环境）    development（开发环境）
 * 在js代码可以根据这个环境变量来区分开发环境和运行环境
 * 应用场景
 * 定义一些全局的baseUrl之类的操作  因为开发环境和运行环境下，这些值可能是不一样的
 * 例如：
 * 开发环境：
 *  前端项目： localhost:8080  
 *  接口地址： 192.168.0.1:3000   后端提供的开发环境的接口
 * 运行环境下
 *  前端项目：www.ele.com
 *  接口地址：api.ele.com   
 * 
 * 在线上可以使用Nginx配置反选代理（） 
 * 如果运行环境下不使用反向代理，并且接口是跨域的，那么本地开发的时候就不能使用反向代理配置了，
 * 那么本地开发就使用定义baseUrl的方式，来确定接口域名
 * 
 * 
 * 
 * var baseUrl = 192.168.0.1:3000  || api.ele.com
 * 可以更具环境去设置变量的值
 * 1，使用process.env.NODE_ENV 
 * 2，使用webpack里面的HtmlWebpackPlugin在html页面输出ejs模板  （常用）
 * 
 * api.ele.com/api/getList
 * api.ele.com/api/getList
 * 192.168.0.1:3000/api/getList
 * ${baseUrl}/api/getList
 * 
 * 
 * 开发环境  
 * 运行环境   （ 测试环境 ，正式环境）
 * 
 * 项目上线
 * vue 使用 npm run build   生成dist文件夹
 * 
 * |--static
 * |--|--css
 * |--|--js
 * |--|--|--app.[hash].js    业务代码 (每次打包hash值都会发生变化)
 * |--|--|--chunk.[hash].js  第三方包合并代码 (如果没有引入新的包则不发生变化)
 * |--|--images
 * |--index.html
 * 
 * 
 * hash作用：
 * 
 * 
 * 优化
 * 添加缓存：（給静态资源添加缓存）
 * 消灭304请求（）
 * 304：当静态资源缓存后（因为缓存使用过期时间的，当时间到了，浏览器就会想服务器发出请求请求新内容）
 * 但是如果内容没有变化，服务将不会给浏览器返回资源，请求重定向到浏览器端请求缓存内容，
 * 304其实相当于白白浪费一次请求
 * 
 * 消灭304：给缓存内容的时间变长；
 * 但是有迎来新的问题，资源更新了怎么办，
 * （清除缓存重新加载或者ctrl+f5强制刷新）但是这两种方法没有办法告诉用户
 * 
 * 给静态文件的路径添加后缀
 * 之前的方法是在每个静态资源的后面添加一个时间戳
 * app.js?time=213123123
 * 现在的方法
 * 使用webpack，gulp每次打包在文件名的地方添加hash值
 * aap.[hash].js
 * 
 * hash是怎么生成的？
 * 首先hash需要保证唯一性
 * 根据文件内容提取，根据文件大小，配合时间戳
 * 
 * 
 * 再次优化，在块一点
 * 
 * 资源优化
 * 减少http请求：
 *    合并js但是并不是减少ajax的请求
 *    懒加载
 *    雪碧图（有问题，png图片相对于jpg图片大出好多）  图片压缩， 或者小的图片直接变成base64图片
 *    添加缓存  （后端支持）
 *    消灭304  （webpack，gulp都帮我们自动完成了）
 * 再快
 *    压缩，合并（webpack，gulp都帮我们自动完成了）
 *    使用cdn资源（cdn加速服务器）
 * 
 * 
 * 数据问题
 *   ajax请求是异步的但是带来一个问题，不知道那个请求先返回，合并多个ajax请求，使用一个回调
 * 
 * 
 * 如果项目是h5动画推广项目，或者游戏
 * 预加载（保证用户进来看到的就是完整内容）
 * 
 * 添加loding
 * 
 * 但是如果项目在大一点
 * 先让第一屏加载，在他看第一屏的时候，加载第二屏（分屏加载）
 * 动画：
 * 能用css写，就不用图片（）， 使用骨骼动画（但是太过复杂）
 * 在简单一点的弄个gif，但是（gif不高清，颜色的支持少）
 * 
 * 动画实现：
 * canvas  svg
 * 
 * 
 * 代码的优化：俩字解耦
 * 
 * 目录规范的确定
 * 组件的划分
 * 命名规范
 * 添加单元测试
 * 
 * 
 * 代码优化的目的
 * 提高项目的可维护性
 * 
 * 
 * href，src  加载一个文件，一个是加载css，一个是加载js有什么区别？
 * 
 * 
 * 
 */