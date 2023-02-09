function htmlspecialchars(str){
    return (str + '').replace(/&/g,'&amp;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;'); 
}


var conn = null;
var roomName = "";
var roomPass = "";
var role = "";

var studentList = {};

var myToken = "";
var myID = "";
var userName = "";
var lastChatTime = "";

var supportCount = 0;

var iconNames = ["iconLogin", "iconOk", "iconNg", "iconHand",
                 "iconNo1", "iconNo2", "iconNo3",
                 "iconNo4", "iconNo5", "iconNo6",
                 "iconNo7", "iconNo8", "iconNo9",
                 "iconTA"];

var s_iconNames = ["s_iconOk", "s_iconNg", "s_iconHand",
                   "s_iconNo1", "s_iconNo2", "s_iconNo3",
                   "s_iconNo4", "s_iconNo5", "s_iconNo6",
                   "s_iconNo7", "s_iconNo8", "s_iconNo9"];

var selectedIcon = "s_iconLogin";

var s_iconElements = {};

let serverAck;

for(const icon of s_iconNames )
    s_iconElements[icon] = document.getElementById(icon);


for(const key in s_iconElements )
    addRaiseHandEvent(s_iconElements[key]);


var nameList = {};

for(const icon of iconNames )
    nameList[icon] = document.getElementById("nameList_"+icon);



function sendMsg(msg) {
    
    conn.send(msg);
}



function isWaitStu() {

    document.getElementById("handIconButton").classList.remove("pushButton");
    for( var ii=0 ; ii<nameList["iconHand"].children.length ; ++ii ) {
        var stu = nameList["iconHand"].children[ii];
        if( stu.children[1].innerText == "" ) {
            document.getElementById("handIconButton").classList.add("pushButton");
            break;
        }
    }

}


function nameListSet( icon, user ) {
    if( icon != "" )
        nameList[icon].appendChild(user);

    
    var moveStuName = user.children[0].innerText;
    var supportStuName = document.getElementById("supportedStu").innerText;
    
    if ( moveStuName == supportStuName ) {
        document.getElementById("supportedStu").innerText = "";

    }
    let taID = user.children[2].innerText;

    if( taID != "" ) {
        studentList[taID].children[1].classList.add("displayNone");
        studentList[taID].children[1].innerText = "";
        studentList[taID].children[2].innerText = "";
    }
    
    user.children[1].innerText = "";
    user.classList.remove("supportedColor");

    isWaitStu();
    
}


function studentRoomIn(d, tIcon = "iconLogin") {
    if( !d['ID'] )
        return;
    if( !d['name'] )
        return;

    var stID = d['ID'];
    var stName = d['name'];
    let userName = document.createElement("p");
    let user = document.createElement("div");
    var supportTA = document.createElement("p");
    var supportCount = document.createElement("p");
    var stuID = document.createElement("p");
    userName.classList.add("my_font");
    supportTA.classList.add("displayNone");
    supportTA.style.marginLeft = "20px";
    supportTA.style.marginTop = "-10px";
    supportCount.classList.add("displayNone");
    stuID.classList.add("displayNone");
    
    user.appendChild(userName);
    user.appendChild(supportTA);
    user.appendChild(supportCount);
    user.appendChild(stuID);
    studentList[stID] = user;
    user.children[0].innerText = stName;
    user.children[1].innerText = "";
    user.children[3].innerText = stID;
    nameListSet( tIcon, user );

}


function changeNameFSFunc(d) {
    var stuID = d['stuID'];
    var stuName  = d['name'];
    
    studentList[stuID].children[0].innerText = stuName;
    let taID = studentList[stuID].children[1].innerText;
    if( taID != ""  &&  studentList[taID] ) {
        studentList[taID].children[1].innerText = stuName;
    }
}


function mkRoomFunc(d) {
    if( d['roomName'] == htmlspecialchars(roomName) ){
        document.getElementById("inRoomRoomName").innerText = "room : "+roomName;
        document.getElementById("login").style.display = "none";
        document.getElementById("mainRoomTeacher").style.display = "flex";
        toggleClassAddEvent();

        let stH = document.getElementById("sideUp").clientHeight;
        document.getElementById("selectToggle").style.height = "calc(100vh - "+stH+"px - 68px)";

        studentRoomIn(d, "iconTA");

        document.getElementById("userNameTeacher").value = d['name'];

        window.onbeforeunload = function(e) {
            return "hoge";
        };
        
        serverAck = d['ack'];
    }
}

