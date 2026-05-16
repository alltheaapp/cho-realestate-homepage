const form = document.querySelector("[data-admin-form]");
const exportButton = document.querySelector("[data-export]");
const resetButton = document.querySelector("[data-reset]");
const exportBox = document.querySelector("[data-export-box]");
const reviewAdminList = document.querySelector("[data-review-admin-list]");
const addReviewButton = document.querySelector("[data-add-review]");
const savedContent = getSiteContent();
let reviews = getSiteReviews();

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

function saveReviews() {
  reviews = collectReviews();
  localStorage.setItem("choSiteReviews", JSON.stringify(reviews));
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

form?.addEventListener("input", () => {
  localStorage.setItem("choSiteContent", JSON.stringify(collectFormData()));
});

reviewAdminList?.addEventListener("input", saveReviews);

reviewAdminList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-review]");
  if (!button) return;
  reviews = collectReviews();
  reviews.splice(Number(button.dataset.removeReview), 1);
  localStorage.setItem("choSiteReviews", JSON.stringify(reviews));
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
  localStorage.setItem("choSiteReviews", JSON.stringify(reviews));
  renderReviewAdmin();
});

exportButton?.addEventListener("click", () => {
  const data = {
    content: collectFormData(),
    reviews: collectReviews()
  };
  localStorage.setItem("choSiteContent", JSON.stringify(data.content));
  localStorage.setItem("choSiteReviews", JSON.stringify(data.reviews));
  exportBox.value = JSON.stringify(data, null, 2);
});

resetButton?.addEventListener("click", () => {
  if (!confirm("저장된 문구를 초기화할까요?")) return;
  localStorage.removeItem("choSiteContent");
  localStorage.removeItem("choSiteReviews");
  location.reload();
});

renderAdminForm();
renderReviewAdmin();
