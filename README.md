# PWA(ServiceWorker)×IndexedDBでのオフライン対応サンプル  
**概要：**  
オフライン時にキャッシュ、IndexedDBを使って検索・登録をする。  
検索はキャッシュとIndexedDBで対応。登録はオフライン時はブラウザDBにデータを溜めこんで同期ボタンで送信するイメージ。  

**確認用URL：  
https://mahayash2020.github.io/indexeddb-example/**  

**機能説明：**  
**■オフライン対応版（ネットワーク/キャッシュ/ブラウザDB の操作）**  
※条件入力必須（全て）  
**１．検索ボタン**  
　１－１．オンラインの場合  
　　①ネットワークからレスポンスを取得して表示する※レスポンスは条件がそのままレスポンスとして返るイメージ  
　　②キャッシュにリクエストとレスポンスを登録する  
　１－２．オフラインかつキャッシュありの場合  
　　①キャッシュからレスポンスを取得して表示する  
　１－３．オフラインかつキャッシュなしの場合  
　　①条件の値を元にブラウザDBから完全一致で検索して表示する  

**２．登録ボタン**  
※条件入力必須（全て）  
　２－１．オンラインの場合  
　　①ネットワークからレスポンスを取得して表示する※レスポンスは条件がそのままレスポンスとして返るイメージ  
　２－２．オフラインの場合  
　　①ブラウザDB（登録退避用）にデータを登録する  
　　②ブラウザDB（登録退避用）の全データを検索して表示する  

**３．全件検索(登録退避データ)ボタン**  
※条件入力不要  
①ブラウザDB（登録退避用）の全データを検索して表示する  

**４．同期(登録退避データの登録) ボタン**  
※条件入力不要  
　４－１．オンラインの場合  
　　①ネットワークからレスポンスを取得する。（結果欄に表示は無し）  
　　②登録退避データ件数をメッセージに表示する  
　　③登録退避データを全て削除する  
　４－２．オフラインの場合  
　　①エラーメッセージを表示する  
  
-----------------------
**■ブラウザDB操作**  
**１．検索ボタン**  
※条件入力必須（全て）  
①条件の値を元にブラウザDBから完全一致で検索して表示する  

**２．全件検索(条件無視)ボタン**  
※条件入力不要  
①ブラウザDBの全データを検索して表示する  

**３．登録ボタン**  
※条件入力必須（全て）  
①条件の値を元にブラウザDBに登録する（key:ssn , value:条件をjsonデータに変換したもの）  

**４．削除ボタン**  
※条件入力必須（ssnのみでOK）  
①条件(ssn)の値を元にブラウザDBからデータを削除する
