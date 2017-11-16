SQL 增删改查

增：INSERT INTO 表(字段列表) VALUES(值)
eg: 

```SQL
INSERT INTO user_table (username,password,online) VALUES('lolita','888888',0)
```

删：DELETE FROM 表 WHERE 条件
eg: 

```SQL
DELETE FROM user_table WHERE ID=1
```

改：UPDATE 表 SET 字段=新值，字段=新值 ..... WHERE 条件
eg: 

```SQL
UPDATE user_table SET password='555555' WHERE ID=2
```

查：SELECT 字段列表 FROM 表 WHERE 条件
eg: 

```SQL
SELECT username,online FROM user_table WHERE ID=1
```

接口：

用户注册: /reg?user=xxx&pass=xxx

返回消息：`{'code':0,'msg':'信息'}`

用户登录: /login?user=xxx&pass=xxx

返回消息：`{'code':0,'msg':'信息'}`

有两种请求，一种是请求文件，一种是请求接口

请求文件：

```
/1.html
/1.js
```

请求接口：

```
/reg?
/login?
```





ws请求接口：
'reg',user,pass    => 'reg_ret' ,code msg
'login',user,pass  => 'login_ret',code,msg
'msg', txt         => 'msg_ret',code,msg
                   => 'msg',name,txt