<p align="center">
<img width="491" alt="title" src="https://user-images.githubusercontent.com/112359121/217134900-75624982-6108-41f5-9211-1dc4ff828e6c.png">
</p>

# 何が出来る？

ウェブページで授業などの支援をすることが出来ます。もう少しだけ具体的に書くと
- 授業毎に独立した部屋を作ることが出来る。
- 教員が学生の状態(理解できたor理解できない等)を把握するのに利用出来る。
- 学生から教員・TAに匿名コメントを送る事が出来る。
- 実験・演習等で、質問待ち行列を管理し、適宜TAに割り振る。
<p>
<img width="300" alt="teacher01" src="https://user-images.githubusercontent.com/112359121/217395104-d7d28c5b-2a12-44fc-a0ea-8c52d53cea8d.png">
<img width="300" alt="ta01" src="https://user-images.githubusercontent.com/112359121/217395177-941cd4c3-d46e-41ad-a7e0-b77a770d66ec.png">
<img width="300" alt="student01" src="https://user-images.githubusercontent.com/112359121/217395186-29f7eb90-576c-44e5-940c-938a85acb10f.png">
</p>

# 導入

webserverとnodejsがインストールされているPCを用意してください。

webserverのドキュメントルート等のウェブページを作りたい場所で
```
git clone https://github.com/xxxanikixxx/Letter.git
cd Letter
npm install ws fs https
```
http環境で動作させたい場合は`https`ではなく`http`をインストールします。

エディターで`letter.conf`を開いて動作の設定を行います。letter.confの中身は次のようになっています。
```
# comment test

mode = https
log = 1
passwd = hogehoge
port = 58285
domain = your.domein.com

ssl_crt = /fullpath/to/your.crt
ssl_key = /fullpath/to/your.key

```
１文字目が`#`の行はコメント行です。`key = value`で設定しますが、`=`の前後にはスペースを入れてください。
- **mode** 動作をhttpsかhttpで設定。
- **log** 出力するログのレベル。0~2を設定出来る。0:ログを出力しない　1:接続記録のみ出力　2:詳細を出力
- **passwd** 部屋を作る時に必要なパスワード。passwdの設定は削除することが可能で、その場合は無条件で部屋を作ることが出来る。
- **port** ウェブソケットで通信するポート。49152~65535を設定すればいいと思う。
- **domain** ウェブサーバのドメイン。IPアドレスでも可能。ドキュメントルート以下のパスは書かなくてよい。
- **ssl_crt** httpsで動かす場合に設定する。ssl証明書(crt)へのフルパスを書く。
- **ssl_key** httpsで動かす場合に設定する。ssl秘密鍵(key)へのフルパスを書く。
letter.confの設定は以上です。

letter.confで設定したポートを解放しましょう。やり方はOSによって異なるので、ここでは割愛します。
このままではletter.confがウェブブラウザからアクセス出来てしまうので、見えなくなるように設定しましょう。
（apacheの場合は設定済みの.htaccessをリポジトリに含めています。apacheの設定で.htaccessを有効にするだけで良いはずです。）

これで、準備が出来ました。ディレクトリを移動して起動します。
```
cd server
node letterServer.js
```
成功すると次のような出力がされます。
```
http listen start with 38285 port
```
ブラウザからアクセスできるかも確認してみましょう。Letter/index.phpにアクセスしてください。
ログに次のような出力があれば、うまく接続されています。
```
2023/02/07 20:54:29(JST)  connect from : （接続元IPアドレス）    token : SzYtRYGHmauxxNjO3tTWPtzDqdIC4xbYpZe0F2zSamU=
```

ログをファイルに残したい場合はリダイレクトをしてください。

必要に応じて、サービス化や、スクリプトで自動起動させて便利に使ってください。
