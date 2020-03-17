const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const agent = require('proxy-agent')
const request = require("request").defaults({ rejectUnauthorized: false })
app.get('/', function (req, res) { res.sendFile(__dirname + '/index.html') })
var timeout = 3
io.on('connection', function (socket) {
    socket.on('timeout', function (value) { timeout = value })
    socket.on('check', function (text) {
        var proxies = text.split('\n')
        proxies.forEach(proxy => {
            //  if (proxy == proxies.pop()) socket.emit('finish', 'finished!')
            request.get({
                url: "https://google.com/ncr",
                strictSSL: true,
                agent: new agent('http://' + proxy),
                timeout: timeout * 1000
            }, function (error, response, body) {
                if (!error)
                    if (response.body.includes('Google')) {
                        socket.emit('work', proxy)
                        console.log('Live: ' + proxy)
                    }
            })
        })
    })
})
server.listen(1337, function () { console.log(`listening on *:1337`) })