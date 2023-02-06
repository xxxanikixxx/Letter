function htmlspecialchars(str){
    return (str + '').replace(/&/g,'&amp;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;'); 
}

const { execSync } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

let ini = fs.readFileSync('../letter.conf', {encoding:'utf-8'})
    .replace(/ /g,'');

let conf = [];

iniItem = ini.split('\n');
for( let ind in iniItem ) {
    if( iniItem[ind][0] == "#" )
        continue;
    let item = iniItem[ind].split('=');
    if( item.length == 1 )
        continue;
    else if( item.length != 2 ) {
        for(let ii=2 ; ii<item.length ; ++ii )
            item[1] = item[1] + '=' + item[ii];
    }
    conf[item[0]] = item[1];
}

let logLevel = 0;
if( conf['log'] ) {
    if( conf['log'] == '0' )
        logLevel = 0;
    else if( conf['log'] == '1' )
        logLevel = 1;
    else if( conf['log'] == '2' )
        logLevel = 2;
}


let wss = "";
let server = "";

if( conf['mode'] == "https") {
    const https = require('https');
    
    if( !('ssl_crt' in conf)  ||
        !('ssl_key' in conf)  )  {
        console.log("SSL error");
        return;
    }
    server = https.createServer({
        cert: fs.readFileSync(conf['ssl_crt']),
        key: fs.readFileSync(conf['ssl_key'])
    });
}
else if( conf['mode'] == "http" ) {
    const http = require('http');
    server = http.createServer();
}
else {
    console.log("write 'mode = [https, http]' in letter.conf!' ");
    return;
}

wss = new WebSocket.Server({ server });

roomList = {};
teacherList = {};
studentList = {};
userList = {};
userNum = 0;

myIP = [];


function getTime() {
    let date = new Date();
    let str = date.getFullYear()
        + '/' + ('0' + (date.getMonth() + 1)).slice(-2)
        + '/' + ('0' + date.getDate()).slice(-2)
        + ' ' + ('0' + date.getHours()).slice(-2)
        + ':' + ('0' + date.getMinutes()).slice(-2)
        + ':' + ('0' + date.getSeconds()).slice(-2)
        + '(JST)';

    return str;
}



wss.on('connection', function connection(ws,req) {
    //connect時
    const ip = req.socket.remoteAddress;
    

    if( myIP.indexOf(ip) == -1 ) {
        let token = funcConnect(ws);
        if( logLevel >= 1 )
            console.log( getTime() + '  connect from : ' + ip + '    token : '+token );
        if( logLevel >= 2 ) {
            console.log("----------------------- " + getTime() + " -----------------------------");
            console.log("-------------- room list ----------------")
            console.dir(roomList, {depth:3});
            console.log("-------------- user list ----------------")
            console.dir(userList, {depth:1});
            console.log("");
        }
    }
    
    //receive message
    ws.on('message', function incoming(message) {


        if( myIP.indexOf(ip) != -1 ) {
            let msg = "-------------- room list ----------------\n";
            
            for( room in roomList ) {
                msg = msg + "  " + room + "\n";
                for( key in roomList[room] )
                    msg = msg + "    " + key + ":" + roomList[room][key] + "\n";
            }
            msg = msg + "-------------- user list ----------------\n";
            
            sendMsg(ws, msg);
        }
        else {
            d = JSON.parse(message);
            let token = d['token'];
            
            if(  userList[token] !== undefined) {
                let action = d['action'];
                let role = userList[token]['role'];
                if(      action === "mkRoom"      &&  role=="n" ) funcMkRoom(ws, d);
                else if( action == "delRoom"      &&  role=="t" ) funcDelRoom(ws, d);
                else if( action == "iconAllow"    &&  role=="t" ) funcIconUpdate(ws, d);
                else if( action == "iconDeny"     &&  role=="t" ) funcIconUpdate(ws, d);
                else if( action == "intoRoomFS"   &&  role=="n" ) funcIntoRoomFS(ws, d);
                else if( action == "intoRoomTAFS" &&  role=="n" ) funcIntoRoomTAFS(ws, d);
                else if( action == "exitRoomFS"   && (role=="s" || role=="TA")) funcExitRoomFS(ws, d);
                else if( action == "exitRoomFT"   &&  role=="t" ) funcExitRoomFT(ws, d);
                else if( action == "selectIconFS" &&  role=="s" ) funcSelectIconFS(ws, d);
                else if( action == "chatFS"       && (role=="s" || role=="TA") ) funcChatFS(ws, d);
                else if( action == "nameChangeFS" && (role=="s" || role=="TA" || role=="t") ) funcNameChangeFS(ws, d);
                else if( action == "supportFTA"   && (role=="TA" || role=="t") ) funcSupportFTA(ws, d);
                else if( action == "iconReset"    &&  role=="t" ) funcIconReset(ws, d);
                else if( action == "setWS"        && (role=="s" || role=="TA")   ) funcSetWS(ws, d);
                else if( action == "getLatestData" && (role=="TA" || role=="t") ) funcGetLatestData(ws, d);
                else if( action == "pin" ) funcPinPon(ws, d);
            }
            else {
                let msgJson = JSON.stringify({"action":"delToken"});
                sendMsg(ws, msgJson);
                msgJson = JSON.stringify({"action":"msg","msg":"リロードしてください。"});
                sendMsg(ws, msgJson);
            }


            if( logLevel >= 2 ) {
                console.log("----------------------- " + getTime() + " -----------------------------");
                console.log(d);
                console.log("-------------- room list ----------------")
                console.dir(roomList, {depth:3});
                console.log("-------------- user list ----------------")
                console.dir(userList, {depth:1});
                console.log("");
            }
        }
        
    });

    ws.on('close', function close() {
        
     
        funcDisConnect( ws );

        if( logLevel >= 2 ) {
            console.log("----------------------- " + getTime() + " -----------------------------");
            console.log("-------------- room list ----------------")
            console.dir(roomList, {depth:3});
            console.log("-------------- user list ----------------")
            console.dir(userList, {depth:1});
            console.log("");
        }

    });
    
});




