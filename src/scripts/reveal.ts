// Revelação suave dos blocos ao rolar. Sem JavaScript ou com "reduzir
// movimento" ligado, tudo aparece de uma vez (a classe .motion não entra).

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

function start() {
  if (reduce.matches || !("IntersectionObserver" in window)) return;
  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  const viewport = window.innerHeight;
  // O que já está na tela não pisca: entra visível.
  for (const item of items) {
    if (item.getBoundingClientRect().top < viewport) item.classList.add("is-visible");
  }
  document.documentElement.classList.add("motion");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  for (const item of items) if (!item.classList.contains("is-visible")) observer.observe(item);
}

start();
