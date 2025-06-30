document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.carousel-nav.prev');
  const nextBtn = document.querySelector('.carousel-nav.next');
  const infoCreatorName = document.getElementById('info-creator-name');
  const infoCreatorGroup = document.getElementById('info-creator-group');
  const infoTotalVideos = document.getElementById('info-total-videos');
  const infoTotalComments = document.getElementById('info-total-comments');
  const infoLinks = document.querySelector('.info-links');
  const infoDetailLink = document.getElementById('info-detail-link');

  let allCreators = [];
  let filteredCreators = [];
  let currentIndex = 0;

  // データの読み込み
  async function fetchCreators() {
    try {
      const response = await fetch('../data/creators.json');
      allCreators = await response.json();
      filterCreators('all'); // 初期表示は全て
    } catch (error) {
      console.error('Error fetching creators data:', error);
      carousel.innerHTML = '<p>配信者データを読み込めませんでした。</p>';
    }
  }

  // 配信者のフィルタリング
  function filterCreators(group) {
    if (group === 'all') {
      filteredCreators = [...allCreators];
    } else {
      filteredCreators = allCreators.filter(creator => creator.group === group);
    }
    currentIndex = 0; // フィルタリングしたら先頭に戻る
    renderCarousel();
    updateCreatorInfo();
  }

  // カルーセルのレンダリング
  function renderCarousel() {
    carousel.innerHTML = '';
    if (filteredCreators.length === 0) {
      carousel.innerHTML = '<p>該当する配信者はいません。</p>';
      return;
    }

    filteredCreators.forEach((creator, index) => {
      const item = document.createElement('div');
      item.classList.add('carousel-item');
      item.dataset.index = index;
      item.innerHTML = `
        <img src="${creator.icon_url || 'https://via.placeholder.com/150'}" alt="${creator.name}">
        <h3>${creator.name}</h3>
      `;
      carousel.appendChild(item);
    });
    updateCarouselActiveState();
  }

  // カルーセルの中央アイテムのアクティブ状態を更新
  function updateCarouselActiveState() {
    const items = document.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
      if (index === currentIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    // 中央にスクロール
    const activeItem = items[currentIndex];
    if (activeItem) {
      carousel.scrollTo({
        left: activeItem.offsetLeft - (carousel.offsetWidth / 2) + (activeItem.offsetWidth / 2),
        behavior: 'smooth'
      });
    }
  }

  // 配信者情報の更新
  function updateCreatorInfo() {
    if (filteredCreators.length === 0) {
      infoCreatorName.textContent = '';
      infoCreatorGroup.textContent = '';
      infoTotalVideos.textContent = '';
      infoTotalComments.textContent = '';
      infoLinks.innerHTML = '';
      infoDetailLink.style.display = 'none';
      return;
    }

    const currentCreator = filteredCreators[currentIndex];
    infoCreatorName.textContent = currentCreator.name;
    infoCreatorGroup.textContent = `所属: ${currentCreator.group || '不明'}`;
    infoTotalVideos.textContent = `総動画数: ${currentCreator.total_videos || 'N/A'}`;
    infoTotalComments.textContent = `総コメント数: ${currentCreator.total_comments || 'N/A'}`;

    infoLinks.innerHTML = '';
    if (currentCreator.youtube_channel_url) {
      const youtubeLink = document.createElement('a');
      youtubeLink.href = currentCreator.youtube_channel_url;
      youtubeLink.target = '_blank';
      youtubeLink.textContent = 'YouTube';
      infoLinks.appendChild(youtubeLink);
    }
    if (currentCreator.twitter_url) {
      const twitterLink = document.createElement('a');
      twitterLink.href = currentCreator.twitter_url;
      twitterLink.target = '_blank';
      twitterLink.textContent = 'Twitter';
      infoLinks.appendChild(twitterLink);
    }
    // 他のSNSリンクも同様に追加

    if (currentCreator.creator_page) {
      infoDetailLink.href = `../creators/${currentCreator.creator_page}`;
      infoDetailLink.style.display = 'inline-block';
    } else {
      infoDetailLink.style.display = 'none';
    }
  }

  // イベントリスナーの設定
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterCreators(button.dataset.group);
    });
  });

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + filteredCreators.length) % filteredCreators.length;
    updateCarouselActiveState();
    updateCreatorInfo();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % filteredCreators.length;
    updateCarouselActiveState();
    updateCreatorInfo();
  });

  carousel.addEventListener('scroll', () => {
    // スクロールが停止したときに中央のアイテムを特定
    clearTimeout(carousel.scrollTimeout);
    carousel.scrollTimeout = setTimeout(() => {
      const scrollLeft = carousel.scrollLeft;
      const carouselWidth = carousel.offsetWidth;
      const items = document.querySelectorAll('.carousel-item');
      let closestIndex = 0;
      let minDistance = Infinity;

      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const carouselCenter = scrollLeft + carouselWidth / 2;
        const distance = Math.abs(itemCenter - carouselCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;
        updateCarouselActiveState();
        updateCreatorInfo();
      }
    }, 150); // スクロール停止後150msで判定
  });

  // 初期データの読み込み
  fetchCreators();
});