function funcDisConnect( ws ) {
    for( let token in userList ) {
        
        if( userList[token]['ws'] != ws ) 
            continue;

        if( logLevel >= 1 )
            console.log(getTime() + ' ---- dis connect token : '+token );    
        
        if( userList[token]['role'] == "n" )
            funcDelayDelete(token);
        else {
            userList[token]['ws'] = "";
            let room = userList['roomName'];
            if( roomList[room] )
                roomList[room]['students'][token] = "hoge";
            userList[token]['timeOutHandle'] = setTimeout(funcDelayDelete, 1000 * 60 * 60 , token);
        }
    }
}


function funcDelayDelete(token) {
    
    if( userList[token] ) {
        
        if( userList[token]['role'] == "t") {
            funcDelRoom( userList[token]['ws'], {"token":token});
        }
        else {
            funcExitRoomFS( userList[token]['ws'], {"token":token} );
        }

        if( logLevel >= 1 )
            console.log(getTime() + ' ---- delete token : '+token );
        delete userList[token];

        if( logLevel >= 2 ) {
            console.log("----------------------- " + getTime() + " -----------------------------");
            console.log("-------------- room list ----------------")
            console.dir(roomList, {depth:3});
            console.log("-------------- user list ----------------")
            console.dir(userList, {depth:1});
            console.log("");
        }
    }
}


function funcSupportFTA( ws, d ) {
    let token = d['token'];
    let roomName = userList[token]['roomName'];
    if( !roomList[roomName] )
        return;
    let teacher = roomList[roomName]['teacher'];
    if( !userList[teacher] )
        return;
    
    let supStuID = "";
    let supStuTok = "";
    
    if( userList[token]['supportCount'] != d['supportCount'] ) {
        supStuTok = userList[token]['support'];
        if( userList[supStuId] )
            supStuID = userList[supStuTok]['ID'];
        else {
            supStuTok = "";
            supStuID = "";
        }
            
    }
    else {
        for(let tok in roomList[roomName]['iconMember']['iconHand'] ) {
            if( userList[tok]['support'] == token ) {
                let msg = {"token":tok,
                           "target":"iconLogin"};
                funcSelectIconFS( ws, msg );
            }
            else if( userList[tok]['support'] == "" ) {
                supStuID = userList[tok]["ID"];
                supStuTok = tok;
                break;
            }
        }
        
    }
    userList[token]['supportCount']++;
    
    userList[token]['support'] = supStuTok;
    if( userList[supStuTok] )
        userList[supStuTok]['support'] = token;

    roomList[roomName]['taAck']++;
    let msg = {"action":"supportFT",
               "taID":userList[token]["ID"],
               "supportedStuID":supStuID,
               "supportCount":userList[token]['supportCount'],
               "ackUpdate": roomList[roomName]['taAck']};
    
    for( stid in roomList[roomName]['TA'] ) 
        sendMsg(userList[stid]['ws'], JSON.stringify(msg));
}




