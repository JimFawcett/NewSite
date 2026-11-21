from pathlib import Path

import pypdfium2 as pdfium


root = Path(__file__).resolve().parents[2]
source = root / "output" / "pdf" / "common_poetic_meters_prompt_reply.pdf"
render_dir = root / "tmp" / "pdfs" / "rendered_common_meters"
render_dir.mkdir(parents=True, exist_ok=True)

pdf = pdfium.PdfDocument(source)
for index, page in enumerate(pdf):
    image = page.render(scale=1.6).to_pil()
    target = render_dir / f"page-{index + 1}.png"
    image.save(target)
    print(target)
