const form = document.querySelector("[data-admin-form]");
const exportButton = document.querySelector("[data-export]");
const resetButton = document.querySelector("[data-reset]");
const exportBox = document.querySelector("[data-export-box]");
const reviewAdminList = document.querySelector("[data-review-admin-list]");
const addReviewButton = document.querySelector("[data-add-review]");

let savedContent = {};
let reviews = [];
let isLoading = false;

function isLongField(key, value) {
  return key.includes("lead") || key.includes("summary") || key.includes("body") || key.includes("description") || value.length > 55;
}

function renderAdminForm() {
  const labels = window.CONTENT_LABELS || {};
  const entries = Object.entries(window.SITE_CONTENT).filter(([key]) => labels[key]);

  form.innerHTML = entries.map(([key, defaultValue]) => {
    const label = labels[key] || key;
    const value = savedContent[key] ?? defaultValue;
    const field = isLongField(key, String(value))
      ? `<textarea name="${key}" rows="4">${String(value).replace(/</g, "&lt;")}</textarea>`
      : `<input name="${key}" value="${String(value).replace(/"/g, "&quot;")}">`;

    return `<label><span>${label}<small>${key}</small></span>${field}</label>`;
  }).join("");
}

function collectFormData() {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = String(value);
  });
  return data;
}

function collectReviews() {
  return Array.from(document.querySelectorAll("[data-review-item]")).map((item) => ({
    title: item.querySelector("[name='reviewTitle']").value.trim(),
    body: item.querySelector("[name='reviewBody']").value.trim(),
    name: item.querySelector("[name='reviewName']").value.trim(),
    meta: item.querySelector("[name='reviewMeta']").value.trim(),
    image: item.querySelector("[name='reviewImage']").value.trim()
  })).filter((review) => review.title || review.body || review.name);
}

async function saveContentToSupabase() {
  if (isLoading) return;
  isLoading = true;

  try {
    const data = collectFormData();

    if (window.supabaseClient && window.supabaseReady) {
      console.log("💾 Supabase 저장 시작...", Object.keys(data).length, "개 항목");
      let successCount = 0;
      let errorCount = 0;

      for (const [key, value] of Object.entries(data)) {
        try {
          const { error } = await window.supabaseClient
            .from('site_content')
            .upsert({ key, value });
          if (error) {
            console.error(`❌ ${key}:`, error.message);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`❌ ${key}:`, err.message);
          errorCount++;
        }
      }

      console.log(`✅ Supabase 저장 완료: 성공 ${successCount}, 실패 ${errorCount}`);
    } else {
      console.log("💾 Supabase 미연결, localStorage에 저장...", Object.keys(data).length, "개 항목");
      localStorage.setItem("choSiteContent", JSON.stringify(data));
      console.log("✅ localStorage에 저장 완료");
    }

    savedContent = data;
  } catch (err) {
    console.error("❌ 저장 실패:", err.message);
  } finally {
    isLoading = false;
  }
}

async function saveReviewsToLocalStorage() {
  reviews = collectReviews();

  if (window.supabaseClient && window.supabaseReady) {
    console.log("💾 Supabase에 후기 저장 중...");
    try {
      // 기존 후기 모두 삭제
      await window.supabaseClient.from('site_reviews').delete().gt('id', 0);

      // 새 후기 저장
      if (reviews.length > 0) {
        const { error } = await window.supabaseClient
          .from('site_reviews')
          .insert(reviews);

        if (error) {
          console.error("❌ 후기 저장 실패:", error.message);
          throw error;
        }
      }
      console.log(`✅ Supabase에 ${reviews.length}개 후기 저장됨`);
    } catch (err) {
      console.warn("⚠️ Supabase 저장 실패, localStorage 사용:", err.message);
      localStorage.setItem("choSiteReviews", JSON.stringify(reviews));
    }
  } else {
    console.log("💾 Supabase 미연결, localStorage에 저장...");
    localStorage.setItem("choSiteReviews", JSON.stringify(reviews));
  }

  console.log("✅ 후기 저장 완료");
}