function funcNameChangeFS( ws, d ) {
    let newName = d['name'];

    if( newName.length == 0 )
        return;

    let token = d['token'];

    let roomName = userList[token]['roomName'];

    if( !roomList[roomName] )
        return;

    userList[token]['name'] = newName;
    roomList[roomName]['taAck']++;
    let msg = {"action":"changeNameFS",
               "stuID":userList[token]['ID'],
               "name":newName,
               "ackUpdate": roomList[roomName]['taAck']};
    
    for( stid in roomList[roomName]['TA'] ) 
        sendMsg(userList[stid]['ws'], JSON.stringify(msg));
}


function funcChatFS( ws, d ) {
    let token = d['token'];

    let roomName = userList[token]['roomName'];

    if( !roomList[roomName] )
        return;
    
    let msg = {"action":"chatFS",
               "msg":d['msg']};
    
    for( stid in roomList[roomName]['TA'] ) 
        sendMsg(userList[stid]['ws'], JSON.stringify(msg));

    msg = {"action":"chatFT",
           "msg":d['msg']};

    sendMsg(ws, JSON.stringify(msg));
}



function funcSelectIconFS( ws, d, reSet = false ) {

    let token = d['token'];
    let preIcon = userList[token]['selectedIcon'];
    let roomName = userList[token]['roomName'];
    
    delete roomList[roomName]['iconMember'][preIcon][token];
    if( roomList[roomName]['iconState'][d['target']] == "iconDeny" )
        d['target'] = 'iconLogin';

    roomList[roomName]['iconMember'][d['target']][token] = userList[token]['name'];
    userList[token]['selectedIcon'] = d['target'];
    
    let supportToken = userList[token]['support'];
    if( supportToken != ''  &&  reSet == false ) {
        if( userList[supportToken] )
            userList[supportToken]['support'] = "";
        userList[token]['support'] = "";
    }

    
    if( !roomList[roomName] )
        return;
    let teacher = roomList[roomName]['teacher'];
    if( !userList[teacher] )
        return;

    if( reSet == false ) {
        roomList[roomName]['taAck']++;
        let msg = {"action":"selectIconToTA",
                   "ID":userList[token]["ID"],
                   "target":d['target'],
                   "ackUpdate": roomList[roomName]['taAck']};
        
        for( stid in roomList[roomName]['TA'] ) 
            sendMsg(userList[stid]['ws'], JSON.stringify(msg));
    }

    msg = {"action":"selectIconToStu",
           "target":d['target']};
    if( !userList[d['token']] )
        return;
    sendMsg(userList[d['token']]['ws'], JSON.stringify(msg));
}


function funcExitRoomFT( ws, d ) {
    if( !userList[d["removeToken"]] )
        return;

    let student = userList[d["removeToken"]];
    student['roomName'] = "";
    student['role'] = "n";
    student['selectedIcon'] = "iconLogin";
    
    let msg = {"action":"exitRoomFT"};
    sendMsg(student['ws'], JSON.stringify(msg));
}


function funcExitRoomFS( ws, d ) {
    let token = d['token'];
    let user = userList[ token ];
    
    let room = user['roomName'];
    if( !roomList[room] )
        return;
    
    if( user['role'] == "s" ) {
        if( roomList[room]['students'][token] ) {
            delete roomList[room]['students'][token];
        }
        if( roomList[room]['iconMember'][user['selectedIcon']][token] )
            delete roomList[room]['iconMember'][user['selectedIcon']][token];
    }

    else if( user["role"] == "TA" ) {
        if( user['support'] != "" ) {
            let stuTok = user['support']
            let msg = {"action":"selectIconFS",
                       "target":"iconLogin",
                       "token":stuTok};
            
            funcSelectIconFS(userList[stuTok]['ws'], msg );
        }

        
        if( roomList[room]['TA'][token] )
            delete roomList[room]['TA'][token];
    }
    
    if( user['support'] ) {
        let supTok = user['support'];
        userList[supTok]['support'] = "";
        user['support'] = "";
    }

    
    let teacherId = roomList[room]['teacher'];
    if( !userList[teacherId] )
        return;

    roomList[room]['taAck']++;
    let msgJson = JSON.stringify({"action":"exitRoomFS",
                                  "removeID":userList[d['token']]['ID'],
                                  "ackUpdate": roomList[room]['taAck']});
    
    for( stid in roomList[room]['TA'] ) 
        sendMsg(userList[stid]['ws'], msgJson);
    
    let student = userList[token];
    student['roomName'] = "";
    student['role'] = "n";
    student['selectedIcon'] = "iconLogin";

    let msg = {"action":"exitRoomFT"};
    sendMsg(student['ws'], JSON.stringify(msg));
}


