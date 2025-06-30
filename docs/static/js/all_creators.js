console.log('all_creators.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.carousel-nav.prev');
  const nextBtn = document.querySelector('.carousel-nav.next');
  const infoCreatorName = document.getElementById('info-creator-name');
  const infoCreatorGroup = document.getElementById('info-creator-group');
  const infoAvgCommentsPerHour = document.getElementById('info-avg-comments-per-hour');
  const infoMaxCommentsPerHour = document.getElementById('info-max-comments-per-hour');
  const infoMaxCommentsPer10s = document.getElementById('info-max-comments-per-10s');
  const infoLinks = document.querySelector('.info-links');

  let allCreators = [];
  let filteredCreators = [];
  let currentIndex = 0;

  // データの読み込み
  async function fetchCreators() {
    console.log('fetchCreators started');
    try {
      const response = await fetch('../data/creators.json');
      allCreators = await response.json();
      console.log('fetchCreators successful, allCreators:', allCreators);
      filterCreators('all'); // 初期表示は全て
    } catch (error) {
      console.error('Error fetching creators data:', error);
    }
  }

  // 配信者のフィルタリング
  function filterCreators(group) {
    console.log('filterCreators called with group:', group);
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
    console.log('renderCarousel started');
    carousel.innerHTML = '';
    if (filteredCreators.length === 0) {
      carousel.innerHTML = '<p>該当する配信者はいません。</p>';
      return;
    }

    filteredCreators.forEach((creator, index) => {
      console.log(`Creator: ${creator.name}, creator_page: ${creator.creator_page}`); // DEBUG LOG
      const item = document.createElement('div');
      item.classList.add('carousel-item');
      item.dataset.index = index;
      
      // Always create the <a> tag, even if creator.creator_page is empty
      const detailLink = creator.creator_page ? `../creators/${creator.creator_page}` : '#';

      item.innerHTML = `
        <a href="${detailLink}">
          <img src="${creator.icon_url || 'https://via.placeholder.com/150'}" alt="${creator.name}">
          <h3>${creator.name}</h3>
        </a>
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
    console.log('updateCreatorInfo started');
    if (filteredCreators.length === 0) {
      infoCreatorName.textContent = '';
      infoCreatorGroup.textContent = '';
      infoAvgCommentsPerHour.textContent = '';
      infoMaxCommentsPerHour.textContent = '';
      infoMaxCommentsPer10s.textContent = '';
      infoLinks.innerHTML = '';
      return;
    }

    const currentCreator = filteredCreators[currentIndex];
    infoCreatorName.textContent = currentCreator.name;
    infoCreatorGroup.textContent = `所属: ${currentCreator.group || '不明'}`;
    infoAvgCommentsPerHour.textContent = `平均コメント数/1h: ${currentCreator.average_comments_per_hour || 'N/A'}`;
    infoMaxCommentsPerHour.textContent = `最大コメント数/1h: ${currentCreator.max_comments_per_hour || 'N/A'}`;
    infoMaxCommentsPer10s.textContent = `最大コメント数/10s: ${currentCreator.max_comments_per_10s || 'N/A'}`;

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
    }, 50); // スクロール停止後50msで判定
  });

  // 初期データの読み込み
  fetchCreators();
});
