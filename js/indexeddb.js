// IndexedDB初期データ
const customerData = [
  { ssn: "111-11-1111", name: "Bill", age: "29", email: "bill@com" },
  { ssn: "222-22-2222", name: "Alice", age: "32", email: "alice@com" },
  { ssn: "333-33-3333", name: "Dom", age: "35", email: "dom@com" },
  { ssn: "555-55-5555", name: "Donna", age: "32", email: "donna@home.org" },
];

// DB名とバージョン
var dbName = "sampleDB";
var dbVersion = "1";
// オブジェクトストアの名前
var storeName = "customer";
var storeNameWk = "customerWk";

//　DB名を指定して接続
var openReq = indexedDB.open(dbName, dbVersion);

// エラー時
openReq.onerror = function (event) {
  // 接続に失敗
  console.log("db open error");
};

//DBのバージョン更新(DBの新規作成も含む)時のみ実行
openReq.onupgradeneeded = function (event) {
  var db = event.target.result;

  // オブジェクトストア作成(ssnは一意な値となるためキーパスに使う)
  const objectStore = db.createObjectStore(storeName, { keyPath: "ssn" });
  const objectStoreWk = db.createObjectStore(storeNameWk, { keyPath: "ssn" });
  // インデックス作成
  // objectStore.createIndex("name", "name", { unique: false });
  // objectStore.createIndex("age", "age", { unique: false });
  // objectStore.createIndex("email", "email", { unique: false });
  objectStore.createIndex("idx", ["ssn", "name", "age", "email"], {
    unique: true,
  });
  console.log("db upgrade");
  objectStore.transaction.oncomplete = function (event) {
    // トランザクション開始(第一引数にトランザクションで扱うオブジェクトストアを配列で渡す)
    var tr = db.transaction([storeName], "readwrite");
    // オブジェクトストア取得
    var customerObjectStore = tr.objectStore(storeName);
    // オブジェクトストアにデータを追加
    for (var i in customerData) {
      customerObjectStore.add(customerData[i]);
    }
  };
};

