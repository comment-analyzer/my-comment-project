document.addEventListener('DOMContentLoaded', () => {
  // --- DOM要素の取得 ---
  const playerOverlay = document.getElementById('player-overlay');
  const playerContainer = document.getElementById('player-container');
  const youtubePlayerIframeContainer = document.getElementById('youtube-player-iframe');
  const closePlayerBtn = document.getElementById('close-player');

  let youtubePlayer; // YouTubeプレイヤーのインスタンスを保持

  // --- YouTube IFrame Player APIの読み込み ---
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // APIが準備完了したときに呼ばれるグローバル関数
  window.onYouTubeIframeAPIReady = function() {
    // この時点ではまだプレイヤーは作成しない
  };

  // --- プレイヤーの表示/非表示ロジック ---

  /**
   * 埋め込みプレイヤーを表示し、指定された動画を再生する
   * @param {string} videoId - YouTube動画ID
   * @param {number} startTime - 再生開始時間（秒）
   */
  function showPlayer(videoId, startTime) {
    hideConfirmModal(); // 既存の確認モーダルは非表示に

    playerOverlay.style.display = 'flex';
    document.body.classList.add('no-scroll');

    // 少し遅れて表示クラスを追加し、CSSトランジションを発動
    setTimeout(() => {
      playerOverlay.classList.add('show');
    }, 10);

    // プレイヤーが既に存在するかチェック
    if (youtubePlayer && typeof youtubePlayer.loadVideoById === 'function') {
      // 存在する場合：新しい動画を読み込んで再生
      youtubePlayer.loadVideoById({
        videoId: videoId,
        startSeconds: startTime
      });
    } else {
      // 存在しない場合：新しいプレイヤーを作成
      youtubePlayer = new YT.Player(youtubePlayerIframeContainer, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1, // iOSでのインライン再生
          'autoplay': 1,    // 自動再生
          'start': startTime, // 開始時間
          'rel': 0,         // 関連動画を非表示
          'modestbranding': 1 // YouTubeロゴを控えめに
        },
        events: {
          'onReady': (event) => event.target.playVideo()
        }
      });
    }
  }

  /**
   * 埋め込みプレイヤーを非表示にする
   */
  function hidePlayer() {
    playerOverlay.classList.remove('show');
    document.body.classList.remove('no-scroll');

    // トランジションが終わってからdisplay:noneを設定
    setTimeout(() => {
      playerOverlay.style.display = 'none';
      // 動画の再生を停止し、プレイヤーを破棄してリソースを解放
      if (youtubePlayer && typeof youtubePlayer.destroy === 'function') {
        youtubePlayer.destroy();
        youtubePlayer = null;
        // コンテナを再作成して次のプレイヤーに備える
        const newIframeContainer = document.createElement('div');
        newIframeContainer.id = 'youtube-player-iframe';
        playerContainer.appendChild(newIframeContainer);
        youtubePlayerIframeContainer.remove();
        youtubePlayerIframeContainer = newIframeContainer;
      }
    }, 400); // CSSのtransition時間と合わせる
  }

  // --- イベントリスナーの設定 ---

  // 閉じるボタン
  closePlayerBtn.addEventListener('click', hidePlayer);

  // オーバーレイ（背景）クリック
  playerOverlay.addEventListener('click', (e) => {
    // クリックされたのがオーバーレイ自体の場合のみ閉じる
    if (e.target === playerOverlay) {
      hidePlayer();
    }
  });

  // Escapeキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && playerOverlay.classList.contains('show')) {
      hidePlayer();
    }
  });

  // --- 既存の処理をオーバーライド ---

  // 元のhandleDoubleActionを新しいプレイヤー表示機能に置き換える
  // 元のスクリプトでグローバルスコープに定義されていることを想定
  if (typeof handleDoubleAction === 'function') {
    const originalHandleDoubleAction = handleDoubleAction;

    window.handleDoubleAction = function() {
      if (isDragging || isScrolling || isInertiaActive) {
        return;
      }
      
      const tooltipTime = getActiveTooltipTime();
      if (tooltipTime !== null) {
        // 元のモーダルは表示せず、直接プレイヤーを表示
        showPlayer(VIDEO_ID, Math.floor(tooltipTime));
      }
    }
  }
  
  // 確認モーダルの「Yes」ボタンの挙動も変更
  const confirmYesBtn = document.getElementById('confirmYes');
  if(confirmYesBtn) {
      confirmYesBtn.addEventListener('click', (e) => {
        // 本来の動作（別タブで開く）をキャンセル
        e.stopImmediatePropagation();

        if (pendingUrl) {
            const url = new URL(pendingUrl);
            const time = url.searchParams.get('t').replace('s', '');
            showPlayer(VIDEO_ID, parseInt(time, 10));
        }
      }, true); // キャプチャフェーズでイベントを奪う
  }
});