function funcIntoRoomFS( ws, d ) {
    let roomName = htmlspecialchars(d['roomName']);
    
    if( roomList[roomName]  == null  ) {
        let msg = {"action":"msg", "msg":"その部屋は存在していません。 "+d['roomName']};
        sendMsg(ws, JSON.stringify(msg));
        return;
    }
    let token = d['token'];
    
    userList[ token ]['roomName'] = roomName;
    userList[ token ]['role'] = 's';
    roomList[roomName]['students'][ token ] = "hoge";
    roomList[roomName]['iconMember']['iconLogin'][token] = userList[token]['name'];

    roomList[roomName]['taAck']++;
    let msg = {"action":"intoRoomToTA",
               "ID":userList[ token ]['ID'],
               "name": userList[ token ]['name'],
               "ackUpdate": roomList[roomName]['taAck'],
               "roomName":d['roomName']};

    let teacher = roomList[roomName]['teacher'];
    if( !userList[teacher] )
        return;
    
    for( stid in roomList[roomName]['TA'] ) 
        sendMsg(userList[stid]['ws'], JSON.stringify(msg));

    sws = userList[d['token']]['ws'];
    
    msg = {"action":"intoRoomToStu",
           "name": userList[ d['token'] ]['name'],
           "roomName":d['roomName']};


    sendMsg(sws, JSON.stringify(msg));
    
    let msgJson = JSON.stringify({"action":"iconUpdate","iconState":roomList[d['roomName']]['iconState']});
    sendMsg(sws, msgJson);

}




function funcIntoRoomTAFS( ws, d ) {

    let roomName = d['roomName'];
    let token = d['token'];
    if( roomName in roomList  ==  false ) {
        let msg = {"action":"msg","msg":"その部屋は存在していません。 " + roomName };
        sendMsg(ws, JSON.stringify(msg));
        return;
    }
    let room = roomList[roomName];
    if( room['taPass'] == "" ) {
        let msg = {"action":"msg","msg":"ホストがアシスタント用パスワードを設定してません。"};
        sendMsg(ws, JSON.stringify(msg));
        return;
    }

    
    if( room['taPass'] != d["TApasswd"] ) {
        let msg = {"action":"msg","msg":"パスワードが違います。"};
        sendMsg(ws, JSON.stringify(msg));
        return;
    }

    userList[token]['selectedIcon'] = "iconTA";
    userList[token]['roomName'] = roomName;
    userList[token]['role'] = "TA";
    roomList[roomName]['TA'][token] = "hoge";


    let msg = {"action":"intoRoomTAFT",
               "ID": userList[token]['ID'],
               "name": userList[token]['name'],
               "ack": roomList[roomName]['taAck']};
    sendMsg(ws, JSON.stringify(msg));


    roomList[roomName]['taAck']++;
    msg['ackUpdate'] = roomList[roomName]['taAck'];
    
    msg['action'] = "intoRoomTAFTA";
    for( stid in room['TA'] ) {
        if( stid == d['token'] )
            continue;
        sendMsg(userList[stid]['ws'], JSON.stringify(msg));
    }
    
    sendLatestData(token);
}


