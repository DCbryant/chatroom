const http = require('http')
const fs = require('fs')
const mysql = require('mysql')
const io = require('socket.io')
const url = require('url')


const db = mysql.createPool({host:'localhost',user:'root',password:'199507',database:'20171113'})

const httpServer = http.createServer((req,res) => {
    let {pathname,query} = url.parse(req.url,true)

    if(pathname === '/reg'){
        let {user,pass} = query

        // 1.校验数据
        if(!/^\w{6,32}$/.test(user)){
            res.write(JSON.stringify({code:1,msg:'用户名不符合规范'}))
            res.end()
        }else if(!/^.{6,32}$/.test(pass)){
            res.write(JSON.stringify({code:1,msg:'密码不符合规范'}))
            res.end()
        }else{
            // 2.检验用户名是否重复
            db.query(`SELECT ID FROM user_table WHERE username='${user}'`,(err,data) => {
                if(err){
                    res.write(JSON.stringify({code:1,msg:'数据库有错'}))
                    res.end()
                }else if(data.length>0){
                    res.write(JSON.stringify({code:1,msg:'此用户名名已存在'}))
                    res.end()
                }else{// 3.插入
                    db.query(`INSERT INTO user_table (username,password,online) VALUES('${user}','${pass}',0)`,(err,data) => {
                        if(err){
                            res.write(JSON.stringify({code:1,msg:'数据库有错'}))
                            res.end()
                        }else{
                            res.write(JSON.stringify({code:0,msg:'注册成功'}))
                            res.end()
                        }
                    } )
                }
            })
        }    
    }else if(pathname === '/login'){
        let {user,pass} = query
        // 校验数据
        if(!/^\w{6,32}$/.test(user)){
            res.write(JSON.stringify({code:1,msg:'用户名不符合规范'}))
            res.end()
        }else if(!/^.{6,32}$/.test(pass)){
            res.write(JSON.stringify({code:1,msg:'密码不符合规范'}))
            res.end()
        }else{
            db.query(`SELECT ID,password FROM user_table WHERE username='${user}'`,(err,data) => {
                if(err){
                    res.write(JSON.stringify({code:1,msg:'数据库有错'}))
                    res.end()
                }else if(data.length == 0){
                    res.write(JSON.stringify({code:1,msg:'此用户名不存在'}))
                    res.end()
                }else if(data[0].password != pass){
                    res.write(JSON.stringify({code:1,msg:'用户名或密码错误'}))
                    res.end()
                }else{
                    db.query(`UPDATE user_table SET online=1 WHERE ID=${data[0].ID}`,(err,data) => {
                        if(err){
                            res.write(JSON.stringify({code:1,msg:'数据库有错'}))
                            res.end()
                        }else{
                            res.write(JSON.stringify({code:0,msg:'登陆成功'}))
                            res.end()
                        }
                    })
                }
            })
        }

    }else{//假设就两接口
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
    }
    
})
httpServer.listen(8080)