//onupgradeneededの後に実行。DBのバージョン更新がない場合はこれだけ実行
openReq.onsuccess = function (event) {
  var db = event.target.result;

  // [ブラウザDBのみを操作] 検索ボタン押下時処理
  document.getElementById("search").addEventListener("click", function () {
    // メッセージエリアと検索結果をクリア
    clearMessageAndResult();
    // ブラウザDBから条件検索して表示
    paramSearch(renderAll);
  });

  // [ブラウザDBのみを操作] 全件検索ボタン押下時処理
  document.getElementById("allSearch").addEventListener("click", function () {
    // メッセージエリアと検索結果をクリア
    clearMessageAndResult();
    // ブラウザDBから全件取得して画面に表示
    getAll(renderAll);
  });

  // [ブラウザDBのみを操作] 登録ボタン押下時処理
  document.getElementById("insert").addEventListener("click", function () {
    // メッセージエリアと検索結果をクリア
    clearMessageAndResult();
    // 条件を取得
    var ssn = document.getElementById("ssn").value;
    var name = document.getElementById("name").value;
    var age = document.getElementById("age").value;
    var email = document.getElementById("email").value;
    // レコード登録
    updateRecord(ssn, name, age, email);
    // ブラウザDBから全件取得して画面に表示
    getAll(renderAll);
  });

  // [ブラウザDBのみを操作] 削除ボタン押下時処理
  document.getElementById("delete").addEventListener("click", function () {
    // メッセージエリアと検索結果をクリア
    clearMessageAndResult();
    // 条件[ssn]を取得
    var ssn = document.getElementById("ssn").value;
    // レコード削除
    deleteRecord(ssn);
    // ブラウザDBから全件取得して画面に表示
    getAll(renderAll);
  });

  /**
   * [オフライン対応版] 同期処理
   * ※https://httpbin~を登録処理APIに見立てている。
   * 概要：とりあえず最後の1件を登録して、完了したら登録退避データを全部消す。
   */
  syncWkRecord = function () {
    var transaction = db.transaction([storeNameWk], "readonly");
    var objectStore = transaction.objectStore(storeNameWk);
    const saves = [];

    //
    const onfinished = () => {
      if (saves.length > 0) {
        var ssn = saves[0].ssn;
        var name = saves[0].name;
        var age = saves[0].age;
        var email = saves[0].email;
        const url = `https://httpbin.org/get?ssn=${ssn}&name=${name}&age=${age}&email=${email}&sync=sync`;
        fetch(url).then((response) => {
          $("#span1").text("response.status =" + response.status);
          // リクエスト成功 かつエラーではない
          if (response.status == "200" && response.statusText != "error") {
            $("#span2").text(
              "登録退避データの登録が完了しました。" + saves.length + "件"
            );
            // ブラウザDBの登録退避データを全件削除
            deleteWkRecordAll();
            return response.json();
          } else {
            // 何かしらのエラー
            $("#span2").text("登録出来ませんでした。再度実行してください。");
          }
        });
      } else {
        // 登録退避データ無し
        $("#span2").text("登録退避データはありません。同期は不要です。");
      }
    };

    var request = objectStore.openCursor();
    request.onsuccess = function (event) {
      var c = this.result;
      var cursor = event.target.result;
      if (cursor) {
        saves.push(cursor.value);
        cursor.continue();
      } else {
        onfinished();
      }
    };
  };

  /**
   * 条件検索処理
   */
  paramSearch = function (render) {
    if (render) document.getElementById("table_body").innerHTML = "";
    var transaction = db.transaction([storeName], "readonly");
    var objectStoreIdx2 = transaction.objectStore(storeName).index("idx");

    var ssn = document.getElementById("ssn").value;
    var name = document.getElementById("name").value;
    var age = document.getElementById("age").value;
    var email = document.getElementById("email").value;
    var lower = [ssn, name, age, email];
    var upper = [ssn, name, age, email];
    var range = IDBKeyRange.bound(lower, upper);

    var request = objectStoreIdx2.openCursor(range);
    request.onsuccess = function (event) {
      var c = this.result;
      var cursor = event.target.result;
      if (cursor) {
        if (render) render(cursor.value);
        cursor.continue();
      }
    };
  };

  // 全件取得処理
  getAll = function (render) {
    if (render) document.getElementById("table_body").innerHTML = "";
    var transaction = db.transaction([storeName], "readonly");
    var objectStore = transaction.objectStore(storeName);
    var request = objectStore.openCursor();
    request.onsuccess = function (event) {
      var c = this.result;
      var cursor = event.target.result;
      if (cursor) {
        if (render) render(cursor.value);
        cursor.continue();
      }
    };
  };

  // 描画処理（jsonデータを元にtbodyにtdを追加する）
  renderAll = function (data) {
    if (data.ssn != "") {
      var table_row = document.createElement("tr");

      if (data.regist == undefined) {
        data.regist = "-";
      }

      table_row.innerHTML =
        "<td>" +
        data.ssn +
        "</td><td>" +
        data.name +
        "</td><td>" +
        data.age +
        "</td><td>" +
        data.email +
        "</td><td>" +
        data.regist +
        "</td>";
      //table_bodyというIDのテーブルに行を追加。
      document.getElementById("table_body").appendChild(table_row);
    }
  };

  // レコード更新(登録)
  updateRecord = function (_ssn, _name, _age, _email) {
    var trans = db.transaction(storeName, "readwrite");
    var store = trans.objectStore(storeName);
    // メモ：putが更新or挿入 , addは挿入のみ
    return store.put({
      ssn: _ssn,
      name: _name,
      age: _age,
      email: _email,
    });
  };

  // レコード削除
  deleteRecord = function (_ssn) {
    var trans = db.transaction(storeName, "readwrite");
    var store = trans.objectStore(storeName);
    return store.delete(_ssn);
  };

  // 登録退避用レコード更新(登録)
  updateWkRecord = function (_ssn, _name, _age, _email, _regist) {
    var trans = db.transaction(storeNameWk, "readwrite");
    var store = trans.objectStore(storeNameWk);
    // メモ：putが更新or挿入 , addは挿入のみ
    return store.put({
      ssn: _ssn,
      name: _name,
      age: _age,
      email: _email,
      regist: _regist,
    });
  };

  // 登録退避用レコード全削除
  deleteWkRecordAll = function () {
    var trans = db.transaction(storeNameWk, "readwrite");
    var store = trans.objectStore(storeNameWk);
    return store.clear();
  };

  // メッセージエリア+結果表示エリアのクリア
  clearMessageAndResult = function () {
    $("#span1").text("");
    $("#span2").text("");
    $("#table_body").empty();
  };
};
