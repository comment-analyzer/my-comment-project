// ファイル名から ID を取得（例: kuzuha.html → kuzuha）
const CREATOR_PAGE = window.location.pathname.split("/").pop();
const CREATOR_ID = CREATOR_PAGE.replace(".html", "");

Promise.all([
  fetch("../data/creators.json").then(res => res.json()),
  fetch("../data/videos.json").then(res => res.json())
]).then(([creators, videos]) => {
  const creator = creators.find(c => c.creator_page === CREATOR_PAGE);
  if (!creator) {
    document.getElementById("creator-name").textContent = "配信者が見つかりません";
    return;
  }

  // 基本情報表示
  document.getElementById("creator-name").textContent = creator.name;
  document.getElementById("creator-meta").innerHTML = `
    <strong>グループ:</strong> ${creator.group}<br>
    <strong>平均コメント数/h:</strong> ${creator.average_comments_per_hour}<br>
    <strong>最大コメント数/h:</strong> ${creator.max_comments_per_hour}<br>
    <strong>最大コメント数/10s:</strong> ${creator.max_comments_per_10s}<br>
    <strong>分析済み配信数:</strong> ${creator.video_count}<br>
    <strong>最終更新:</strong> ${creator.last_updated}
  `;

  // 動画リスト表示
  const listDiv = document.getElementById("video-list");
  listDiv.innerHTML = "";

  const table = document.createElement("table");
  table.id = "video-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th class="title-cell" onclick="sortTable(0)">タイトル</th>
        <th onclick="sortTable(1)">投稿日</th>
        <th onclick="sortTable(2)">時間</th>
        <th onclick="sortTable(3)">コメント数</th>
        <th onclick="sortTable(4)">平均/分</th>
        <th onclick="sortTable(5)">最大/10秒</th>
        <th>切り抜き</th>
        <th>グラフ</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  videos
    .filter(v => v.creator_page === CREATOR_PAGE)
    .forEach(video => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="title-cell"><div class="title-scroll"><a href="${video.original_url}" target="_blank">${video.title}</a></div></td>
        <td>${video.date || "不明"}</td>
        <td>${video.duration || "不明"}</td>
        <td>${video.total_comments ?? "不明"}</td>
        <td>${video.avg_comments_per_min ?? "不明"}</td>
        <td>${video.max_comments_per_10s ?? "不明"}</td>
        <td>${video.cut_link ? `<a href="${video.cut_link}" target="_blank">切り抜き</a>` : ""}</td>
        <td>${video.chart_url ? `<button onclick="openModal('../clips/chart_pages/${video.video_id}.html')">グラフ</button>` : ""}</td>
      `;
      tbody.appendChild(tr);
    });

   const tableWrapper = document.createElement("div");
   tableWrapper.className = "video-table-wrapper"; // ← スクロール用ラッパー
   tableWrapper.appendChild(table);
   listDiv.appendChild(tableWrapper);


}).catch(error => {
  console.error("読み込みエラー:", error);
  document.getElementById("video-list").textContent = "読み込み失敗";
});

function sortTable(columnIndex) {
  const table = document.getElementById("video-table");
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const isNumeric = columnIndex >= 2 && columnIndex <= 5;

  // ソート状態の取得・切り替え
  const currentSort = table.getAttribute("data-sort-col");
  const currentDir = table.getAttribute("data-sort-dir") || "asc";
  const newDir = (parseInt(currentSort) === columnIndex && currentDir === "asc") ? "desc" : "asc";

  // 並び替え
  rows.sort((a, b) => {
    let valA = a.cells[columnIndex].innerText.trim();
    let valB = b.cells[columnIndex].innerText.trim();

    if (isNumeric) {
      valA = parseFloat(valA.replace(/,/g, "")) || 0;
      valB = parseFloat(valB.replace(/,/g, "")) || 0;
    } else {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return newDir === "asc" ? -1 : 1;
    if (valA > valB) return newDir === "asc" ? 1 : -1;
    return 0;
  });

  // 並び替えた行を反映
  rows.forEach(row => tbody.appendChild(row));

  // ソート状態を属性に記録
  table.setAttribute("data-sort-col", columnIndex);
  table.setAttribute("data-sort-dir", newDir);

  // ヘッダーのクラス更新（矢印表示）
  const headers = table.querySelectorAll("thead th");
  headers.forEach((th, idx) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (idx === columnIndex) {
      th.classList.add(newDir === "asc" ? "sort-asc" : "sort-desc");
    }
  });
}


