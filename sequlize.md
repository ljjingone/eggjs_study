7-6 Sequelize 常用增删改查函数
Sequelize 常用增删改查函数
Sequelize 常用增删改查函数
增删改查对应的函数

sql	函数
select	findAll, findOne, findByPk, findAndCountAll
update	update
insert	create
update	delete
1，查询
1.1 查询单条数据
const user = await ctx.model.User.findOne({
  attributes: ['id', 'name'], // 结果过滤,只显示 id，name 字段
  // attributes: { exclude: ['role'] } // 不显示 role 字段
  where: {
    id: id
  },
  order: [ // 排序
    ['showCount', 'DESC']
  ]
});

// 字段重命名：查询属性（字段）可以通过传入一个嵌套数据进行重命名
attributes: ['id', ['name', 'myName']]
将字段name重命名为myName，这样返回的结果里面的字段就是myName
1.2 查询多条数据
const user = await ctx.model.User.findAll({
  limit: 10, //每页10条
  offset: 0*10, //第x页*每页个数
  where: {} // 条件
});
1.3 分页查询
// 返回列表的总数
const { app, ctx } = this;
const { gt } = app.Sequelize.Op;
const user = await ctx.model.User.findAndCountAll({
  limit: 10, //每页10条
  offset: 0*10, //第x页*每页个数
  where: { // 条件
    id: {
      [gt]: 6 // id > 6
    }
  } 
});
1.4 通过id查询
const user = await ctx.model.User.findByPk(1);
1.5 查询单个数据
const user = await ctx.model.User.findOne({
  where: {} // 条件
});
1.6 分组查询
分组查询通常要与聚合函数一起使用，聚合函数包括：

聚合函数	功能
COUNT	用于统计记录条数
SUM	用于计算字段的值的总和
AVG	用于计算字段的值的平均值
MAX	用于查找查询字段的最大值
MIX	用于查找查询字段的最小值
// 求表中num字段值的和
const { app, ctx } = this;
const { fn, col } = app.Sequelize;
// fn 指的是函数
// col 指的是字段
const user = await ctx.model.User.findOne({
  attributes: [[fn('SUM', col('num')), 'all_num']]
  where: {} // 条件
});

sql语句：select sum('num') as 'all_count' ...
2，新增
// 如果id为自增的主键，那么新增数据时候不需要添加id
const user = await ctx.model.User.create({ name, age });
3，修改
// 修改之前先判断这条数据是否存在
const user = await ctx.model.User.findByPk(id);

// 如果数据存在，再修改
await user.update({ name, age }, {
  where: {}
});
4，删除
// 删除之前先判断这条数据是否存在
const user = await ctx.model.User.findByPk(id);

// 如果数据存在，再修改
await user.destroy();
5，关联查询
所谓的关联查询就是根据谁来查询谁，比如根据用户来查询评论（一对多，一个用户发表了许多评论），根据评论来查询用户（一对一，一个评论只属于一个用户）。
我们使用”用户表“和”评论表“来举例：
先来定义model

5.1 数据库表的内容如下：
# 角色表
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
INSERT INTO `roles` VALUES (1, '管理员');
INSERT INTO `roles` VALUES (2, '运营人员');
INSERT INTO `roles` VALUES (3, '测试人员');
# 用户表
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `pwd` varchar(50) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
INSERT INTO `user` VALUES (1, 'admin', '1234');
INSERT INTO `user` VALUES (2, 'user', '1234');
INSERT INTO `user` VALUES (3, 'user2', '1234');
# 用户详情表
CREATE TABLE `userDetail` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(10) NOT NULL,
  `age` int NOT NULL,
  `addr` varchar(120) NOT NULL,
  `avatar` varchar(1100) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
