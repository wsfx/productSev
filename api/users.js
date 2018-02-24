var express = require('express');
var router = express.Router();
var connection = require('../db/configMsql.js')

/* GET home page. */
router.post('/login_do', function(req, res, next) {
  let sql = 'select * from users where phone=? and password=?'

  console.log(req.body)
  connection.query(sql, [
    req.body.phone,
    req.body.password
  ], (err, result) => {
    console.log(result)
    if (result.length >= 1) {
      res.cookie('phone',req.body.phone,{ maxAge: 1000*60*60*2,httpOnly:true, path:'/'})
      
      res.json({
        code:1,
        msg: '登录成功'
      })
    } else {
      res.status(401).json({
        code:0,
        msg: '登录失败'
      })
    }
  })
});

router.get('/getUserInfo', function(req, res, next) {
  let phone = req.cookies.phone
  let sql = 'select * from users where phone=?'
  if (phone) {
    connection.query(sql, [
      phone
    ], (err, result) => {
      if (result) {
        res.json({
          code:1,
          data: result
        })
      }
    })
  } else {
    res.status(401).json({
      code:0,
      msg: '未登录没有权限'
    })
  }
});
/**
 * 解决跨域的方案
 * jsonp 动态生成一个script标签，通过src属性发送请求，其实就相当于请求了个js文件，在src地址后面添加一个callback参数，callback参数
 * 的值是js中动态生成的一个方法，后端接到callback的值，数据的返回格式就是  方法名({参数})，只要jsonp请求成功就会执行这个方法
 * 1，只能get请求
 * 2，没有失败回调
 * 
 * cors（跨域资源共享） 前端没有变化，后端需要配置Access-Control-Allow-Origin: '允许的域名' || *
 * 1. 不能操作cookie
 * 
 * 反向代理
 * 可以使用nginx代理跨域， 在项目中通过 proxy 可以设置反向代理
 * 
 * 
 * 前后端未分离的问题
 * 后端工程师（rb） ： 嵌套页面，嵌套页面会出现一些问题，他不会html，css， 
 * 前后端沟通就会浪费太多时间（结构的嵌套，样式兼容问题）
 * 
 * 前后端分离的概念
 * 后端工程师再也不需要嵌套页面，只需要提供数据接口就可以了，
 * 前端工作量相对增大，前端薪资普遍提高
 * 
 * 其中的问题就是
 * 反过来了，数据结构无法使用，沟通能力的重要性
 * 
 * 
 */


module.exports = router;