function delRoomFunc(d) {
    if( d['roomName'] == htmlspecialchars(roomName) ) {
        roomName = "";
        document.getElementById("login").style.display = "block";
        document.getElementById("mainRoomTeacher").style.display = "none";
        document.getElementById("mainRoom").style.display = "none";
        
        
        for( var stId in studentList ) {
            studentList[stId].remove();
            delete studentList[stId];
        }
    }

}

function iconUpdate(d) {
    var icons = d['iconState'];
    for( let icon in icons ) {
        var el = document.getElementById(icon);
        if( icons[icon] == "iconAllow" ) {
            el.style.filter = "brightness(100%)";
            el.state = "allow";

            document.getElementById("nameArea"+el.id.substr(4)).style.display = "block";
        }
        else {
            el.style.filter = "brightness(30%)";
            el.state = "deny";

            document.getElementById("nameArea"+el.id.substr(4)).style.display = "none";


            for( let ind in studentList ) {
                if( studentList[ind].parentElement.id == "nameList_"+icon )
                    nameListSet("iconLogin", studentList[ind]);
            }
        }
    }
    selectNumUpdate();



    for( let icon in icons ) {
        var el = document.getElementById("s_"+icon);
        if( icons[icon] == "iconAllow" ) {
            if( el.style.display == "none" ) {
                el.style.filter = "brightness(30%)";
                el.style.display = "block";
            }
        }
        else {
            el.style.filter = "brightness(30%)";
            el.style.display = "none";
        }
    }

}

function intoRoomToTAFunc(d) {
    studentRoomIn(d);

    selectNumUpdate();
}

function intoRoomToStuFunc(d) {

    document.getElementById("login").style.display = "none";
    document.getElementById("mainRoom").style.display = "block";

    document.getElementById("userName").value = d['name'];
    document.getElementById("mainRoomName").innerText = "room : "+roomName;
    

    let mrbH = document.getElementById("mainRoomStatusBox").clientHeight;
    let smbH = document.getElementById("sendMessageBox").clientHeight;
    document.getElementById("iconListBox").style.height = "calc(100vh - "+mrbH+"px - "+smbH+"px - 37px)";
    document.getElementById("iconListBox").style.display = "block";

    selectedIcon = "s_iconLogin";
    for(const key in s_iconElements )
        s_iconElements[key].style.filter = "brightness(30%)";

    for(const key in s_iconElements )
        s_iconElements[key].style.display = "none";

    document.getElementById("userName").focus();
}



function intoRoomTAFTFunc(d) {

    document.getElementById("login").style.display = "none";
    document.getElementById("mainRoomTeacher").style.display = "flex";

    document.getElementById("sideContents").style.display = "none";

    document.getElementById("userName").value = d['name'];
    document.getElementById("mainRoomName").innerText = "room : "+roomName;
    
    document.getElementById("mainRoom").style.display = "block";
    document.getElementById("mainRoom").style.height = 'auto';
    document.getElementById("iconListBox").style.display = "none";

    
    let mrH = document.getElementById("mainRoom").clientHeight;
    document.getElementById("mainRoomTeacher").style.height = "calc((100vh - "+mrH+"px) - 30px)";

    document.getElementById("mainContents").style.width = "calc(100% - 284px)";
    document.getElementById("mainContents").style.height = "calc(100% - 28px)";
    document.getElementById("chatContents").style.height = "calc(100% - 28px)";

    serverAck = d['ack'];
}

function intoRoomTAFTAFunc(d) {
    studentRoomIn(d, "iconTA");
}


function exitRoomFSFunc(d) {
    if( studentList[d['removeID']] ) {
        nameListSet( "", studentList[d['removeID']] );
        studentList[d['removeID']].remove();
        delete studentList[d['removeID']];
    }
    selectNumUpdate();
    isWaitStu();
}


