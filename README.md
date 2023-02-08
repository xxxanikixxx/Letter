<p align="center">
<img width="491" alt="title" src="https://user-images.githubusercontent.com/112359121/217134900-75624982-6108-41f5-9211-1dc4ff828e6c.png">
</p>

# 何が出来る？

ウェブページで授業などの支援をすることが出来ます。もう少しだけ具体的に書くと
- 授業毎に独立した部屋を作ることが出来る。
- 教員が学生の状態を把握するのに利用できる。
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

エディターで`letter.conf`を開きます。letter.confの中身は次のようになっています。
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
１文字が`#`の行はコメント行です。`key = value`で設定しますが、`=`の前後にはスペースを入れてください。
- **mode** httpsかhttpを設定します。必ず必要です。
- **log** 出力するログのレベルです0~2を設定出来て、0:ログを出力しない、1:接続記録のみ出力、2:詳細を出力、となります。
- **passwd** 部屋を作る時に必要なパスワード。passwdの設定は削除することが可能。passwd設定が無い場合は部屋を作るのにパスワードは必要ない。
- **port** ウェブソケットで通信するポート49152~65535を設定すればいいと思う。
