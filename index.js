const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8888;
const pass='nFj(k/L3fT'
let site_after_login = {

}
let attempts={

}

app.use(express.static('public'))
app.use(express.json());

app.listen(PORT)

app.get('*', function(req, res){ 
    if(req.path.includes('.html')){
        res.send(`<script>location.replace('${req.path.replace(/.html/g,'')}')</script>`)
    }else{
        res.sendFile(path.join(__dirname,'login.html'))
        let info=(req.path=='/')?('/index.html'):(req.path+'.html')
            if (fs.existsSync(path.join(__dirname,'public/secure'+info))) {
                if(!site_after_login[req.path.replace(/\//g,'⁄')]){
                    site_after_login[req.path.replace(/\//g,'⁄')]={
                        content:{
                            type: 'filepath',
                            send: path.join(__dirname,'public/secure'+info)
                        },
                        passcode:pass
                    }
                }
            }
    }
})
app.post('/get/*',function(req, res){
    if(res.code==pass&&(!req.path.includes('.html'))){
        fs.readFile(path.join(__dirname,'public/secure'+req.request), 'utf8' , (err, data) => {
            if (err) {
              res.send(err)
            }
            res.send(data)
        })
    }
})
app.post('/login/*',function(req, res){
    if(req.body.path&&req.body.code&&req.body.ip){
        if(req.body.ip.split('.').length==4){
            if(site_after_login[req.body.path]){
                if(attempts[req.body.ip]){if(attempts[req.body.ip]==3){res.send(JSON.stringify([0,"Sorry, <br>you were wrong too many times."]))}else{run()}}else{run()}
                function run(){
                    if(req.body.code===site_after_login[req.body.path].passcode){
                        if(site_after_login[req.body.path].content.type=='filepath'){res.sendFile(site_after_login[req.body.path].content.send)}
                        else{res.send(JSON.stringify([1,site_after_login[req.body.path].content.send]))}
                        if(attempts[req.body.ip]) {attempts[req.body.ip]=0}
                    }else{
                        if(attempts[req.body.ip]) {attempts[req.body.ip]++} else {attempts[req.body.ip]=1}
                        res.send(JSON.stringify([0,"That's the wrong code.<br>Refreshing in 2 seconds. <script>if(true){setTimeout(function(){location.reload()},2000)}"]))
                    }
                }
            }else{
                res.send(JSON.stringify([0,"404. That's an error."]))
            }
        }else{
            res.send(JSON.stringify([0,"invalid ip. (haCkER mAn)<br>Refreshing in 2 seconds. <script>if(true){setTimeout(function(){location.reload()},2000)}"]))
        }
    }
    fs.writeFile(path.join(__dirname,'ip.txt'),JSON.stringify(attempts),function(){})
})