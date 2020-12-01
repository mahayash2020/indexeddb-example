// オフライン対応検索ボタン押下時処理
document.getElementById("onoffSearch").addEventListener("click", function () {
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
          $("#span2").text('ブラウザDBから検索');
          // リクエストキャッシュなし
          // テーブルクリア
          $("#table_body").empty();
          // 入力条件を元にブラウザDBから検索（完全一致検索）
          paramSearch(renderAll);
          return;
        }
        $("#span2").text('NETWORK or キャッシュからレスポンス取得');

        // ネットワークリクエスト成功orリクエストキャッシュあり
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
      // テーブルクリア
      $("#table_body").empty();
      renderAll(data);
    });
});

// クリアボタン押下時処理
document.getElementById("clear").addEventListener("click", function () {
  // テーブルクリア
  $("#table_body").empty();
  // ログエリア初期化
  $("#span1").text("");
  $("#span2").text("");
  $("#span3").text("");
  $("#span4").text("");
  $("#span5").text("");
});
