/**
 * Created by Administrator on 2017/9/4.
 */


const mongoose = require('mongoose');
// 连接数据库
mongoose.connect('mongodb://localhost/bokesys1');

var db = mongoose.connection;

//验证数据库连接是否成功
db.on('error', function(){
    console.log('数据库连接失败');
});

db.once('open', function(){
    console.log('数据库连接成功');
});

module.exports = db;