function renderReviewAdmin() {
  reviewAdminList.innerHTML = reviews.map((review, index) => `
    <article class="review-admin-item" data-review-item>
      <div class="review-admin-title">
        <strong>후기 ${index + 1}</strong>
        <button type="button" data-remove-review="${index}">삭제</button>
      </div>
      <label>후기 제목<input name="reviewTitle" value="${escapeHtml(review.title)}"></label>
      <label>후기 본문<textarea name="reviewBody" rows="4">${escapeHtml(review.body)}</textarea></label>
      <label>작성자<input name="reviewName" value="${escapeHtml(review.name)}"></label>
      <label>계약 정보<input name="reviewMeta" value="${escapeHtml(review.meta)}"></label>
      <label>프로필 이미지 URL<input name="reviewImage" value="${escapeHtml(review.image)}"></label>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

form?.addEventListener("input", saveContentToSupabase);

reviewAdminList?.addEventListener("input", saveReviewsToLocalStorage);

reviewAdminList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-review]");
  if (!button) return;
  reviews = collectReviews();
  reviews.splice(Number(button.dataset.removeReview), 1);
  saveReviewsToLocalStorage();
  renderReviewAdmin();
});

addReviewButton?.addEventListener("click", () => {
  reviews = collectReviews();
  reviews.push({
    title: "\"새 계약 후기 제목\"",
    body: "계약 후기 내용을 입력해주세요.",
    name: "고객명",
    meta: "지역 및 계약 유형",
    image: ""
  });
  saveReviewsToLocalStorage();
  renderReviewAdmin();
});

exportButton?.addEventListener("click", async () => {
  const data = {
    content: collectFormData(),
    reviews: collectReviews()
  };
  const jsonStr = JSON.stringify(data, null, 2);
  exportBox.value = jsonStr;

  try {
    await navigator.clipboard.writeText(jsonStr);
    alert("✅ JSON이 클립보드에 복사되었습니다!");
  } catch (err) {
    alert("텍스트 영역에서 직접 복사하세요.");
  }
});

resetButton?.addEventListener("click", () => {
  if (!confirm("저장된 모든 데이터를 초기화할까요?")) return;
  localStorage.removeItem("choSiteContent");
  localStorage.removeItem("choSiteReviews");
  location.reload();
});

function updateSyncStatus() {
  const statusEl = document.getElementById("sync-status");
  if (!statusEl) return;

  if (window.supabaseClient && window.supabaseReady) {
    statusEl.textContent = "모든 기기에서 실시간 동기화됩니다 ✅";
    statusEl.style.color = "green";
  } else {
    statusEl.textContent = "Supabase 연결 대기 중... (3초 타임아웃)";
    statusEl.style.color = "orange";
  }
}

async function init() {
  try {
    // Supabase 초기화 대기 (최대 3초)
    let waited = 0;
    while (!window.supabaseReady && waited < 3000) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waited += 100;
    }

    updateSyncStatus();

    // Supabase에서 데이터 로드
    if (window.supabaseClient && window.supabaseReady) {
      console.log("📦 Supabase에서 콘텐츠 로드 중...");
      try {
        const { data } = await window.supabaseClient
          .from('site_content')
          .select('key, value');

        if (data && data.length) {
          data.forEach(row => {
            savedContent[row.key] = row.value;
          });
          console.log(`✅ Supabase에서 ${data.length}개 항목 로드됨`);
        }
      } catch (err) {
        console.warn("⚠️ Supabase 로드 실패:", err.message);
      }

      try {
        const { data } = await window.supabaseClient
          .from('site_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length) {
          reviews = data;
          console.log(`✅ Supabase에서 ${data.length}개 후기 로드됨`);
        }
      } catch (err) {
        console.warn("⚠️ 후기 로드 실패:", err.message);
      }
    } else {
      // Supabase 실패 시 localStorage 폴백
      console.warn("⚠️ Supabase 연결 실패, localStorage 사용");
      try {
        const saved = JSON.parse(localStorage.getItem("choSiteContent") || "{}");
        savedContent = saved;
      } catch (e) {}

      try {
        const saved = JSON.parse(localStorage.getItem("choSiteReviews") || "[]");
        reviews = Array.isArray(saved) ? saved : [];
      } catch (e) {}
    }

    renderAdminForm();
    renderReviewAdmin();

    console.log("✅ Admin panel loaded");
  } catch (err) {
    console.error("Init failed:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", init);