function exitRoomFTFunc(d) {
    roomName = "";
    
    document.getElementById("login").style.display = "block";
    document.getElementById("mainRoom").style.display = "none";
    document.getElementById("mainRoomTeacher").style.display = "none";
    for( var stId in studentList ) {
        studentList[stId].remove();
        delete studentList[stId];
    }
    if( selectedIcon != "s_iconLogin" ) {
        s_iconElements[selectedIcon].style.filter = "brightness(30%)";
        selectedIcon = "s_iconLogin";
    }
}


function selectIconToStuFunc(d) {
    if( d['target'] != "iconLogin" ) {
        if( s_iconElements["s_"+d['target']].style.display == "none" ) {
            let msgJson = JSON.stringify( {"action":"selectIconFS",
                                           "target":"iconLogin",
                                           "token":myToken} );
            sendMsg(msgJson);
            return;
        }
    }
    
    if( selectedIcon == d['target'] ) {
        s_iconElements[selectedIcon].style.filter = "brightness(30%)";
        selectedIcon = "s_iconLogin";
    }
    else {
        if( selectedIcon != "s_iconLogin" )
            s_iconElements[selectedIcon].style.filter = "brightness(30%)";
        if( d['target'] != "iconLogin" )
            s_iconElements["s_"+d['target']].style.filter = "brightness(100%)";
        selectedIcon = "s_"+d['target'];
    }
}


function selectIconToTAFunc(d) {
    if( document.getElementById("nameArea"+d['target'].substr(4)).style.display == "none" )
        return;
    nameListSet( d['target'], studentList[d['ID']] );

    selectNumUpdate();
}


function chatFTFunc(d) {
    document.getElementById("sendMessageText").value = "";
}


function chatFSFunc(d) {
    var el = document.getElementById("chatContents");
    
    let msg = document.createElement("p");
    msg.innerText = (d['msg']);
    msg.classList.add("chatMsg")

    let now = new Date();
    let h = ("0" + (parseInt(now.getHours()) )).substr(-2);
    let m = ("0" + (parseInt(now.getMinutes()) )).substr(-2);

    let ct = h+":"+m;
    if( lastChatTime != ct ) {
        let msgTime = document.createElement("p");
        msgTime.innerText = ct;
        msgTime.classList.add("chatTime");
        el.appendChild(msgTime);
    }
    lastChatTime = ct;
    
    el.appendChild(msg);

    el.scrollTo(0, el.scrollHeight);

}



function supportFTFunc(d) {
    if( d['taID'] == myID ) 
        supportCount = parseInt(d['supportCount']);
    
    if( d['supportedStuID'] == "" )
        return;
    let stuName = studentList[d['supportedStuID']].children[0].innerText;
    
    if( d['taID'] == myID ) {
        document.getElementById("supportedStu").innerText = stuName;
        document.getElementById("supportedStuP").innerText = stuName;
        document.getElementById("supportStuGetDiv").style.display = "block";
    }
    studentList[d['supportedStuID']].classList.add("supportedColor");
    studentList[d['supportedStuID']].children[1].innerText = d['taID'];
    
    studentList[d['taID']].children[1].innerText = stuName;
    studentList[d['taID']].children[1].classList.add("supportedColor");
    studentList[d['taID']].children[1].classList.remove("displayNone");

    studentList[d['taID']].children[2].innerText = d['supportedStuID'];
    studentList[d['supportedStuID']].children[2].innerText = d['taID'];
    
    isWaitStu();
}

function supportStuGetButton() {
    document.getElementById("supportStuGetDiv").style.display = "none";
}


function studentListFunc(d) {
    studentList = {};
    for(const icon of iconNames )
        while(nameList[icon].firstChild) {
            nameList[icon].removeChild(nameList[icon].firstChild);
        }


    
    var stuList = d['studentList'];

    for( var ii=0 ; ii<stuList.length ; ++ii ) {
        studentRoomIn(stuList[ii]);
        if( stuList[ii]['target'] == "" )
            nameListSet( "iconLogin", studentList[stuList[ii]['ID']] );
        else
            nameListSet(stuList[ii]['target'], studentList[stuList[ii]['ID']] );


        if(stuList[ii]['target'] == "iconTA") {
        
            let msg = {"action":"supportFT",
                       "taID":stuList[ii]['ID'],
                       "supportedStuID":stuList[ii]['support'],
                       "supportCount":0};
            if( msg['taID'] == myID )
                msg['supportCount'] = supportCount;
            supportFTFunc(msg);
        
        }
    }
    isWaitStu();    
}


