/**
 * Created by Administrator on 2017/9/4.
 */

const express = require('express');
const router = express.Router();
const PostModel = require('../models/article');

// 发布页面跳转
router.get('/fabu', function(req, res){
    res.render('fabu', {
        title:'文章发布',
        user:req.session.user,
        // 将某状态的描述信息转换成字符串发送给浏览器端
        // 如果状态存在，发送其描述信息
        // 如果不存在，发送则是undefined
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    })
})


// 发布数据提交保存
router.post('/fabu', function(req, res){

    // 文章数据保存
    // 1.标签
    // 2.时间：至少分两种显示：年月日， 年月日时分秒
    // 3.阅读
    // 4.评论
    console.log(req.body);
    // 获取当前的用户信息
    const currentUser = req.session.user;
    req.body.author = currentUser.uname;
    req.body.tags = [req.body.tag1, req.body.tag2, req.body.tag3];
    //
    var postFabu = new PostModel(req.body);
    // console.log(postFabu);
    // console.log( postFabu.timeFabu() );
    postFabu.time = postFabu.timeFabu();

    // 保存数据
    postFabu.save(function(err){
        if(err){
            req.flash('error', err);
            return res.redirect('/zhuce');
        }
        req.flash('success', '发布成功');
        res.redirect('/');
    })

})

module.exports = router;




