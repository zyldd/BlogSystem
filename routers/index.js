
const express = require('express');
// 生成路由对象
const router = express.Router();
const PostModel = require('../models/article');


// 默认的首页路径是  / ,
router.get('/', function (req, res) {
    // console.log(req);
    // console.log( req.session.user );  // undefined
    // console.log(req.query.page);
    // 设置页码的初始值  parseInt() 将字符串转换成整型数字
    // parseFloat() 浮点数
    var page = parseInt(req.query.page || 1)  // ?
    // 设置每页显示的文章数量
    var size = 10;

    PostModel.find().count(function (err, count) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/zhuce');
        }
        // 页码数量
        var pageTotal = Math.ceil(count / size);

        // pages:存储的是显示的页码，及其个数：length, 5
        // page = 10
        var pages = [page];
        var left = page;
        var right = page;
        // [1,2,3,4,5] 
        // i++
        // ++i
        while ( (right < pageTotal) || (left > 1)  && pages.length < 5 ) {
            // 4,5,6,7,8
            if (right < pageTotal) {
                pages.push(++right);
            }
            // 3,4,5,6,7
            // 2,3,4,5,6
            if (left > 1) {
                pages.unshift(--left);
            }
        }

        // get请求路径及其请求数据的结构:
        // /login?name=value&name=value
        // sort()排序   skip(n)跳过n篇文章，limit(m)限制显示m篇文章
        PostModel.find().sort({ 'time.date': -1 }).skip(size * (page - 1)).limit(size).exec(function (err, posts) {
            // console.log(count);
            // console.log(posts);
            if (err) {
                req.flash('error', err);
                return res.redirect('/zhuce');
            }
            res.render('index', {
                title: '博客系统首页',
                // 将session中的用户信息发送给浏览器端
                // 如果数据存在，发送数据
                // 如果数据不存在，发送则是undefined
                user: req.session.user,
                // 将某状态的描述信息转换成字符串发送给浏览器端
                // 如果状态存在，发送其描述信息
                // 如果不存在，发送则是undefined
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                posts: posts,
                page: page,
                pageTotal: pageTotal,
                pages: pages
                // isLast:  
            })


        })


    })






})


// 标签种类页面处理
router.get('/tags', function (req, res) {

    // distinct() 方法使用类似于find()
    // 查询集合数据中，某个字段(数据的属性名)的所有的不重复的值
    PostModel.distinct('tags').exec(function (err, tags) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/tags');
        }
        // console.log(tags);

        // req.flash('success', '');

        res.render('tags', {
            title: '标签种类',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            tags: tags
        })
    });


})

// 获取单个标签种类的文章
router.get('/tags/:tag', function (req, res) {
    // 获取请求路径中的参数
    // console.log( req.params );
    var tag = req.params.tag;
    PostModel.find({ tags: tag }).sort({ 'time.date': -1 }).exec(function (err, posts) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/tags');
        }
        console.log(posts);
        res.render('tag', {
            title: 'TAG: ' + tag,
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            posts: posts
        })
    })
})

// 删除单个文章
router.get('/remove/:author/:time/:title', function (req, res) {
    PostModel.findOneAndRemove({
        author: req.params.author,
        'time.day': req.params.time,
        title: req.params.title
    }).exec(function (err) {
        if (err) {
            req.flash('error', err);
            // 生成固定的路径
            var url = encodeURI('/u/' + req.params.author + '/' +
                req.params.time + '/' + req.params.title)
            return res.redirect(url);
        }
        req.flash('success', '文章删除成功');
        res.redirect('/');
    })
})

// 文章编辑页面跳转
router.get('/edit/:author/:time/:title', function (req, res) {

    PostModel.findOne({
        author: req.params.author,
        'time.day': req.params.time,
        title: req.params.title
    }).exec(function (err, post) {
        if (err) {
            req.flash('error', err);
            var url = encodeURI('/u/' + req.params.author + '/' +
                req.params.time + '/' + req.params.title)
            return res.redirect(url);
        }
        if (!post) {
            req.flash('error', '文章不存在');
            return res.redirect('/');
        }
        res.render('edit', {
            title: '编辑页面',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            post: post
        })

    })


})

// 文章编辑页面数据更新
router.post('/edit/:author/:time/:title', function (req, res) {
    PostModel.findOneAndUpdate({
        author: req.params.author,
        'time.day': req.params.time,
        title: req.params.title
    }, req.body).exec(function (err) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        req.flash('success', '文章更新成功');

        var url = encodeURI('/u/' + req.params.author + '/' +
            req.params.time + '/' + req.params.title)
        return res.redirect(url);
    })
})

// 处理评论内容，并保存至数据库中
router.post('/comment/:author/:time/:title', function (req, res) {
    console.log(req.body);
    var now = new Date();
    // 设置文章发布的时间格式
    req.body.time = {
        date: now,
        year: now.getFullYear(),
        month: now.getFullYear() + '-' + (now.getMonth() + 1),
        day: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate(),
        minute: now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() +
        ' ' + (now.getHours() < 10 ? '0' : '') + now.getHours() +
        ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()
        /// 毫秒的时间
    }
    var url = encodeURI('/u/' + req.params.author + '/' +
        req.params.time + '/' + req.params.title)
    PostModel.findOne({
        author: req.params.author,
        'time.day': req.params.time,
        title: req.params.title
    }).exec(function (err, data) {
        if (err) {
            req.flash('error', err);

            return res.redirect(url);
        }
        if (!data) {
            req.flash('error', '文章不存在');
            return res.redirect('/');
        }
        data.comments.push(req.body);
        // data.comments.unshift(req.body);
        PostModel.findOneAndUpdate({
            author: req.params.author,
            'time.day': req.params.time,
            title: req.params.title
        }, data).exec(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect(url);
            }
            req.flash('success', '评论成功')
            res.redirect(url);
        })
    })
})

// 作者的文章获取
router.get('/u/:author', function(req, res){
    var page = parseInt(req.query.page || 1)  // ?
    // 设置每页显示的文章数量
    var size = 5;

    var author = req.params.author
    PostModel.find({author}).count(function(err, count){

    if (err) {
            req.flash('error', err);
            return res.redirect('/zhuce');
        }
        // 页码数量
        var pageTotal = Math.ceil(count / size);

        // pages:存储的是显示的页码，及其个数：length, 5
        // page = 10
        var pages = [page];
        var left = page;
        var right = page;
        // [1,2,3,4,5] 
        // i++
        // ++i
        while ( (right < pageTotal) || (left > 1)  && pages.length < 5 ) {
            // 4,5,6,7,8
            if (right < pageTotal) {
                pages.push(++right);
            }
            // 3,4,5,6,7
            // 2,3,4,5,6
            if (left > 1) {
                pages.unshift(--left);
            }
        }

        PostModel.find({author}).sort({ 'time.date': -1 }).skip(size * (page - 1)).limit(size).exec(function(err, posts){
            if(err){
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('index', {
                title:req.params.author,
                success:req.flash('success').toString(),
                error:req.flash('error').toString(),
                user:req.session.user,
                posts:posts,
                page: page,
                pageTotal: pageTotal,
                pages: pages
            })
        })
    })
})

// 存档处理
router.get('/storage', function(req, res){
    PostModel.find().sort({ 'time.date': -1 }).exec(function(err, posts){
        if(err){

        }
        res.render('tag', {
            title: '存档 ',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            posts: posts
        })
    })
})
// 导出模块
module.exports = router;


