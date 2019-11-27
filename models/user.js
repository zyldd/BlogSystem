
//
const db = require('./dbs');
const mongoose = require('mongoose');


// 设置用户的数据结构及数据类型
const userSchema = mongoose.Schema({
    uname:String,
    password:String,
    email:String,
    time:Date
});

// 创建用户的数据集合，及所遵循的数据结构
const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;