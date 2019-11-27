/**
 * Created by Administrator on 2017/9/6.
 */
const express = require('express');
const router = express.Router();
const PostModel = require('../models/article');

// 文章页面跳转路径
router.get('/u/:author/:time/:title', function(req, res){
    console.log( req.params );


    PostModel.findOne({
        author:req.params.author,
        'time.day':req.params.time,
        title:req.params.title
    }).exec(function(err, data){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        if(!data){
            req.flash('error', '该文章不存在...');
            return res.redirect('/');
        }
        data.reads++;
// 当刷新页面时，更新阅读量，并将更新的数据保存至数据库中
        PostModel.findOneAndUpdate({
            author:req.params.author,
            'time.day':req.params.time,
            title:req.params.title
        }, data).exec(function(err){
            if(err){
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('post', {
                post:data,
                title:req.params.title,
                user:req.session.user,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            })
        })


    })
})



module.exports = router;

