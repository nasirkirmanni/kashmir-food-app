/**
 * Question-and-answer pairs from an article's "## Frequently asked questions"
 * section, for FAQPage structured data. Each ### heading is a question and the
 * text below it, up to the next heading, is its answer, so the schema always
 * matches what the page shows. Returns [] when there is no such section.
 */
const LIST_ITEM = /^(?:[-*+]|\d+\.)\s+/;

function inlineText(markdown) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// List items are joined into one sentence: "haakh, nadru yakhni, dum olav."
function answerText(lines) {
  return lines
    .map((line, i) => {
      if (!LIST_ITEM.test(line)) return inlineText(line);
      const item = inlineText(line.replace(LIST_ITEM, ""));
      if (!item || /[.,;:!?]$/.test(item)) return item;
      return `${item}${LIST_ITEM.test(lines[i + 1] || "") ? "," : "."}`;
    })
    .filter(Boolean)
    .join(" ");
}

export function faqsFromMarkdown(markdown) {
  const text = (markdown || "").replace(/\r\n?/g, "\n");
  const heading = /^##\s+frequently asked questions\s*$/im.exec(text);
  if (!heading) return [];

  const rest = text.slice(heading.index + heading[0].length);
  const nextSection = rest.search(/^#{1,2}\s/m);
  const section = nextSection === -1 ? rest : rest.slice(0, nextSection);

  return section
    .split(/^###\s+/m)
    .slice(1)
    .map((block) => {
      const [question, ...body] = block.split("\n");
      const lines = body.map((line) => line.trim()).filter(Boolean);
      return { question: inlineText(question), answer: answerText(lines) };
    })
    .filter((faq) => faq.question && faq.answer);
}
