// キャッシュファイルの指定
var CACHE_NAME = "pwa-sample-caches";
var urlsToCache = ["/mahayash2020.github.io/"];

// インストール処理
self.addEventListener("install", function (event) {
  console.log("sw install");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

/*
想定パターン
既に検索したことのある検索条件の

フェッチパターンとしては、キャッシュのみ、キャッシュ＋ネットワーク等のパターンがあるが、
キャッシュ＋ネットワークを試す。
*/

// [メモ]ただリクエストをネットワークにフォールバックさせたい時は"fetch"のfunction内でただreturnすればいい。event.respondWith(fetch(event.request))は不要。
// [メモ] respondWithを実行しない場合、リクエストはブラウザによって処理される（つまりServiceWorkerが関与していないかのように処理される）

// リソースフェッチ時のキャッシュロード処理
self.addEventListener("fetch", function (event) {
  console.log("sw fetch");
  // 検索(オフライン対応)のリクエストの場合
  if (event.request.url.indexOf("https://httpbin.org") != -1) {
    /* レスポンス編集
     * 以下の優先度でデータを返す。
     * 1.ネットワークリクエストデータ
     * 2.キャッシュデータ
     * 3.ブラウザDBから検索したデータ
     */
    console.log("sw if in");
    event.respondWith(
      // １．ネットワークリクエスト実行
      fetch(event.request)
      
        // ２．ネットワークリクエストが成功した場合
      .then(response => {
        return response;
        })
        // ３．ネットワークリクエストが失敗した場合
        .catch(function (error) {
          console.log("sw fetch error");
          // キャッシュにデータがあるかチェック
          caches.match(event.request).then(function (response) {
            // データあり
            if (response) {
              console.log("sw キャッシュあり");
              // キャッシュのデータを返す
              return response;
            } else {
              console.log("sw キャッシュなし");
              // データなし

              // ブラウザDBからデータを検索してレスポンスを作成
              var init = { status: 200, statusText: "SuperSmashingGreat!" };
              return new Response(
                JSON.stringify({
                  args: { nssn: 9, name: 9, age: 9, email: 9 },
                }),
                init
              );
            }
          });
        })
    );
  } else {
    console.log("sw else in");
    // その他のリクエストの場合
    // ※このサンプルだと画面にアクセスした時のリクエストが該当する
    event.respondWith(
      // キャッシュにリクエストがあればキャッシュからレスポンスを返す。無い場合は、ネットワークからレスポンスを取得して返す。
      caches.match(event.request).then(function (response) {
        return response ? response : fetch(event.request);
      })
    );
  }
});