function funcConnect(ws) {

    let msg = "";
    let token = "";

    while( true ) {
        token = require("crypto").randomBytes(32).toString("base64");
        if( !userList[token] )
            break;
    }
    userNum++;
    userList[token] = {};
    userList[token]['ws'] = ws;
    userList[token]['name'] = "No :"+("000000"+userNum).substr(-5);
    userList[token]['roomName'] = "";
    userList[token]['role'] = "n";
    userList[token]['selectedIcon'] = "iconLogin";
    userList[token]['support'] = '';
    userList[token]['supportCount'] = 0;
    userList[token]['ID'] = "ID :"+("000000"+userNum).substr(-5);
    userList[token]['timeOutHandle'] = -1;
    
    msg = {"action":"connect", "token": token, "ID": userList[token]['ID']};

    sendMsg(ws, JSON.stringify(msg));

    return token;
}



function funcMkRoom(ws, d) {
    let msgJson = "";    
    let roomName = htmlspecialchars(d['roomName']);
    if( roomName.length == 0 ) {
        msgJson = JSON.stringify({"action":"msg","msg":"部屋名がありません。"});
        sendMsg(ws, msgJson);
    }
    else if( roomList[roomName] ) {
        msgJson = JSON.stringify({"action":"msg","msg":"その部屋はすでに存在します。"});
        sendMsg(ws, msgJson);
    }
    else {
        if( conf['passwd'] ) {
            if( d['passwd'] ) {
                if( conf['passwd'] !== d['passwd'] ) {
                    let msgJson = JSON.stringify({"action":"msg",
                                                  "msg":"パスワードが違います。"});
                    sendMsg(ws, msgJson);
                    return;
                }
            }
            else {
                let msgJson = JSON.stringify({"action":"msg",
                                              "msg":"パスワードが違います。"});
                sendMsg(ws, msgJson);
                return;
            }
        }
        roomList[roomName] = {};
        roomList[roomName]["teacher"] = d['token'];
        roomList[roomName]["taPass"] = d['TApasswd'];
        roomList[roomName]['TA'] = {};
        roomList[roomName]['TA'][d['token']] = "hoge";
        roomList[roomName]['students'] = {};
        roomList[roomName]['iconState'] = {};
        roomList[roomName]['iconMember'] = {};
        roomList[roomName]['iconMember']['iconLogin'] = {};
        roomList[roomName]['taAck'] = 0;
        roomList[roomName]['stuAck'] = 0;

        let msgJson = JSON.stringify({"action":"mkRoom",
                                      "roomName":roomName,
                                      "name":userList[d['token']]['name'],
                                      "token":d['token'],
                                      "ID":userList[d['token']]['ID'],
                                      "ack": roomList[roomName]['taAck']});
        sendMsg(ws, msgJson);
        
        userList[ d['token'] ]['roomName'] = roomName;
        userList[ d['token'] ]['role'] = 't';
        userList[ d['token'] ]['selectedIcon'] = 'iconTA';
        
    }
}


function funcDelRoom(ws, d) {
    
    let roomName = userList[ d['token'] ]['roomName'];
    let msgJson = JSON.stringify({"action":"delRoom","roomName":roomName});

    if( !roomList[roomName] )
        return;
    
    for( let userId in userList ) {
        if( userList[userId]['roomName'] == roomName) {
            userList[userId]['roomName'] = "";
            userList[userId]['role'] = "n";
            sendMsg(userList[userId]['ws'], msgJson);
        }
    }
    
    delete roomList[roomName];
}


function funcIconUpdate(ws, d) {

    let roomName = userList[ d['token'] ]['roomName'];
    if( !roomList[roomName] )
        return;
    let stuList = roomList[roomName]['students'];

    roomList[roomName]['iconState'][d['target']] = d['action'];

    if( roomList[roomName]['iconMember'][d['target']] === undefined )
        roomList[roomName]['iconMember'][d['target']] = {};

    if( d['action'] == "iconDeny" ) {
        let msg = {"action":"selectIconFS",
                   "target":"iconLogin",
                   "token":"hoge"};

        for( let stuTok in roomList[roomName]['iconMember'][d['target']] ) {
            msg['token'] = stuTok;
            funcSelectIconFS(userList[stuTok]['ws'], msg );
        }
    }

    
    let msgJson = JSON.stringify({"action":"iconUpdate","iconState":roomList[roomName]['iconState']});
    for( let id in stuList ) {
        sendMsg(userList[id]['ws'], msgJson);
    }
    sendMsg(ws, msgJson);

    roomList[roomName]['taAck']++;
    msgJson = JSON.stringify({"action":"iconUpdate",
                              "iconState":roomList[roomName]['iconState'],
                              "ackUpdate": roomList[roomName]['taAck']});
    for( stid in roomList[roomName]['TA'] ) 
        sendMsg(userList[stid]['ws'], msgJson);
}

