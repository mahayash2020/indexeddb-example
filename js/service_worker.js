// キャッシュファイルの指定
var CACHE_NAME = "pwa-sample-caches";
var urlsToCache = ["/mahayash2020.github.io/"];

// インストール処理
self.addEventListener("install", function (event) {
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
  // urlがhttps://httpbin.orgで始まるリクエストの場合
  if (event.request.url.startWith("https://httpbin.org")) {
    /* レスポンス編集
     * 以下の優先度でデータを返す。
     * 1.ネットワークリクエストデータ
     * 2.キャッシュデータ
     * 3.ブラウザDBから検索したデータ
     */
    event.respondWith(
      // １．ネットワークリクエスト実行
      fetch(event.request)
        // ２．ネットワークリクエストが成功した場合
        .then(function (response) {
          // キャッシュに(リクエスト/レスポンス)を追加
          cache
            .put(event.request.url, response)
            .then(() =>
              $("#span2").text(
                `キャッシュに追加しました。${event.request.url} , ${response}`
              )
            );
          return response;
        })
        // ３．ネットワークリクエストが失敗した場合
        .catch(function (error) {
          // キャッシュにデータがあるかチェック
          caches.match(event.request).then(function (response) {
            // データあり
            if (response) {
              // キャッシュのデータを返す
              return response;
            } else {
              // データなし

              // ブラウザDBからデータを検索してレスポンスを作成
              // [TODO] myBlobは返したいデータに修正する
              var myBlob = new Blob();
              var init = { status: 200, statusText: "SuperSmashingGreat!" };
              return new Response(myBlob, init);
            }
          });
        })
    );
  } else {
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
