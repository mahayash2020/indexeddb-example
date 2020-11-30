const customerData = [
  { ssn: "111-11-1111", name: "Bill", age: "29", email: "bill@com" },
  { ssn: "222-22-2222", name: "Alice", age: "32", email: "alice@com" },
  { ssn: "333-33-3333", name: "Dom", age: "35", email: "dom@com" },
  { ssn: "555-55-5555", name: "Donna", age: "32", email: "donna@home.org" },
];

var count = 0;

// DB名とバージョン
var dbName = "sampleDB";
var dbVersion = "1";
// オブジェクトストアの名前
var storeName = "customer";

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

    // トランザクション開始とオブジェクトストア取得は繋げて1行で行うことも可
    //var customerObjectStore = db.transaction([storeName],"readwrite").objectStore(storeName);

    // 新たに作成したオブジェクトストアにデータを追加
    for (var i in customerData) {
      customerObjectStore.add(customerData[i]);
    }
  };
};

//onupgradeneededの後に実行。DBのバージョン更新がない場合はこれだけ実行
openReq.onsuccess = function (event) {
  var db = event.target.result;

  // 全件検索ボタン押下時処理
  document.getElementById("allSearch").addEventListener("click", function () {
    // テーブルクリア
    $("#table_body").empty();
    // 全件取得して画面に反映
    getAll(renderAll);
  });

  // 検索ボタン押下時処理
  document.getElementById("search").addEventListener("click", function () {
    // テーブルクリア
    $("#table_body").empty();
    // 条件指定で取得して画面に反映
    paramSearch(renderAll);
  });

  // 登録ボタン押下時処理
  document.getElementById("insert").addEventListener("click", function () {
    var ssn = document.getElementById("ssn").value;
    var name = document.getElementById("name").value;
    var age = document.getElementById("age").value;
    var email = document.getElementById("email").value;
    // レコード登録
    updateRecord(ssn, name, age, email);
    // テーブルクリア
    $("#table_body").empty();
    // 全件取得して画面に反映
    getAll(renderAll);
  });

  // 削除ボタン押下時処理
  document.getElementById("delete").addEventListener("click", function () {
    var ssn = document.getElementById("ssn").value;
    // レコード削除
    deleteRecord(ssn);
    // テーブルクリア
    $("#table_body").empty();
    // 全件取得して画面に反映
    getAll(renderAll);
  });

  // 条件取得
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

  // 表示処理
  renderAll = function (data) {
    if (data.ssn != "") {
      var table_row = document.createElement("tr");
      table_row.innerHTML =
        "<td>" +
        data.ssn +
        "</td><td>" +
        data.name +
        "</td><td>" +
        data.age +
        "</td><td>" +
        data.email +
        "</td>";
      //table_bodyというIDのテーブルに行を追加。
      document.getElementById("table_body").appendChild(table_row);
    }
  };

  // レコード登録（更新）
  updateRecord = function (_ssn, _name, _age, _email) {
    var trans = db.transaction(storeName, "readwrite");
    var store = trans.objectStore(storeName);
    // メモ：putが更新or挿入 , addは挿入のみ
    return store.put({
      ssn: _ssn,
      age: _age,
      name: _name,
      email: _email,
    });
  };
  // レコード削除
  deleteRecord = function (_ssn) {
    var trans = db.transaction(storeName, "readwrite");
    var store = trans.objectStore(storeName);
    return store.delete(_ssn);
  };
};
