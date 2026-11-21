from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    PageBreak,
    Paragraph,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "common_poetic_meters_prompt_reply.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)


def draw_page(canvas, doc):
    canvas.saveState()
    width, height = letter
    canvas.setStrokeColor(colors.HexColor("#CBD5E1"))
    canvas.line(0.72 * inch, 0.58 * inch, width - 0.72 * inch, 0.58 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawString(0.72 * inch, 0.36 * inch, "Poetry notes")
    canvas.drawRightString(width - 0.72 * inch, 0.36 * inch, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
title = ParagraphStyle(
    "TitleCustom",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=22,
    leading=27,
    textColor=colors.HexColor("#172554"),
    alignment=TA_CENTER,
    spaceAfter=20,
)
label = ParagraphStyle(
    "Label",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    textColor=colors.HexColor("#1D4ED8"),
    spaceBefore=8,
    spaceAfter=7,
)
prompt = ParagraphStyle(
    "Prompt",
    parent=styles["BodyText"],
    fontName="Helvetica-Oblique",
    fontSize=12,
    leading=18,
    leftIndent=14,
    rightIndent=14,
    borderColor=colors.HexColor("#BFDBFE"),
    borderWidth=1,
    borderPadding=10,
    backColor=colors.HexColor("#EFF6FF"),
    spaceAfter=18,
)
body = ParagraphStyle(
    "BodyCustom",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=10.5,
    leading=15.5,
    textColor=colors.HexColor("#1F2937"),
    spaceAfter=7,
)
bullet = ParagraphStyle(
    "BulletCustom",
    parent=body,
    leftIndent=18,
    firstLineIndent=-9,
    bulletIndent=5,
    spaceAfter=5,
)
section = ParagraphStyle(
    "Section",
    parent=styles["Heading3"],
    fontName="Helvetica-Bold",
    fontSize=12,
    leading=15,
    textColor=colors.HexColor("#172554"),
    spaceBefore=12,
    spaceAfter=7,
)

doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=letter,
    leftMargin=0.78 * inch,
    rightMargin=0.78 * inch,
    topMargin=0.70 * inch,
    bottomMargin=0.78 * inch,
    title="Common Meters Used in Poetry",
    author="OpenAI",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates(PageTemplate(id="standard", frames=[frame], onPage=draw_page))

story = [
    Paragraph("Common Meters Used in Poetry", title),
    Paragraph("PROMPT", label),
    Paragraph("List all the common meters used in poetry.", prompt),
    Paragraph("REPLY", label),
    Paragraph("Common poetic meters include:", body),
]

feet = [
    ("Iambic", "unstressed + stressed: <i>be-LONG</i>"),
    ("Trochaic", "stressed + unstressed: <i>TA-ble</i>"),
    ("Anapestic", "unstressed + unstressed + stressed: <i>in the DARK</i>"),
    ("Dactylic", "stressed + unstressed + unstressed: <i>MER-ri-ly</i>"),
    ("Spondaic", "stressed + stressed: <i>HEARTBREAK</i>"),
    ("Pyrrhic", "unstressed + unstressed; usually appears as a substitution"),
    ("Amphibrachic", "unstressed + stressed + unstressed: <i>re-MEM-ber</i>"),
]
for name, desc in feet:
    story.append(Paragraph(f"<b>{name}</b> - {desc}", bullet, bulletText="-"))

story.extend([
    Paragraph("Feet per line", section),
    Paragraph("These feet are commonly organized by the number of feet per line:", body),
])
counts = [
    "Monometer - one foot", "Dimeter - two feet", "Trimeter - three feet",
    "Tetrameter - four feet", "Pentameter - five feet", "Hexameter - six feet",
    "Heptameter - seven feet", "Octameter - eight feet",
]
for item in counts:
    story.append(Paragraph(item, bullet, bulletText="-"))

story.extend([
    PageBreak(),
    Paragraph("Frequent combinations", section),
])
combinations = [
    "Iambic pentameter", "Iambic tetrameter", "Iambic trimeter",
    "Trochaic tetrameter", "Trochaic octameter", "Anapestic trimeter",
    "Anapestic tetrameter", "Dactylic hexameter", "Dactylic tetrameter",
    "Alexandrine - usually iambic hexameter",
    "Fourteener - usually iambic heptameter",
    "Ballad meter - alternating iambic tetrameter and trimeter",
    "Common meter - the same alternating 4/3 pattern, usually rhymed <i>ABAB</i>",
    "Long meter - four lines of iambic tetrameter",
    "Short meter - iambic lines patterned 3/3/4/3",
]
for item in combinations:
    story.append(Paragraph(item, bullet, bulletText="-"))

story.append(Paragraph("Other widespread metrical systems", section))
systems = [
    "<b>Blank verse</b> - unrhymed iambic pentameter",
    "<b>Sprung rhythm</b> - counted stressed syllables with a variable number of unstressed syllables",
    "<b>Accentual verse</b> - counts stresses rather than syllables",
    "<b>Syllabic verse</b> - counts syllables rather than stresses",
    "<b>Quantitative meter</b> - organized by long and short syllables, as in classical Greek and Latin poetry",
    "<b>Free verse</b> - no fixed recurring meter, though rhythmic patterns may still occur",
    "<b>Haiku rhythm</b> - syllabic structure, traditionally based on Japanese sound units rather than English metrical feet",
]
for item in systems:
    story.append(Paragraph(item, bullet, bulletText="-"))

doc.build(story)
print(OUTPUT)