INSERT INTO `userDetail` VALUES (1, 1, 18, '地址', 'http://xx.jpg');
INSERT INTO `userDetail` VALUES (2, 2, 19, '地址', 'http://xx.jpg');
# 评论表
CREATE TABLE `comment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(10) NOT NULL,
  `msg` varchar(320) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
INSERT INTO `comment` VALUES (1, 1, 'comment1');
INSERT INTO `comment` VALUES (2, 1, 'comment2');
# 用户与角色关联表
CREATE TABLE `userRoles` (
  `userId` int(10) NOT NULL,
  `rolesId` int(10) NOT NULL,
  PRIMARY KEY (`userId`, `rolesId`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
INSERT INTO `userRoles` VALUES (1, 1);
INSERT INTO `userRoles` VALUES (2, 2);
INSERT INTO `userRoles` VALUES (2, 3);
INSERT INTO `userRoles` VALUES (3, 3);
其中，各个表之间存在联系为：

user与userDetail存在一对一关系，一个用户只有一条详情信息
user与comment存在一对多关系，一个用户有多条评论
user与roles存在多对多关系，中间表为userRoles，一个用户可以有多个角色，一个角色也可以有多个用户
5.2 根据数据表的结构，我们确定关系并写好model目录下相关文件
user.js
module.exports = app => {
  const { STRING, INTEGER, TEXT, DATE } = app.Sequelize;

  const User = app.model.define('user', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    username: STRING(20),
    password: STRING(64),
  });

  User.associate = function (){
    // 与userDetail存在一对一关系，所以是hasOne()
    app.model.User.hasOne(app.model.UserDetail, {foreignKey: 'userId'});
    // 与comment存在一对多关系，所以使用hasMany()
    app.model.User.hasMany(app.model.Comment, {foreignKey: 'userId', targetKey: 'id'});
    // 与roles存在多对多关系，使用belongsToMany()
    app.model.User.belongsToMany(app.model.Roles, {
        through: app.model.UserRoles, // 通过哪张中间表进行关联
        foreignKey: 'userId',
        otherKey: 'rolesId'
    });
  }

  return User;
}
comment.js
// 评论model
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Comment = app.model.define('comment', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: INTEGER,
    msg: STRING(500),
  });

  // 关联查询
  Comment.associate = () => {
    // 与user存在多对一关系，所以使用belongsTo()
    app.model.Comment.belongsTo(app.model.User, { foreignKey: 'userId' });
  }

  return Comment;
}
userDetail.js
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const UserDetail = app.model.define('userDetail', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: INTEGER,
    age: INTEGER,
    addr: STRING(120),
    avatar: STRING(1100),
  });

  UserDetail.associate = () => {

  }

  return UserDetail;
}
roles.js
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Roles = app.model.define('roles', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: STRING(50),
  });

  Roles.associate = () => {
    // 与user表是多对多关系
    app.model.Roles.belongsToMany(app.model.User, {
      through: app.model.UserRoles,
      foreignKey: 'rolesId',
      otherKey: 'userId'
    });
  }

  return Roles;
}
userRoles.js
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const UserRoles = app.model.define('userRoles', {
    userId: INTEGER,
    rolesId: INTEGER,
  });

  UserRoles.associate = () => {

  }

  return UserRoles;
}
总结：在Model的实例里面，重写Model的associate方法，将关联的关系放到里面。

hasOne()和belongsTo()第一个参数为本表关联的另外一个表的Model实例，第二个参数中，都有foreginKey属性，对hasOne来说，这个属性值是对方表与自己Id对应的字段，对belongsTo来说，这个属性值是本表上的与对方表id对应的字段名。belongsTo比hasOne多了个targetKey属性，其为对方表的对应主键名；

has开头的方法中，foreginKey属性值从对方的表上找，如果有targetKey的值则是自己的主键；

belongs开头的方法中，foreginKey属性值在自身表上找，targetKey属性值则是对方表上；

一对一的方法有： hasOne(Model, {foreignKey:对方,})和belongsTo(Model,{foreignKey:自己,targetKey:对方})；

一对多的方法有： hasMany(Model,{foreignKey:对方, targetKey:自己})和belongsTo(Model,{foreignKey:自己,targetKey:对方})；

多对多的方法有： belongsToMany(Model,{through:Model, targetKey:自己, otherKey:对方})；

5.3 关联查询
一对一
在controller里面写代码
async userInfo(){
  const { ctx, app } = this;
  let result = await app.model.User.findAll({
    include: {
      model: app.model.UserDetail
    }
  });
  ctx.body = result;
}
返回结果：

[
  {
    "id": 1,
    "name": "admin",
    "pwd": "1234",
    "userDetail": {
      "id": 1,
      "userId": 1,
      "age": 18,
      "addr": "地址",
      "avatar": "http://xx.jpg"
    }
  },
  {
    "id": 2,
    "name": "user",
    "pwd": "1234",
    "userDetail": {
      "id": 2,
      "userId": 2,
      "age": 19,
      "addr": "地址",
      "avatar": "http://xx.jpg"
    }
  }
]
一对多
async userCommentLists(){
  const { ctx, app } = this;
  let result = await app.model.User.findOne({
    include: {
      model: app.model.Comment
    }
  });
  ctx.body = result;
}
返回结果：

{
  "id": 1,
  "name": "admin",
  "pwd": "1234",
  "comments": [
    {
      "id": 1,
      "userId": "1",
      "msg": "comment1"
    },
    {
      "id": 2,
      "userId": "1",
      "msg": "comment2"
    }
  ]
}
多对多
获取某个用户的下的所有角色
async roles(){
  const { ctx, app } = this;
  let result = await app.model.User.findAll({
    where:{
      id: 2,
    },
    include: [
      {model: app.model.UserDetail},
      {model: app.model.Roles}
    ]
  });
  ctx.body = result;
}
返回结果：

[
  {
    "id": 2,
    "name": "user",
    "pwd": "1234",
    "userDetail": {
      "id": 2,
      "userId": 2,
      "age": 19,
      "addr": "地址",
      "avatar": "http://xx.jpg"
    },
    "roles": [
      {
        "id": 2,
        "name": "运营人员",
        "userRoles": {
          "userId": 2,
          "rolesId": 2
        }
      },
      {
        "id": 3,
        "name": "测试人员",
        "userRoles": {
          "userId": 2,
          "rolesId": 3
        }
      }
    ]
  }
]
获取角色下的所有用户

async rolesWithUser(){
  const { ctx, app } = this;
  let result = await app.model.Roles.findAll({
    include: [
      {model: app.model.User},
    ]
  });
  ctx.body = result;
}
返回结果：

[
  {
    "id": 1,
    "name": "管理员",
    "users": [
      {
        "id": 1,"name": "admin","pwd": "1234",
        "userRoles": {"userId": 1,"rolesId": 1}
      }
    ]
  },
  {
    "id": 2,
    "name": "运营人员",
    "users": [
      {
        "id": 2,"name": "user","pwd": "1234",
        "userRoles": { "userId": 2,"rolesId": 2}
      }
    ]
  },
  {
    "id": 3,
    "name": "测试人员",
    "users": [
      {
        "id": 2,"name": "user","pwd": "1234",
        "userRoles": {"userId": 2,"rolesId": 3}
      },
      {
        "id": 3,"name": "user2","pwd": "1234",
        "userRoles": {"userId": 3,"rolesId": 3}
      }
    ]
  }
]