function latestDataFunc(d) {
    iconUpdate(d);
    studentListFunc(d);
    serverAck = d['ack'];
}



function pinponFunc(d) {
    console.log("pinpon : " + d['date']);
}


function getLatestData() {
    let msg = {"action":"getLatestData",
               "token":myToken};

    sendMsg( JSON.stringify(msg) );
}



function open(){

    let port = document.getElementById("listenPort").innerText.replace(/ /g,'').replace(/\n/g,'');
    let domain = document.getElementById("domain").innerText.replace(/ /g,'').replace(/\n/g,'');
    let mode = document.getElementById("mode").innerText.replace(/ /g,'').replace(/\n/g,'');
    let wsMode = "";
    if( mode == "https")
        wsMode = "wss";
    else
        wsMode = "ws";
    
    conn = new WebSocket( wsMode+'://'+domain+':'+port);
    
    conn.onopen = function(e) {
        console.log("on open!");
    };

    conn.onerror = function(e) {
        console.log("on error!");

    };

    conn.onmessage = function(e) {
        console.log("on message!");

        d = JSON.parse(e.data);
        if( d['action'] == "msg" )                  alert( d['msg'] );
        else if( d['action'] == "mkRoom" )          mkRoomFunc(d);
        else if( d['action'] == "delRoom" )         delRoomFunc(d);
        else if( d['action'] == "iconUpdate" )      iconUpdate(d);
        else if( d['action'] == "intoRoomToTA")     intoRoomToTAFunc(d);
        else if( d['action'] == "intoRoomToStu")    intoRoomToStuFunc(d);
        else if( d['action'] == "exitRoomFS" )      exitRoomFSFunc(d);
        else if( d['action'] == "exitRoomFT" )      exitRoomFTFunc(d);
        else if( d['action'] == 'connect' )         connect();
        else if( d['action'] == 'selectIconToTA' )  selectIconToTAFunc(d);
        else if( d['action'] == 'selectIconToStu' ) selectIconToStuFunc(d);
        else if( d['action'] == "chatFS" )          chatFSFunc(d);
        else if( d['action'] == "chatFT" )          chatFTFunc(d);
        else if( d['action'] == "changeNameFS" )    changeNameFSFunc(d);
        else if( d['action'] == "intoRoomTAFT" )    intoRoomTAFTFunc(d);
        else if( d['action'] == "intoRoomTAFTA" )   intoRoomTAFTAFunc(d);
        else if( d['action'] == "supportFT" )       supportFTFunc(d);
        else if( d['action'] == "studentList" )     studentListFunc(d);
        else if( d['action'] == "latestData" )      latestDataFunc(d);
        else if( d['action'] == "delToken" )        myToken = "";
        else if( d['action'] == "pon" )             pinponFunc(d);


        if( d['ackUpdate'] !== undefined ) {
            if( (serverAck + 1) != d['ackUpdate'] )
                getLatestData();
            else
                serverAck = d['ackUpdate'];
        }
    };

    conn.onclose = function() {
        console.log("on close!");

        setTimeout(open, 2000);
        
    };

}


function connect() {


    if(myToken != "" ) {
        let msgJson = JSON.stringify( {"action":"setWS",
                                       "token":myToken,
                                       "delToken":d['token']} );
        sendMsg(msgJson);
        
    }
    else {
        myToken = d['token'];
        myID = d['ID'];
    
        if( roomName != null && roomName != '' )
            document.getElementById("inputRoomName").value = roomName;
        
        if( role != null ) {
            if( role == 's' )
                intoRoomButton();
            if( role == 't' )
                mkRoomButton();
            if( role == 'TA' )
                intoRoomButtonTA();
        }
    }
}



function close(){
    conn.close();
}



