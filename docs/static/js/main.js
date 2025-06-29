fetch("data/creators.json")
  .then(response => response.json())
  .then(creators => {
    const tbody = document.getElementById("creators-tbody");
    tbody.innerHTML = ""; // 初期メッセージ消去

    creators.forEach(c => {
      const tr = document.createElement("tr");
      tr.className = "creator-card";  // フィルタリング用クラス名そのまま使用
      tr.setAttribute("data-group", c.group);

      tr.innerHTML = `
        <td class="name-cell"><div class="fixed-name-cell"><a href="creators/${c.creator_page}">${c.name}</a></div></td>
        <td>${c.average_comments_per_hour}</td>
        <td>${c.max_comments_per_hour}</td>
        <td>${c.max_comments_per_10s}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(error => {
    const tbody = document.getElementById("creators-tbody");
    tbody.innerHTML = `<tr><td colspan="5">読み込みエラー</td></tr>`;
    console.error("creators.json の読み込みに失敗:", error);
  });

document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.group-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const selectedGroup = button.getAttribute('data-group');
      filterCreatorsByGroup(selectedGroup);
    });
  });

  filterCreatorsByGroup('all');
});

function filterCreatorsByGroup(group) {
  const rows = document.querySelectorAll('.creator-card');

  rows.forEach(row => {
    const cardGroup = row.getAttribute('data-group');
    if (group === 'all' || cardGroup === group) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

let currentSortIndex = null;
let currentSortDirection = "desc";

function sortTable(n) {
  const table = document.getElementById("creators-table");
  const tbody = table.querySelector("tbody");
  const rowsArray = Array.from(tbody.querySelectorAll("tr"));

  // ヘッダーのソート状態リセット
  const headers = table.querySelectorAll("th");
  headers.forEach((th, i) => {
    th.classList.remove("sort-asc", "sort-desc");
    if (i === n) {
      // ソート方向をトグル
      if (currentSortIndex === n && currentSortDirection === "asc") {
        currentSortDirection = "desc";
        th.classList.add("sort-desc");
      } else {
        currentSortDirection = "asc";
        th.classList.add("sort-asc");
      }
      currentSortIndex = n;
    }
  });

  rowsArray.sort((a, b) => {
    const x = a.cells[n].textContent.trim();
    const y = b.cells[n].textContent.trim();

    const xVal = isNaN(x) ? x.toLowerCase() : parseFloat(x);
    const yVal = isNaN(y) ? y.toLowerCase() : parseFloat(y);

    if (xVal < yVal) return currentSortDirection === "asc" ? -1 : 1;
    if (xVal > yVal) return currentSortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // 並び替えた行を再挿入
  tbody.innerHTML = "";
  rowsArray.forEach(row => tbody.appendChild(row));
}
