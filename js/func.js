/**
 * オフライン対応ボタンの処理を記載
 */

 /**
  * 検索ボタン押下時処理
  */
document.getElementById("onoffSearch").addEventListener("click", function () {
  // 結果表示エリアクリア
  $("#table_body").empty();
  var ssn = document.getElementById("ssn").value;
  var name = document.getElementById("name").value;
  var age = document.getElementById("age").value;
  var email = document.getElementById("email").value;
  const url = `https://httpbin.org/get?ssn=${ssn}&name=${name}&age=${age}&email=${email}`;
  fetch(url)
    .then((response) => {
      $("#span1").text("response.status =" + response.status);
      // リクエスト成功
      if (response.status == "200") {

        // ブラウザDBから取得する必要がある場合（オフラインかつキャッシュにデータが無い）
        if (response.statusText == "getDB") {
          $("#span2").text("検索完了。ブラウザDBから検索して表示します。（データが無い場合表示されません）");
          // 入力条件を元にブラウザDBから検索（完全一致検索）して終了
          paramSearch(renderAll);
          return;
        }

        // ネットワークリクエスト成功orリクエストキャッシュあり
        $("#span2").text("検索完了。NETWORK or キャッシュからレスポンス取得");
        console.log("index.html response.status is 200");
        return response.json();
      } else {
        // 今のところ未使用
        return;
      }
    })
    .then((jsonData) => {
      // ブラウザDBからデータ取得時にこっちにも処理が来てしまう暫定対処。
      if (jsonData == undefined) {
        return;
      }
      var data = {
        ssn: jsonData["args"]["ssn"],
        name: jsonData["args"]["name"],
        age: jsonData["args"]["age"],
        email: jsonData["args"]["email"],
      };
      renderAll(data);
    });
});

/**
 * 登録ボタン押下時処理
 */
document.getElementById("onoffRegist").addEventListener("click", function () {
  // 結果表示エリアクリア
  $("#table_body").empty();
  var ssn = document.getElementById("ssn").value;
  var name = document.getElementById("name").value;
  var age = document.getElementById("age").value;
  var email = document.getElementById("email").value;
  var regist = "登録ok";
  const url = `https://httpbin.org/get?ssn=${ssn}&name=${name}&age=${age}&email=${email}&regist=${regist}`;
  fetch(url)
    .then((response) => {
      $("#span1").text("response.status =" + response.status);
      // リクエスト成功
      if (response.status == "200") {

        // ブラウザDBに登録データを退避する必要がある場合
        if (response.statusText == "putDB") {
          $("#span2").text(
            "ブラウザDBにデータを退避しました。オンライン時に同期ボタンを押して下さい。"
          );
          // 登録データをブラウザDBに退避
          updateWkRecord(ssn, name, age, email, "退避中");
          // DBから登録退避データを全件取得して表示して終了
          getAll(renderAll, "customerWk");
          return;
        }

        // ネットワークリクエスト成功
        $("#span2").text("登録完了");
        console.log("index.html onoffRegist response.status is 200");
        return response.json();
      } else {
        // 今のところ未使用
        return;
      }
    })
    .then((jsonData) => {
      // ブラウザDBにデータ退避時にこっちにも処理が来てしまう暫定対処。
      if (jsonData == undefined) {
        return;
      }

      // 登録が完了したデータを表示する
      var data = {
        ssn: jsonData["args"]["ssn"],
        name: jsonData["args"]["name"],
        age: jsonData["args"]["age"],
        email: jsonData["args"]["email"],
        regist: jsonData["args"]["regist"],
      };
      // 結果表示エリアクリア
      $("#table_body").empty();
      renderAll(data);
    });
});

/**
 * 登録退避データ検索ボタン押下時処理
 */
document
  .getElementById("onoffRegistWkSearch")
  .addEventListener("click", function () {
    // 結果表示エリアクリア
    $("#table_body").empty();
    $("#span2").text("検索完了。ブラウザDBから登録退避データを取得しました。");
    // DBから登録退避データを全件取得して表示
    getAll(renderAll, "customerWk");
  });

/**
 * 同期ボタン押下時処理
 */
document.getElementById("onoffSync").addEventListener("click", function () {
  // 結果表示エリアクリア
  $("#table_body").empty();

  // 登録退避データを登録する
  syncWkRecord();
});


