document.addEventListener('DOMContentLoaded', () => {
  // --- DOM要素の取得 ---
  const playerOverlay = document.getElementById('player-overlay');
  const closePlayerBtn = document.getElementById('close-player');

  let youtubePlayer; // YouTubeプレイヤーのインスタンスを保持
  let isApiReady = false;
  let playerQueue = null; // API準備完了前にリクエストされた動画情報を保持

  // --- YouTube IFrame Player APIの非同期読み込み ---
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // APIの準備が完了したときにグローバルに呼び出される
  window.onYouTubeIframeAPIReady = function() {
    isApiReady = true;
    // もし待機中のリクエストがあれば、それを再生
    if (playerQueue) {
      showPlayer(playerQueue.videoId, playerQueue.startTime);
      playerQueue = null;
    }
  };

  // --- プレイヤーの表示/非表示ロジック ---

  /**
   * 埋め込みプレイヤーを表示し、動画を再生する
   * @param {string} videoId - YouTube動画ID
   * @param {number} startTime - 再生開始時間（秒）
   */
  function showPlayer(videoId, startTime) {
    // APIがまだ準備できていなければ、リクエストをキューに入れて待機
    if (!isApiReady) {
      playerQueue = { videoId, startTime };
      return;
    }

    hideConfirmModal(); // 既存の確認モーダルは非表示に

    playerOverlay.style.display = 'flex';
    document.body.classList.add('no-scroll');
    setTimeout(() => playerOverlay.classList.add('show'), 10);

    if (youtubePlayer && typeof youtubePlayer.loadVideoById === 'function') {
      // プレイヤーが既に存在する場合：新しい動画を読み込んで再生
      youtubePlayer.loadVideoById({
        videoId: videoId,
        startSeconds: startTime
      });
    } else {
      // プレイヤーが存在しない場合：新規作成
      youtubePlayer = new YT.Player('youtube-player-mount', { // 新しいマウントポイントのID
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'start': startTime,
          'rel': 0,
          'modestbranding': 1
        },
        events: {
          'onReady': (event) => event.target.playVideo()
        }
      });
    }
  }

  /**
   * 埋め込みプレイヤーを非表示にする（シンプル版）
   */
  function hidePlayer() {
    playerOverlay.classList.remove('show');
    document.body.classList.remove('no-scroll');

    // 動画の再生を停止
    if (youtubePlayer && typeof youtubePlayer.stopVideo === 'function') {
      youtubePlayer.stopVideo();
    }

    // アニメーションが終わってから非表示に
    setTimeout(() => {
      playerOverlay.style.display = 'none';
    }, 400); // CSSのtransition時間と合わせる
  }

  // --- イベントリスナーの設定 ---
  closePlayerBtn.addEventListener('click', hidePlayer);
  playerOverlay.addEventListener('click', (e) => {
    if (e.target === playerOverlay) {
      hidePlayer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playerOverlay.classList.contains('show')) {
      hidePlayer();
    }
  });

  // --- 既存の処理をオーバーライド ---
  // 元の挙動を新しいプレイヤー表示機能に置き換える
  if (typeof handleDoubleAction === 'function') {
    window.handleDoubleAction = function() {
      if (isDragging || isScrolling || isInertiaActive) return;
      const tooltipTime = getActiveTooltipTime();
      if (tooltipTime !== null) {
        showPlayer(VIDEO_ID, Math.floor(tooltipTime));
      }
    }
  }
  
  // 確認モーダルの「Yes」ボタンの挙動も乗っ取る
  const confirmYesBtn = document.getElementById('confirmYes');
  if(confirmYesBtn) {
      confirmYesBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation(); // 本来の動作をキャンセル
        if (pendingUrl) {
            const url = new URL(pendingUrl);
            const time = url.searchParams.get('t').replace('s', '');
            showPlayer(VIDEO_ID, parseInt(time, 10));
        }
      }, true); // キャプチャフェーズで横取り
  }
});