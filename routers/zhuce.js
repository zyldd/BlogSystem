/**
 * Created by Administrator on 2017/9/4.
 */
const express = require('express');
const router = express.Router();

// NodeJS内置的加密模块
const crypto = require('crypto');

const User = require('../models/user');

// 注册页面的跳转
router.get('/zhuce', function(req, res){
    res.render('zhuce', {
        title:'注册页面',
        user:req.session.user,
        // 将某状态的描述信息转换成字符串发送给浏览器端
        // 如果状态存在，发送其描述信息
        // 如果不存在，发送则是undefined
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    })
});

// 注册数据的验证及保存
router.post('/zhuce', function(req, res){
    console.log(req.body);

    var uname = req.body.uname;
    
    // 验证两次密码是否一致
    var pass = req.body.password;
    var passRe = req.body['re-password'];
    if( pass != passRe ){
        req.flash('error', '两次密码不一致，请重新输入');
        return res.redirect('/zhuce');
    }

    //判断用户名是否存在
    User.findOne({uname:uname}).exec(function(err, data){
        if(err){
            req.flash('error', err);
            return res.redirect('/zhuce');
        }
        if(data){
            req.flash('error', '用户名已注册，请重新输入...');
            return res.redirect('/zhuce');
        }
        // 密码加密，将加密后的内容(报文摘要)保存至数据库中
        // 创建md5的哈希算法
        // hash：散列函数，将任意输入内容，转换成固定长度的输出
        var md5 = crypto.createHash('md5');
        // 通过算法，将密码进行加密
        var password = md5.update(req.body.password).digest('hex');
        console.log(password);
        // 生成用户数据
        var user = new User({
            uname:uname,
            password:password,
            email:req.body.email,
            time:new Date()
        });

        // 保存用户数据
        user.save(function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('/zhuce');
            }
            req.flash('success', '用户注册成功，请登录...');
            res.redirect('/denglu');
        })

    })


})

module.exports = router;




