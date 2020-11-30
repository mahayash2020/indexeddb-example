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
      $("#span2").empty();

      // [TODO] 実際には200以外はエラー扱いなので、何かパラメータみたいなのを代わりにResponseに埋め込めないか余裕あれば調査する。

      if (response.status == "200") {
        // ネットワークリクエスト成功orリクエストキャッシュあり
        console.log("index.html response.status is 200");
        return response.json();
      }
      if (response.status == "201") {
        // リクエストキャッシュなし
        // テーブルクリア
        $("#table_body").empty();
        // 入力条件を元にブラウザDBから検索（完全一致検索）
        paramSearch(renderAll);
        $("#span3").text(`3:${response.status}`);
        return;
      } else {
        // 今のところなし
        $("#span4").text(`4:${response.status}`);
        return;
      }
    })
    .then((jsonData) => {
      // ステータス201のとき、こっちにも処理が来てしまう暫定対処。本来は来ない様にするべき
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
      $("#span5").text("jsonData処理");
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