function mkRoomButton() {


    var passDiv = document.getElementById("passwd");
    if( passDiv != null ) {
        document.getElementById("passwdDiv").style.display = "block";
        document.getElementById("passwdIn").focus();
    }
    else {
        document.getElementById("TApasswdSetDiv").style.display = "block";
        document.getElementById("TApasswdSetIn").focus();
    }
}


document.getElementById("passwdIn").addEventListener('keypress', function(e) {
    if(e.keyCode == 13) {
        passwdOkButton();
    }
});

function passwdOkButton() {
    document.getElementById("passwdDiv").style.display = "none";
    document.getElementById("TApasswdSetDiv").style.display = "block";
    document.getElementById("TApasswdSetIn").focus();
}

document.getElementById("TApasswdSetIn").addEventListener('keypress', function(e) {
    if(e.keyCode == 13) {
        TApasswdSetOkButton();
    }
});
function TApasswdSetOkButton() {

    document.getElementById("TApasswdSetDiv").style.display = "none";

    roomName = document.getElementById("inputRoomName").value;
    msg = {"action":"mkRoom",
           "token":myToken,
           "roomName":roomName,
           "passwd":document.getElementById("passwdIn").value,
           "TApasswd":document.getElementById('TApasswdSetIn').value};

    
    msgJson = JSON.stringify(msg);
    sendMsg(msgJson);
}


document.getElementById("TApasswdInIn").addEventListener('keypress', function(e) {
    if(e.keyCode == 13) {
        TApasswdInOkButton();
    }
});

function TApasswdInOkButton() {
    document.getElementById("TApasswdInDiv").style.display = "none";
    
    roomName = document.getElementById("inputRoomName").value;
    msg = {"action":"intoRoomTAFS",
           "token":myToken,
           "roomName":roomName,
           "TApasswd":document.getElementById('TApasswdInIn').value};

    msgJson = JSON.stringify(msg);
    sendMsg(msgJson);
}


function delRoomButton() {
    msgJson = JSON.stringify({"action":"delRoom", "token":myToken});
    sendMsg(msgJson);
}

function copyClipboard(targetRole) {
    let url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('role');
    var urlStr = url.toString();
    if( ! urlStr.match(/index.php$/) )
        urlStr = urlStr + "index.php";

    urlStr = urlStr + "?room="+roomName+"&role="+targetRole;


    document.getElementById("linkT").blur();
    document.getElementById("linkTA").blur();
    document.getElementById("linkS").blur();

    var targetStr = (targetRole=='s')? "学生用の":
        (targetRole=='t')? "教員用の" : "TA用の";


    let mode = document.getElementById("mode").innerText.replace(/ /g,'').replace(/\n/g,'');
    
    if( mode == "https") {
        navigator.clipboard.writeText(urlStr).then(() => {
            /* clipboard successfully set */
            alert("クリップボードに、"+targetStr+"リンクをコピーしました。");
        }, () => {
            /* clipboard write failed */
        });
    }
    else {
        let tmp = document.createElement('input');
        tmp.setAttribute('type', 'text');
        document.body.appendChild(tmp);
        tmp.value = urlStr;
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        alert("クリップボードに、"+targetStr+"リンクをコピーしました。");
    }
        
}


function supportFunc() {

    let msgJson = JSON.stringify( {"action":"supportFTA",
                                   "token":myToken,
                                   "supportCount":supportCount} );
    sendMsg(msgJson);
}




function intoRoomButton() {
    roomName = document.getElementById("inputRoomName").value;
    let msgJson = JSON.stringify( {"action":"intoRoomFS",
                                   "roomName":roomName,
                                   "token":myToken } );
    sendMsg(msgJson);

}


function intoRoomButtonTA() {
    document.getElementById("TApasswdInDiv").style.display = "block";
    document.getElementById("TApasswdInIn").focus();
}


