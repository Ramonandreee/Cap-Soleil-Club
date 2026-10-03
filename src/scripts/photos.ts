// Fusão das fotos: cada foto espera carregar por cima do seu placeholder
// desfocado. Sem JavaScript, as fotos aparecem direto (a classe não entra).

document.documentElement.classList.add("photos-js");

function reveal(img: HTMLImageElement) {
  const show = () => img.classList.add("is-loaded");
  if (img.complete && img.naturalWidth > 0) show();
  else {
    img.addEventListener("load", show, { once: true });
    img.addEventListener("error", show, { once: true });
  }
}

for (const img of document.querySelectorAll<HTMLImageElement>(".photo__img")) reveal(img);