function funcIconReset( ws, d ) {
    let roomName = userList[ d['token'] ]['roomName'];
    if( !roomList[roomName] )
        return;
    let stuList = roomList[roomName]['students'];

    let msg = {"action":"selectIconFS",
               "target":"iconLogin",
               "token":"hoge"};

    for( let id in stuList ) {
        msg['token'] = id;
        funcSelectIconFS(userList[id]['ws'], msg );
    }
}


function sendLatestData(tokenTA) {
    let roomName = userList[tokenTA]['roomName'];
    let stuList = roomList[roomName]['students'];
    let stuNameList = [];

    
    for( let icon in roomList[roomName]['iconMember'] ) {
        for( let token in roomList[roomName]['iconMember'][icon] ) {
            let supToken = userList[token]['support'];
            let supID = "";
            if( supToken != "" )
                supID = userList[supToken]['ID'];
            stuNameList.push({"ID": userList[token]['ID'],
                              "name": userList[token]['name'],
                              "target": userList[token]['selectedIcon'],
                              "support": supID});
        }
    }

    
    for( let token in roomList[roomName]['TA'] ) {
        let supToken = userList[token]['support'];
        let supID = "";
        if( supToken != "" )
            supID = userList[supToken]['ID'];
        stuNameList.push({"ID": userList[token]['ID'],
                          "name": userList[token]['name'],
                          "target": userList[token]['selectedIcon'],
                          "support": supID});
    }
    ws = userList[tokenTA]['ws'];
    
    msgJson = JSON.stringify({"action":"latestData",
                              "studentList":stuNameList,
                              "iconState":roomList[roomName]['iconState'],
                              "ack":roomList[roomName]['taAck']});
    sendMsg(ws, msgJson);

}


function funcGetLatestData(ws, d) {
    let token = d['token'];
    sendLatestData(token);
}


function funcSetWS(ws, d) {
    let token = d['token'];
    
    userList[token]['ws'] = ws;

    let delToken = d['delToken'];
    let roomName = userList[token]['roomName'];
    let role = userList[token]['role'];
    if( role == 's' )
        role = 'students';
    else if( role == 't' )
        return;


    if( userList[token]['role'] == 's' ) {

        let msgJson = JSON.stringify({"action":"iconUpdate","iconState":roomList[roomName]['iconState']});
        sendMsg(ws, msgJson);
        
        let msg = {"token":token,
                   "target":userList[token]['selectedIcon']};
        funcSelectIconFS( ws, msg, true );
    }
    else if ( userList[token]['role'] == 'TA' ) {
        sendLatestData(token);
    }
    
    
    delete userList[delToken];

    if( userList[token]['timeOutHandle'] != -1 ) {
        clearTimeout( userList[token]['timeOutHandle'] );
        userList[token]['timeOutHandle'] = -1;
    }

}


function funcPinPon(ws, d) {
    let msg = {"action":"pon",
               "date":getTime()};
    sendMsg(ws, JSON.stringify(msg));
}



function getLocalAddress() {
    let ifacesObj = {}
    ifacesObj.ipv4 = [];
    ifacesObj.ipv6 = [];
    ipList = [];
    let interfaces = os.networkInterfaces();

    for (let dev in interfaces) {
        interfaces[dev].forEach(function(details){
            if (!details.internal){
                switch(details.family){
                case "IPv4":
                    ifacesObj.ipv4.push({name:dev, address:details.address});
                    ipList.push("::ffff:"+details.address);
                    break;
                case "IPv6":
                    ifacesObj.ipv6.push({name:dev, address:details.address})
                    ipList.push(details.address);
                    break;
                }
            }
        });
    }

    return ipList;
};


let os = require('os');
myIP = getLocalAddress();


let listenPort = parseInt(conf['port']);
if( isNaN(listenPort) ) {
    console.log('listen port error. prease check letter.conf file.');
}
else {
    console.log(conf['mode'] + ' listen start with '+ listenPort + ' port');
    server.listen(listenPort);
}


function sendMsg(ws, msg) {
    if( ws != "" )
        ws.send(msg);
}