function collectButton() {
    var dat = "";
    
    for( var stId in studentList ) {
        if( studentList[stId].parentNode.id == "nameList_iconTA" )
            continue;
        dat = dat + stId + "," +studentList[stId].parentNode.id.substr(13) + "\n";
    }
    
    console.log(dat);

    let now = new Date();
    let Y = now.getFullYear();
    let M = ("0" + (parseInt(now.getMonth()) + 1)).substr(-2);
    let D = ("0" + (parseInt(now.getDate()) )).substr(-2);
    let h = ("0" + (parseInt(now.getHours()) )).substr(-2);
    let m = ("0" + (parseInt(now.getMinutes()) )).substr(-2);
    let fileName = window.prompt("ファイル名", (roomName) + "_"+Y+"_"+M+D+"_"+h+m );


    document.getElementById("collectB").blur();

    if( fileName == null  ||  fileName == "" )
        return;


    
    let blob = new Blob([dat],{type:"text/plan"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName + '.csv';
    link.click();


}

document.getElementById("sendMessageText").addEventListener('keypress', function(e) {
    if(e.keyCode == 13) {
        sendChatButton();
    }
});

function sendChatButton() {
    if( document.getElementById("sendMessageText").value.length == 0 )
        return;
    
    let msgJson = JSON.stringify( {"action":"chatFS",
                                   "token":myToken,
                                   "msg":document.getElementById("sendMessageText").value
                                  } );
    sendMsg(msgJson);
}



function addToggleFunction(el) {
    el.addEventListener('click', function() {
        var msg = "";
        if( this.state == "deny" ) 
            msgJson = JSON.stringify({"action":"iconAllow", "token":myToken, "target":this.id});
        else
            msgJson = JSON.stringify({"action":"iconDeny", "token":myToken, "target":this.id});
        sendMsg(msgJson);

    });
}



function toggleClassAddEvent() {
    els = document.getElementsByClassName("toggle");
    
    for( var ii=0 ; ii<els.length ; ++ii ) {
        addToggleFunction(els[ii]);
        els[ii].state = "deny";
        els[ii].style.filter = "brightness(30%)";
    }
    
    for(const icon of iconNames )
        document.getElementById("nameArea"+icon.substr(4)).style.display = "none";
    document.getElementById("nameAreaLogin").style.display = "block";
    document.getElementById("nameAreaTA").style.display = "block";
    
}




function selectNumUpdate() {
    for(const icon of iconNames )
        document.getElementById("num_"+icon).innerText = document.getElementById("nameList_"+icon).childElementCount+"人";
}



function resetButton() {
    msgJson = JSON.stringify({"action":"iconReset",
                              "token":myToken});
    sendMsg(msgJson);

    for( let ind in studentList ) {
        if( studentList[ind].parentNode.id == "nameList_iconTA" )
            continue;

        nameListSet("iconLogin", studentList[ind] );
    }
    
    selectNumUpdate();

    document.getElementById("resetB").blur();
}





function exitRoomButton() {
    let msgJson = JSON.stringify( {"action":"exitRoomFS",
                                   "token":myToken } );
    sendMsg(msgJson);
}


function addRaiseHandEvent(el) {
    el.addEventListener('click', function() {
        let target = ( selectedIcon == this.id )? "iconLogin" : this.id.substr(2);
        
        let msgJson = JSON.stringify( {"action":"selectIconFS",
                                       "target":target,
                                       "token":myToken} );
        sendMsg(msgJson);
    });
}


function focusNameInput(opt="") {
    document.getElementById("userName"+opt).focus();
}


function nameInput(opt="") {
    var name = document.getElementById("userName"+opt).value;

        let msgJson = JSON.stringify( {"action":"nameChangeFS",
                                       "name":name,
                                       "token":myToken} );


    if( document.getElementById("mainRoomTeacher").style.display != ""   ||
        document.getElementById("mainRoom").style.display != ""   )
        if( conn )
            sendMsg(msgJson);
}






function init() {
    open();
    
    document.getElementById("nameAreaLogin").style.display = "block";
    document.getElementById("nameAreaTA").style.display = "block";

    selectNumUpdate();

    document.getElementById('inputRoomName').focus();

    // URLを取得
    let url = new URL(window.location.href);
    // URLSearchParamsオブジェクトを取得
    let params = url.searchParams;
    // getメソッド
    role = params.get('role');
    roomName = params.get('room');
}


init();

function pinFunc() {
    let msg = {"action":"pin"};
    let msgJson = JSON.stringify(msg);
    sendMsg(msgJson);
}



window.onunload = function() {
    if( myToken != "" )
        exitRoomButton();
}
