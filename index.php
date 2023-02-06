<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <link href="index.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sawarabi+Mincho&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="image/favicon.png">
    <title>Letter</title>
  </head>
  <body>

    
    <div id="login">
      <div id="titleBox">
        <div class="my_title">
          Letter
        </div>
        <div class="my_title_sub">
          -<span class="letter">Let</span>'s get to know each other bet<span class="letter">ter</span>-
        </div>
      </div>
      <div id="selectAction">
        <input type="text" id="inputRoomName" class="my_font" placeholder="部屋名"></input>        
      </div>
      <div id="selectAction">
        <button class="my_font myButton" id="mkRoomButton" onclick="mkRoomButton()">部屋を作る</button>
        <button class="my_font myButton" id="intoRoomButton" onclick="intoRoomButton()">部屋に入る</button>
        <button class="my_font myButton" id="intoRoomButton" onclick="intoRoomButtonTA()">アシスタント</button>
        
      </div>
      
    </div>
    




    <div id="mainRoom">
      <div id="mainRoomStatusBox">
        <div id="mainRoomStatus">
          <div id="mainRoomStatus1">
            <div class="my_font mainRoomUser">
              <div>name : </div><input type="text" id="userName" oninput="nameInput()" class="my_font"></input>
              <img src="image/enpitu.png" onclick="focusNameInput()" class="enpituIcon">
            </div>
            <button class="my_font myButton" id="roomOutButton" onclick="exitRoomButton()">退出</button>
          </div>
          <div id="mainRoomStatus2">
            <div id="mainRoomName" class="my_font"></div>
            <div> </div>
          </div>
        </div>
      </div>
      <div id="sendMessageBox">
        <div id="sendMessage">
          <input type="text" id="sendMessageText" class="my_font"></input>
          <div id="sendMessageButtonBox">
            <button class="my_font myButton" id="sendMessageButton" onclick="sendChatButton()">匿名で教員に送信</button>
          </div>
        </div>
      </div>
      <div id="iconListBox">
        <div id="iconList">
          <img src="image/hand.png" class="icon" id="s_iconHand" >
          <img src="image/ok.png" class="icon" id="s_iconOk" >
          <img src="image/ng.png" class="icon" id="s_iconNg" >
          <img src="image/no1.png" class="icon" id="s_iconNo1" >
          <img src="image/no2.png" class="icon" id="s_iconNo2" >
          <img src="image/no3.png" class="icon" id="s_iconNo3" >
          <img src="image/no4.png" class="icon" id="s_iconNo4" >
          <img src="image/no5.png" class="icon" id="s_iconNo5" >
          <img src="image/no6.png" class="icon" id="s_iconNo6" >
          <img src="image/no7.png" class="icon" id="s_iconNo7" >
          <img src="image/no8.png" class="icon" id="s_iconNo8" >
          <img src="image/no9.png" class="icon" id="s_iconNo9" >
        </div>
      </div>
      
    </div>


    
    



    <div id="mainRoomTeacher">
      <div id="sideContents">
        <div id="sideUp">
          <button class="my_font myButton" onclick="delRoomButton()">解体する</button>
          <button class="my_font myButton" onclick="copyClipboard('t')" id="linkT">教員用リンク</button>
          <button class="my_font myButton" onclick="copyClipboard('TA')" id="linkTA">　TA用リンク</button>
          <button class="my_font myButton" onclick="copyClipboard('s')" id="linkS">学生用リンク</button>
          <div class="my_font mainRoomUser">
            <div>name : </div><input type="text" id="userNameTeacher" oninput="nameInput('Teacher')" class="my_font"></input>
            <img src="image/enpitu.png" onclick="focusNameInput('Teacher')" class="enpituIcon">
          </div>

          <p class='my_font' id="inRoomRoomName"></p>
          
        </div>
        <div></div>
        <div id="selectToggle">
          <button class="my_font myButton" onclick="resetButton()" id="resetB">Loginに戻す</button><br>
          <button class="my_font myButton" onclick="collectButton()" id="collectB">集計する</button><br>
          <img src="image/hand.png" class="toggle"  id="iconHand"></img><br>
          <img src="image/ok.png" class="toggle" id="iconOk"></img>
          <img src="image/ng.png" class="toggle"  id="iconNg"></img><br>
          <img src="image/no1.png" class="toggle"  id="iconNo1"></img>
          <img src="image/no2.png" class="toggle"  id="iconNo2"></img>
          <img src="image/no3.png" class="toggle"  id="iconNo3"></img>
          <img src="image/no4.png" class="toggle"  id="iconNo4"></img>
          <img src="image/no5.png" class="toggle"  id="iconNo5"></img>
          <img src="image/no6.png" class="toggle"  id="iconNo6"></img>
          <img src="image/no7.png" class="toggle"  id="iconNo7"></img>
          <img src="image/no8.png" class="toggle"  id="iconNo8"></img>
          <img src="image/no9.png" class="toggle"  id="iconNo9"></img>          
        </div>
      </div>
      <div id="mainContents">
        <div class="nameArea" id="nameAreaLogin">
          <img src="image/login.png" class="imgMini" ></img>
          <div class="nameList" id="nameList_iconLogin">
          </div>
          <div class="selectNum my_font" id="num_iconLogin">
          </div>
        </div>
        <div class="nameArea" id="nameAreaTA">
          <img src="image/ta.png" class="imgMini " ></img>
          <div class="nameList" id="nameList_iconTA">
          </div>
          <div class="selectNum my_font" id="num_iconTA">
          </div>
        </div>
        <div class="nameArea" id="nameAreaHand">
          <div  id="handIconButton">
            <img src="image/hand.png" class="imgMini" onclick="supportFunc()"></img>
          </div>
          <div class="nameList"id="nameList_iconHand"> </div>
          <div class="selectNum my_font" id="num_iconHand">
          </div>
          <!-- <button class="my_font myButton" onclick="supportFunc()" id="supportButton">質疑対応</button> -->
          <p id="supportedStu" class="displayNone"></p>
        </div>
        <div class="nameArea" id="nameAreaOk">
          <img src="image/ok.png" class="imgMini" ></img>
          <div class="nameList" id="nameList_iconOk" > </div>
          <div class="selectNum my_font" id="num_iconOk">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNg">
          <img src="image/ng.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNg"> </div>
          <div class="selectNum my_font" id="num_iconNg">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo1">
          <img src="image/no1.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo1"> </div>
          <div class="selectNum my_font" id="num_iconNo1">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo2">
          <img src="image/no2.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo2"> </div>
          <div class="selectNum my_font" id="num_iconNo2">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo3">
          <img src="image/no3.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo3"> </div>
          <div class="selectNum my_font" id="num_iconNo3">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo4">
          <img src="image/no4.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo4"> </div>
          <div class="selectNum my_font" id="num_iconNo4">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo5">
          <img src="image/no5.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo5"> </div>
          <div class="selectNum my_font" id="num_iconNo5">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo6">
          <img src="image/no6.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo6"> </div>
          <div class="selectNum my_font" id="num_iconNo6">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo7">
          <img src="image/no7.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo7"> </div>
          <div class="selectNum my_font" id="num_iconNo7">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo8">
          <img src="image/no8.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo8"> </div>
          <div class="selectNum my_font" id="num_iconNo8">
          </div>
        </div>
        <div class="nameArea" id="nameAreaNo9">
          <img src="image/no9.png" class="imgMini"></img>
          <div class="nameList" id="nameList_iconNo9"> </div>
          <div class="selectNum my_font" id="num_iconNo9">
          </div>
        </div>
      </div>
      <div id="chatContents">

      </div>
    </div>





    
    <?php
       $lines = file('./letter.conf', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES );

       foreach( $lines as $line ) {
       $line = str_replace(' ', '', $line);
       if( $line[0]!= '#' ) {
       $item = explode('=',$line);
       if( $item[0] === 'port')
       echo( '<div style="display:none;" id="listenPort">'.$item[1].'</div>' );
       if( $item[0] === 'passwd')
       echo( '<div style="display:none;" id="passwd"> 1 </div>' );
       if( $item[0] === 'domain')
       echo( '<div style="display:none;" id="domain">'.$item[1].'</div>' );
       if( $item[0] === 'mode')
       echo( '<div style="display:none;" id="mode">'.$item[1].'</div>' );
       
       }
       }
       
       ?>


    <div id="passwdDiv" class="my_font">
      <div id="passwdPanel">
        <p>部屋を作るためのパスワード<p>
          <input type="password" id="passwdIn"></input>
          <input type="button" class="myButton" id="passwdOK" onclick="passwdOkButton()" value="OK"></input>
      </div>
    </div>

    <div id="TApasswdSetDiv" class="my_font">
      <div id="TApasswdSetPanel">
        <p>アシスタント用パスワードを設定。<p>
        <p>アシスタントが不必要ならば、何も入力せずにOKを押してください。<p>
          <input type="text"  id="TApasswdSetIn"></input>
          <input type="button" class="myButton" id="TApasswdSetOK" onclick="TApasswdSetOkButton()" value="OK"></input>
      </div>
    </div>

    <div id="TApasswdInDiv" class="my_font">
      <div id="TApasswdInPanel">
        <p>入室するためのパスワード<p>
          <input type="text"  id="TApasswdInIn"></input>
          <input type="button" class="myButton" id="TApasswdInOK" onclick="TApasswdInOkButton()" value="OK"></input>
      </div>
    </div>


    <div id="supportStuGetDiv" class="my_font">
      <div id="supportStuGetPanel">
        <p>この子を見てあげて！<p>
        <p id="supportedStuP"></p>
        <input type="button" class="myButton" onclick="supportStuGetButton()" value="OK"></input>
      </div>
    </div>
    
    
    
    <script type="text/javascript" src="index.js"></script>        
  </body>
</html>
