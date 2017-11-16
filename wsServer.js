const http = require('http')
const fs = require('fs')
const mysql = require('mysql')
const io = require('socket.io')

const db = mysql.createPool({host:'localhost',user:'root',password:'199507',database:'20171113'})

// http服务器
const httpServer = http.createServer((req,res) => {
    fs.readFile(`www${req.url}`,(err,data) => {
        if(err){
            res.writeHeader(404)
            res.write('not found')
        }else{
            res.writeHeader(200)
            res.write(data)
        }
        res.end()
    })
})

httpServer.listen(8080)

const sockets = []
// ws服务器
const wsServer = io.listen(httpServer)
wsServer.on('connection',socket => {
    sockets.push(socket)
    let cur_username = ''
    let cur_userId = 0

    // 注册
    socket.on('reg',(user,pass) => {
        // 1.校验数据
        if(!/^\w{6,32}$/.test(user)){
            socket.emit('reg_ret',1,'用户名不符合规范')
        }else if(!/^.{6,32}$/.test(pass)){
            socket.emit('reg_ret',1,'密码不符合规范')
        }else{
            // 2.检验用户名是否重复
            db.query(`SELECT ID FROM user_table WHERE username='${user}'`,(err,data) => {
                if(err){
                    socket.emit('reg_ret',1,'数据库有错')
                }else if(data.length>0){
                    socket.emit('reg_ret',1,'此用户已存在')
                }else{// 3.插入
                    db.query(`INSERT INTO user_table (username,password,online) VALUES('${user}','${pass}',0)`,(err,data) => {
                        if(err){
                            socket.emit('reg_ret',1,'数据库有错')
                        }else{
                            socket.emit('reg_ret',0,'注册成功')
                        }
                    })
                }
            })
        } 
    })

    // 登陆
    socket.on('login',(user,pass) => {
        // 校验数据
        if(!/^\w{6,32}$/.test(user)){
            socket.emit('login_ret',1,'用户名不符合规范')
        }else if(!/^.{6,32}$/.test(pass)){
            socket.emit('login_ret',1,'密码不符合规范')
        }else{
            db.query(`SELECT ID,password FROM user_table WHERE username='${user}'`,(err,data) => {
                if(err){
                    socket.emit('login_ret',1,'数据库有错')
                }else if(data.length == 0){
                    socket.emit('login_ret',1,'此用户名不存在')
                }else if(data[0].password != pass){
                    socket.emit('login_ret',1,'用户名或密码错误')
                }else{
                    // 改在线状态
                    db.query(`UPDATE user_table SET online=1 WHERE ID=${data[0].ID}`,(err) => {
                        if(err){
                            socket.emit('login_ret',1,'数据库有错')
                        }else{
                            socket.emit('login_ret',0,'登陆成功')
                            cur_username = user
                            cur_userId = data[0].ID
                        }
                    })
                }
            })
        }
    })

    // 离线
    socket.on('disconnect',function(){
        db.query(`UPDATE user_table SET online=0 WHERE ID=${cur_userId}`,(err,data) => {
            if(err){
                console.log('数据库有错',err)
            }
            cur_username = ''
            cur_userId = 0
            sockets = sockets.filter(item => item!=socket)
        })
    })

    // 发消息
    socket.on('msg',(txt) => {
        if(!txt){
            socket.emit('mst_ret',1,'消息文本不能为空')
        }else{
            // 广播给所有人，io有自己的广播
            sockets.forEach(item => {
                if(item == socket){
                    return;
                }
                item.emit('msg',cur_username,txt)
            })
            socket.emit('msg_ret',0,'发送成功')
        }
    })
})
