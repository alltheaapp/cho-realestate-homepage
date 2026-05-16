const body = document.body;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const reviewGrid = document.querySelector("[data-review-grid]");
const contactForm = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

menuButton?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-label", "메뉴 열기");
  }
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
});

let reviewOffset = 0;

function renderReviews() {
  const reviewCards = Array.from(document.querySelectorAll("[data-review-grid] .review-card"));
  if (!reviewGrid || window.innerWidth <= 1040) {
    reviewCards.forEach((card) => card.classList.remove("is-hidden"));
    return;
  }

  reviewCards.forEach((card, index) => {
    const visibleIndex = (index - reviewOffset + reviewCards.length) % reviewCards.length;
    card.classList.toggle("is-hidden", visibleIndex > 2);
    card.style.order = String(visibleIndex);
  });
}

document.querySelector("[data-review-next]")?.addEventListener("click", () => {
  reviewOffset = (reviewOffset + 1) % reviewCards.length;
  renderReviews();
});

document.querySelector("[data-review-prev]")?.addEventListener("click", () => {
  reviewOffset = (reviewOffset - 1 + reviewCards.length) % reviewCards.length;
  renderReviews();
});

window.addEventListener("resize", renderReviews);
document.addEventListener("site-reviews-rendered", renderReviews);
renderReviews();

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const content = typeof getSiteContent === "function" ? getSiteContent() : {};
  const email = content["contact.email"] || "contact@chorealestate.com";
  const formData = new FormData(contactForm);
  const name = formData.get("name") || "";
  const phone = formData.get("phone") || "";
  const type = formData.get("type") || "";
  const message = formData.get("message") || "";
  const subject = encodeURIComponent(`[홈페이지 상담] ${name}님 문의`);
  const bodyText = encodeURIComponent(
    `이름: ${name}\n연락처: ${phone}\n상담 유형: ${type}\n\n상담 내용:\n${message}`
  );

  window.location.href = `mailto:${email}?subject=${subject}&body=${bodyText}`;
  if (formNote) {
    formNote.textContent = "이메일 작성 창이 열렸습니다. 실제 접수 폼은 추후 연결할 수 있습니다.";
  }
});
