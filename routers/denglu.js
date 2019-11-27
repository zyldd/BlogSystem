/**
 * Created by Administrator on 2017/9/4.
 */

const express = require('express');
const User = require('../models/user');
const router = express.Router();
const crypto = require('crypto');

// 登录页面跳转
router.get('/denglu', function(req, res){
    res.render('denglu', {
        title:'登录页面',
        user:req.session.user,
        // 将某状态的描述信息转换成字符串发送给浏览器端
        // 如果状态存在，发送其描述信息
        // 如果不存在，发送则是undefined
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    })
})

// 登录数据提交

router.post('/denglu', function(req, res){
    var uname = req.body.uname;
    // 验证用户是否注册过
    User.findOne({uname:uname}).exec(function(err, data){
        if(err){
            req.flash('error', err);
            return res.redirect('/zhuce');
        }
        if( !data ){
            req.flash('error', '用户名未注册，请注册');
            return res.redirect('/zhuce');
        }
        /// 验证密码是否匹配
        // 密码加密
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        if( password != data.password ){
            req.flash('error', '用户名或密码错误');
            return res.redirect('/denglu');
        }
        // 将登录成功的用户信息保存至session中
        req.session.user = data;
        req.flash('success', '用户登录成功...');
        res.redirect('/');

    })

});
// 退出
router.get('/tuichu', function(req, res){
    // 清空session对象
    req.session.user = null;
    req.flash('success', '用户退出成功');
    res.redirect('/');
})



module.exports = router;



