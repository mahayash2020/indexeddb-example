/**
 * ServiceWorkerに関する処理を記載
 */

// キャッシュファイルの指定
var CACHE_NAME = "pwa-sample-caches";
var urlsToCache = ["/mahayash2020.github.io/"];

/**
 * インストール処理
 */
self.addEventListener("install", function (event) {
  console.log("ServiceWorker install");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// [メモ] 単純にネットワークにフォールバックさせたい時は"fetch"のfunction内でreturnするだけで良い。event.respondWith(fetch(event.request))は不要。
// [メモ] respondWithを実行しない場合、リクエストはブラウザによって処理される（つまりServiceWorkerが関与していないかのように処理される）

/**
 * リソースフェッチ時のキャッシュロード処理
 */
self.addEventListener("fetch", function (event) {
  // [メモ] 今回はAPIを用意していないので「https://httpbin.org/get」で代用している。
  // 検索・登録・同期で同じURLをfetchするため、登録はregistをURLに付与、同期はsyncをURLに付与して分岐判定している

  // 登録リクエストの場合
  if (event.request.url.indexOf("regist") != -1) {
    console.log("fetch if regist");
    /* レスポンス編集
     * 1.ネットワークリクエスト成功時、取得したレスポンスを返す
     * 2.ネットワークリクエスト失敗時、レスポンスを作成して返す（statusTextに"putDB"を設定）
     */
    event.respondWith(
      // １．ネットワークリクエスト実行
      fetch(event.request)
        // ２．ネットワークリクエストが成功した場合
        .then((response) => {
          console.log("regist 2:[return] Network Response");
          return response;
        })
        // ３．ネットワークリクエストが失敗した場合
        .catch(function (error) {
          // statusTextに"putDB"を設定して受取側でDBに登録データを退避する
          console.log("regist 3:[return] create new Response");
          var init = { status: 200, statusText: "putDB" };
          var myResponse = new Response(null, init);
          return myResponse;
        })
    );

    // 同期リクエストの場合
  } else if (event.request.url.indexOf("sync") != -1) {
    console.log("fetch if sync");
    /* レスポンス編集
     * 1.ネットワークリクエスト成功時、取得したレスポンスを返す
     * 2.ネットワークリクエスト失敗時、レスポンスを作成して返す（statusTextに"error"を設定）
     */
    event.respondWith(
      // １．ネットワークリクエスト実行
      fetch(event.request)
        // ２．ネットワークリクエストが成功した場合
        .then((response) => {
          console.log("sync 2:[return] Network Response");
          return response;
        })
        // ３．ネットワークリクエストが失敗した場合
        .catch(function (error) {
          // statusTextに"error"を設定し、受取側でエラーメッセージを表示。
          console.log("sync 3:[return] create new Response");
          var init = { status: 200, statusText: "error" };
          var myResponse = new Response(null, init);
          return myResponse;
        })
    );

    // 検索リクエストの場合
  } else if (event.request.url.indexOf("https://httpbin.org/get") != -1) {
    console.log("fetch if search");
    /* レスポンス編集
     * 1.ネットワークリクエスト成功時、取得したレスポンスを返す
     * ネットワークリクエスト失敗時
     *   2.リクエストがキャッシュに存在する場合、キャッシュから取得したレスポンスを返す
     *   3.リクエストがキャッシュに存在しない場合、レスポンスを作成して返す（statusTextに"getDB"を設定）
     */
    event.respondWith(
      // １．ネットワークリクエスト実行
      fetch(event.request)
        // ２．ネットワークリクエストが成功した場合
        .then((response) => {
          console.log("search 2:[return] Network Response , and cache.put");
          // キャッシュに追加(既に保存しているリクエストの場合は上書き)してレスポンスを返す
          return caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        // ３．ネットワークリクエストが失敗した場合
        .catch(function (error) {
          // キャッシュにデータがあるかチェック
          return caches.match(event.request).then(function (response) {
            // データあり
            if (response) {
              console.log("search 3-1:caches.match , [return] Cache Response");
              // キャッシュからレスポンスを返す
              return response;
            } else {
              // データなし
              console.log(
                "search 3-2:not caches.match, [return] create new Response"
              );
              // statusTextに"getDB"を設定して受取側でDBからデータを取得して表示する
              var init = { status: 200, statusText: "getDB" };
              var myResponse = new Response(null, init);
              return myResponse;
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
        console.log("fetch else");
        return response ? response : fetch(event.request);
      })
    );
  }
});
