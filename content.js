// =========================
// content.js
// =========================
//Desenvolvido por Leonardo Cuervo

function searchContent() {

  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.name) return `${el.tagName.toLowerCase()}[name="${el.name}"]`;

    let selector = el.tagName.toLowerCase();
    if (el.className && typeof el.className === "string") {
      const cls = el.className.split(" ").filter(Boolean)[0];
      if (cls) selector += `.${cls}`;
    }
    return selector;
  }

  function diagnosticoPorScore(score) {
    if (score >= 85) return "🟢 Automatizável";
    if (score >= 60) return "🟡 Automatizável com risco";
    if (score >= 40) return "🟠 Alto esforço";
    return "🔴 Não recomendado";
  }

  let score = 100;
  const riscos = [];

  document.querySelectorAll("input").forEach(input => {
    if (!input.id && !input.name) {
      score -= 5;
      riscos.push(`🟠 Input sem id → ${getSelector(input)}`);
    }
  });

  document.querySelectorAll("button").forEach(btn => {
    const texto = btn.innerText.trim().toLowerCase();
    if (["ok", "confirmar", "enviar"].includes(texto)) {
      score -= 3;
      riscos.push(`🟡 Botão genérico ("${texto}") → ${getSelector(btn)}`);
    }
  });

  document.querySelectorAll("table").forEach(table => {
    if (!table.querySelector("thead")) {
      score -= 7;
      riscos.push(`🔴 Tabela sem <thead> → ${getSelector(table)}`);
    }
  });

  score = Math.max(score, 0);
  const diagnostico = diagnosticoPorScore(score);

  //normaliza o resultado
  return { score, diagnostico, riscos };
}
