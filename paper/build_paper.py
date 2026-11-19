#!/usr/bin/env python3
"""
Builds the mandatory IEEE A4 Seminar Paper (.docx) directly from the official
conference-template-a4.docx (Strict OOXML), preserving all template styles,
margins, 2-column layout, automatic numbering, and typography.

Usage:
    python3 paper/build_paper.py
"""

import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PAPER_DIR = ROOT / "paper"
TEMPLATE_PATH = PAPER_DIR / "conference-template-a4.docx"
OUTPUT_PATH = PAPER_DIR / "Seminar_Paper_TeamB_Group4.docx"
FIG_FCP = PAPER_DIR / "figures" / "chart-fcp.png"
FIG_LCP = PAPER_DIR / "figures" / "chart-lcp.png"
FIG_TBT = PAPER_DIR / "figures" / "chart-tbt.png"

# Strict OOXML namespaces matching conference-template-a4.docx
W_NS = "http://purl.oclc.org/ooxml/wordprocessingml/main"
R_NS = "http://purl.oclc.org/ooxml/officeDocument/relationships"
WP_NS = "http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing"
A_NS = "http://purl.oclc.org/ooxml/drawingml/main"
PIC_NS = "http://purl.oclc.org/ooxml/drawingml/picture"
XML_NS = "http://www.w3.org/XML/1998/namespace"

ET.register_namespace("w", W_NS)
ET.register_namespace("r", R_NS)
ET.register_namespace("wp", WP_NS)
ET.register_namespace("a", A_NS)
ET.register_namespace("pic", PIC_NS)


def w(tag):
    return f"{{{W_NS}}}{tag}"


def wp(tag):
    return f"{{{WP_NS}}}{tag}"


def a(tag):
    return f"{{{A_NS}}}{tag}"


def pic(tag):
    return f"{{{PIC_NS}}}{tag}"


def r_attr(tag):
    return f"{{{R_NS}}}{tag}"


def make_run(text, bold=False, italic=False, sz=None, font=None, small_caps=False, sup=False, sub=False, color=None):
    r = ET.Element(w("r"))
    if any([bold, italic, sz, font, small_caps, sup, sub, color]):
        rPr = ET.SubElement(r, w("rPr"))
        if font:
            rf = ET.SubElement(rPr, w("rFonts"))
            rf.set(w("ascii"), font)
            rf.set(w("hAnsi"), font)
            rf.set(w("cs"), font)
        if bold:
            ET.SubElement(rPr, w("b"))
            ET.SubElement(rPr, w("bCs"))
        if italic:
            ET.SubElement(rPr, w("i"))
            ET.SubElement(rPr, w("iCs"))
        if small_caps:
            ET.SubElement(rPr, w("smallCaps"))
        if color:
            c = ET.SubElement(rPr, w("color"))
            c.set(w("val"), color)
        if sz:
            s = ET.SubElement(rPr, w("sz"))
            s.set(w("val"), str(sz))
            scs = ET.SubElement(rPr, w("szCs"))
            scs.set(w("val"), str(sz))
        if sup:
            va = ET.SubElement(rPr, w("vertAlign"))
            va.set(w("val"), "superscript")
        elif sub:
            va = ET.SubElement(rPr, w("vertAlign"))
            va.set(w("val"), "subscript")
    t = ET.SubElement(r, w("t"))
    t.set(f"{{{XML_NS}}}space", "preserve")
    t.text = text
    return r


def make_para(style=None, runs=None, jc=None, space_before=None, space_after=None,
              line=None, line_rule=None, first_line=None, start_ind=None, hanging=None,
              no_num=False, keep_next=False, page_break_before=False, sect_pr=None):
    p = ET.Element(w("p"))
    pPr = ET.SubElement(p, w("pPr"))
    if style:
        ps = ET.SubElement(pPr, w("pStyle"))
        ps.set(w("val"), style)
    if keep_next:
        ET.SubElement(pPr, w("keepNext"))
    if page_break_before:
        ET.SubElement(pPr, w("pageBreakBefore"))
    if no_num:
        np = ET.SubElement(pPr, w("numPr"))
        nid = ET.SubElement(np, w("numId"))
        nid.set(w("val"), "0")
    if any(x is not None for x in [space_before, space_after, line]):
        sp = ET.SubElement(pPr, w("spacing"))
        if space_before is not None:
            sp.set(w("before"), str(space_before))
        if space_after is not None:
            sp.set(w("after"), str(space_after))
        if line is not None:
            sp.set(w("line"), str(line))
            sp.set(w("lineRule"), line_rule or "auto")
    if any(x is not None for x in [first_line, start_ind, hanging]):
        ind = ET.SubElement(pPr, w("ind"))
        if start_ind is not None:
            ind.set(w("start"), str(start_ind))
        if first_line is not None:
            ind.set(w("firstLine"), str(first_line))
        if hanging is not None:
            ind.set(w("hanging"), str(hanging))
    if jc:
        j = ET.SubElement(pPr, w("jc"))
        j.set(w("val"), jc)
    if sect_pr is not None:
        pPr.append(sect_pr)
    if runs:
        for run in runs:
            p.append(run)
    return p


def rich_runs(segments, sz=None, font=None):
    out = []
    for seg in segments:
        if isinstance(seg, str):
            out.append(make_run(seg, sz=sz, font=font))
        else:
            text, opts = seg
            kw = dict(opts)
            if sz and "sz" not in kw:
                kw["sz"] = sz
            if font and "font" not in kw:
                kw["font"] = font
            out.append(make_run(text, **kw))
    return out


def make_sect_pr(cols=2, col_space="18pt", top="54pt", bottom="72pt",
                 left="45.35pt", right="45.35pt", continuous=True, title_pg=False):
    sp = ET.Element(w("sectPr"))
    if continuous:
        tp = ET.SubElement(sp, w("type"))
        tp.set(w("val"), "continuous")
    pgSz = ET.SubElement(sp, w("pgSz"))
    pgSz.set(w("w"), "595.30pt")
    pgSz.set(w("h"), "841.90pt")
    pgSz.set(w("code"), "9")
    pgMar = ET.SubElement(sp, w("pgMar"))
    pgMar.set(w("top"), top)
    pgMar.set(w("right"), right)
    pgMar.set(w("bottom"), bottom)
    pgMar.set(w("left"), left)
    pgMar.set(w("header"), "36pt")
    pgMar.set(w("footer"), "36pt")
    pgMar.set(w("gutter"), "0pt")
    c = ET.SubElement(sp, w("cols"))
    if cols > 1:
        c.set(w("num"), str(cols))
    c.set(w("space"), col_space)
    if title_pg:
        ET.SubElement(sp, w("titlePg"))
    dg = ET.SubElement(sp, w("docGrid"))
    dg.set(w("linePitch"), "360")
    return sp


def make_author_cell(name, email, width_dxa):
    tc = ET.Element(w("tc"))
    tcPr = ET.SubElement(tc, w("tcPr"))
    tcW = ET.SubElement(tcPr, w("tcW"))
    tcW.set(w("w"), str(width_dxa))
    tcW.set(w("type"), "dxa")
    tcMar = ET.SubElement(tcPr, w("tcMar"))
    for side, val in [("top", "10"), ("bottom", "18"), ("left", "35"), ("right", "35")]:
        m = ET.SubElement(tcMar, w(side))
        m.set(w("w"), val)
        m.set(w("type"), "dxa")

    def line_p(runs, after="0"):
        return make_para(style="Author", runs=runs, jc="center", space_before="0", space_after=after, line="190", line_rule="auto")

    tc.append(line_p([make_run(name, sz=19)]))
    tc.append(line_p([make_run("Dept. of Engineering / Computer Science", italic=True, sz=16)]))
    tc.append(line_p([make_run("Hochschule Campus Wien, Vienna, Austria", italic=True, sz=16)]))
    tc.append(line_p([make_run(email, sz=15)], after="25"))
    return tc


def make_borderless_author_table(authors, total_width_dxa):
    tbl = ET.Element(w("tbl"))
    tblPr = ET.SubElement(tbl, w("tblPr"))
    tblW = ET.SubElement(tblPr, w("tblW"))
    tblW.set(w("w"), str(total_width_dxa))
    tblW.set(w("type"), "dxa")
    jc = ET.SubElement(tblPr, w("jc"))
    jc.set(w("val"), "center")
    borders = ET.SubElement(tblPr, w("tblBorders"))
    for b in ["top", "start", "bottom", "end", "insideH", "insideV"]:
        el = ET.SubElement(borders, w(b))
        el.set(w("val"), "none")
    layout = ET.SubElement(tblPr, w("tblLayout"))
    layout.set(w("type"), "fixed")

    col_w = total_width_dxa // len(authors)
    grid = ET.SubElement(tbl, w("tblGrid"))
    for _ in authors:
        gc = ET.SubElement(grid, w("gridCol"))
        gc.set(w("w"), str(col_w))
    tr = ET.SubElement(tbl, w("tr"))
    for name, email in authors:
        tr.append(make_author_cell(name, email, col_w))
    return tbl


def make_equation(lhs_runs, eq_num):
    """IEEE centered equation with right-aligned number (N) in Times New Roman."""
    p = ET.Element(w("p"))
    pPr = ET.SubElement(p, w("pPr"))
    ps = ET.SubElement(pPr, w("pStyle"))
    ps.set(w("val"), "equation")
    sp = ET.SubElement(pPr, w("spacing"))
    sp.set(w("before"), "40")
    sp.set(w("after"), "40")
    sp.set(w("line"), "205")
    sp.set(w("lineRule"), "auto")
    tabs = ET.SubElement(pPr, w("tabs"))
    t1 = ET.SubElement(tabs, w("tab"))
    t1.set(w("val"), "center")
    t1.set(w("pos"), "2430")
    t2 = ET.SubElement(tabs, w("tab"))
    t2.set(w("val"), "end")
    t2.set(w("pos"), "4860")

    r_tab1 = ET.SubElement(p, w("r"))
    ET.SubElement(r_tab1, w("tab"))
    for run in lhs_runs:
        p.append(run)
    r_tab2 = ET.SubElement(p, w("r"))
    ET.SubElement(r_tab2, w("tab"))
    p.append(make_run(f"({eq_num})", font="Times New Roman", sz=18))
    return p


def make_ieee_table(headers, rows, col_widths, alignments, group_breaks=None, cell_sz=13):
    """Clean booktabs-style IEEE table fitting strictly inside a single 243pt column."""
    group_breaks = set(group_breaks or [])
    tbl = ET.Element(w("tbl"))
    tblPr = ET.SubElement(tbl, w("tblPr"))
    tblW = ET.SubElement(tblPr, w("tblW"))
    tblW.set(w("w"), str(sum(col_widths)))
    tblW.set(w("type"), "dxa")
    jc = ET.SubElement(tblPr, w("jc"))
    jc.set(w("val"), "center")

    borders = ET.SubElement(tblPr, w("tblBorders"))
    for b, val, sz in [
        ("top", "single", "8"),
        ("bottom", "single", "8"),
        ("start", "none", "0"),
        ("end", "none", "0"),
        ("insideH", "none", "0"),
        ("insideV", "none", "0"),
    ]:
        el = ET.SubElement(borders, w(b))
        el.set(w("val"), val)
        if sz != "0":
            el.set(w("sz"), sz)
            el.set(w("space"), "0")
            el.set(w("color"), "000000")

    layout = ET.SubElement(tblPr, w("tblLayout"))
    layout.set(w("type"), "fixed")

    grid = ET.SubElement(tbl, w("tblGrid"))
    for cw in col_widths:
        gc = ET.SubElement(grid, w("gridCol"))
        gc.set(w("w"), str(cw))

    def build_row(cells_data, is_header=False, bottom_border=None, shaded=False):
        tr = ET.Element(w("tr"))
        trPr = ET.SubElement(tr, w("trPr"))
        ET.SubElement(trPr, w("cantSplit"))
        if is_header:
            ET.SubElement(trPr, w("tblHeader"))
        for idx, cell_spec in enumerate(cells_data):
            tc = ET.SubElement(tr, w("tc"))
            tcPr = ET.SubElement(tc, w("tcPr"))
            tcW = ET.SubElement(tcPr, w("tcW"))
            tcW.set(w("w"), str(col_widths[idx]))
            tcW.set(w("type"), "dxa")
            if bottom_border:
                tcB = ET.SubElement(tcPr, w("tcBorders"))
                bb = ET.SubElement(tcB, w("bottom"))
                bb.set(w("val"), "single")
                bb.set(w("sz"), bottom_border[0])
                bb.set(w("space"), "0")
                bb.set(w("color"), bottom_border[1])
            if shaded:
                shd = ET.SubElement(tcPr, w("shd"))
                shd.set(w("val"), "clear")
                shd.set(w("color"), "auto")
                shd.set(w("fill"), "F2F4F7")
            tcMar = ET.SubElement(tcPr, w("tcMar"))
            for side, val in [("top", "14"), ("bottom", "14"), ("left", "20"), ("right", "20")]:
                m = ET.SubElement(tcMar, w(side))
                m.set(w("w"), val)
                m.set(w("type"), "dxa")
            vA = ET.SubElement(tcPr, w("vAlign"))
            vA.set(w("val"), "center")

            align = alignments[idx]
            if is_header:
                runs = [make_run(cell_spec, bold=True, sz=cell_sz, font="Times New Roman")]
                p = make_para(style="tablecolhead", runs=runs, jc=align, space_before="0", space_after="0", line="160", line_rule="auto")
            else:
                if isinstance(cell_spec, list):
                    runs = rich_runs(cell_spec, sz=cell_sz, font="Times New Roman")
                elif isinstance(cell_spec, tuple):
                    text, is_bold = cell_spec
                    runs = [make_run(text, bold=is_bold, sz=cell_sz, font="Times New Roman")]
                else:
                    runs = [make_run(str(cell_spec), sz=cell_sz, font="Times New Roman")]
                p = make_para(style="tablecopy", runs=runs, jc=align, space_before="0", space_after="0", line="160", line_rule="auto")
            tc.append(p)
        return tr

    tbl.append(build_row(headers, is_header=True, bottom_border=("6", "000000"), shaded=True))
    for r_idx, row in enumerate(rows):
        bdr = ("4", "B0B8C4") if r_idx in group_breaks else None
        tbl.append(build_row(row, is_header=False, bottom_border=bdr, shaded=False))
    return tbl


def make_image_para(rel_id, img_path, width_inches, doc_pr_id, name):
    with Image.open(img_path) as im:
        px_w, px_h = im.size
    cx = int(width_inches * 914400)
    cy = int(cx * px_h / px_w)

    p = make_para(jc="center", space_before="30", space_after="10", keep_next=True)
    r = ET.SubElement(p, w("r"))
    drawing = ET.SubElement(r, w("drawing"))
    inline = ET.SubElement(drawing, wp("inline"))
    inline.set("distT", "0")
    inline.set("distB", "0")
    inline.set("distL", "0")
    inline.set("distR", "0")

    extent = ET.SubElement(inline, wp("extent"))
    extent.set("cx", str(cx))
    extent.set("cy", str(cy))

    eff = ET.SubElement(inline, wp("effectExtent"))
    for k in ["l", "t", "r", "b"]:
        eff.set(k, "0")

    docPr = ET.SubElement(inline, wp("docPr"))
    docPr.set("id", str(doc_pr_id))
    docPr.set("name", name)

    cNvG = ET.SubElement(inline, wp("cNvGraphicFramePr"))
    locks = ET.SubElement(cNvG, a("graphicFrameLocks"))
    locks.set("noChangeAspect", "1")

    graphic = ET.SubElement(inline, a("graphic"))
    gData = ET.SubElement(graphic, a("graphicData"))
    gData.set("uri", PIC_NS)

    pic_el = ET.SubElement(gData, pic("pic"))
    nvPicPr = ET.SubElement(pic_el, pic("nvPicPr"))
    cNvPr = ET.SubElement(nvPicPr, pic("cNvPr"))
    cNvPr.set("id", str(doc_pr_id + 10))
    cNvPr.set("name", name)
    ET.SubElement(nvPicPr, pic("cNvPicPr"))

    blipFill = ET.SubElement(pic_el, pic("blipFill"))
    blip = ET.SubElement(blipFill, a("blip"))
    blip.set(r_attr("embed"), rel_id)
    stretch = ET.SubElement(blipFill, a("stretch"))
    ET.SubElement(stretch, a("fillRect"))

    spPr = ET.SubElement(pic_el, pic("spPr"))
    xfrm = ET.SubElement(spPr, a("xfrm"))
    off = ET.SubElement(xfrm, a("off"))
    off.set("x", "0")
    off.set("y", "0")
    ext = ET.SubElement(xfrm, a("ext"))
    ext.set("cx", str(cx))
    ext.set("cy", str(cy))
    prstGeom = ET.SubElement(spPr, a("prstGeom"))
    prstGeom.set("prst", "rect")
    ET.SubElement(prstGeom, a("avLst"))
    return p


def build_document_xml():
    doc = ET.Element(w("document"))
    body = ET.SubElement(doc, w("body"))

    # =========================================================================
    # SECTION 1: SINGLE-COLUMN TITLE + 5 AUTHORS BLOCK
    # =========================================================================
    body.append(
        make_para(
            style="papertitle",
            runs=[make_run("Evaluating Jamstack Rendering Architectures Under Scaling Data Loads: Next.js SSG vs. Astro Islands")],
            space_before="0",
            space_after="70",
        )
    )

    authors_row1 = [
        ("Fabio Gschweidl", "fabio.gschweidl@stud.hcw.ac.at"),
        ("Desirée Iris Hackl", "desiree.hackl@stud.hcw.ac.at"),
        ("Marco Miklautz", "marco.miklautz@stud.hcw.ac.at"),
    ]
    authors_row2 = [
        ("Lorenz Schneider", "lorenz.schneider@stud.hcw.ac.at"),
        ("Danijel Trailovic", "danijel.trailovic@stud.hcw.ac.at"),
    ]
    body.append(make_borderless_author_table(authors_row1, 9900))
    body.append(make_borderless_author_table(authors_row2, 6600))

    # End of 1-column title/author section -> continuous transition into 2-column IEEE body
    body.append(
        make_para(
            space_before="0",
            space_after="20",
            line="50",
            line_rule="exact",
            sect_pr=make_sect_pr(cols=1, col_space="36pt", top="48pt", bottom="68pt", left="45.35pt", right="45.35pt", continuous=False, title_pg=True),
        )
    )

    # =========================================================================
    # SECTION 2: TWO-COLUMN MAIN PAPER (STRICTLY <= 3 PAGES)
    # =========================================================================

    # --- ABSTRACT (Past Tense & Passive Voice; NO citations, NO URLs, NO undefined acronyms) ---
    body.append(
        make_para(
            style="Abstract",
            runs=rich_runs([
                ("Abstract", {"italic": True}),
                ("—Modern web applications adopt pre-rendering and hybrid hydration to balance initial speed with interactivity. While Server-Side Rendering and Client-Side Rendering have been benchmarked under scaling workloads, the impact of full hydration versus partial Islands hydration within the Jamstack paradigm has remained insufficiently quantified at large Document Object Model (DOM) scales. Two functionally identical Academic Assessment Management prototypes were implemented using Next.js (Static Site Generation with full React hydration) and Astro (Static Site Generation with zero-JavaScript Islands Architecture). Both prototypes were evaluated across seven exponentially increasing workloads from 10 to 10,000 records via automated Google Lighthouse desktop audits with five repetitions per stage (70 runs) and compared against Server-Side and Client-Side Rendering baselines. Up to 500 records, both Jamstack variants scored 98.4–100.0, while Astro reduced Largest Contentful Paint by up to 62% (0.25 s versus 0.66 s at 10 records) by eliminating external JavaScript bundles. At 10,000 records (approximately 190,000 DOM nodes), full React hydration incurred a 38.2% HTML double-payload penalty (9,343.2 kB versus 6,760.2 kB), yielding a Largest Contentful Paint of 8.12 s versus 5.70 s in Astro; yet both Jamstack builds cut Total Blocking Time by over 44% versus monolithic Server-Side Rendering (2,344.0 ms and 2,675.5 ms versus 4,860.0 ms). Quantitative thresholds and guidelines for scalable architecture design are derived.", {}),
            ]),
            space_after="90",
        )
    )

    # --- KEYWORDS ---
    body.append(
        make_para(
            style="Keywords",
            runs=rich_runs([
                ("Keywords—Jamstack, Static Site Generation, Islands Architecture, Next.js, Astro, Core Web Vitals, web performance.", {}),
            ]),
            space_after="80",
        )
    )

    def h1(title):
        body.append(make_para(style="Heading1", runs=[make_run(title)], space_before="105", space_after="45", keep_next=True))

    def h2(title):
        body.append(make_para(style="Heading2", runs=[make_run(title)], space_before="75", space_after="32", keep_next=True))

    def p_body(segments, after="70"):
        body.append(make_para(style="BodyText", runs=rich_runs(segments), space_after=after, line="222", line_rule="auto"))

    # =========================================================================
    # I. INTRODUCTION
    # =========================================================================
    h1("Introduction")
    p_body([
        "Modern web applications must meet strict Google Core Web Vitals (CWV) targets—First Contentful Paint (FCP), Largest Contentful Paint (LCP ≤ 2.5 s), Total Blocking Time (TBT < 200 ms), and Cumulative Layout Shift (CLS ≤ 0.1)—while supporting rich client interactivity. Single-Page Applications (SPAs) using Client-Side Rendering (CSR) defer UI rendering to the browser, adding JavaScript execution latency, whereas Server-Side Rendering (SSR) builds HTML per request at the cost of server load and main-thread blocking on large pages [1], [2].",
    ])
    p_body([
        "Jamstack architectures reduce initial latency via Static Site Generation (SSG), pre-rendering HTML at build time for Content Delivery Network (CDN) caching. Yet modern frameworks diverge sharply in hydration: Next.js ships a React runtime to hydrate the entire Document Object Model (DOM), whereas Astro applies the Islands Architecture, emitting zero JavaScript by default and hydrating only isolated interactive regions [3], [4]. Teams still lack controlled empirical data on how full-hydration SSG and zero-JavaScript Islands scale across large datasets relative to SSR and CSR.",
    ])
    p_body([
        "We therefore address the Research Question (RQ): ",
        ("How do modern Jamstack rendering architectures—SSG with full React hydration (Next.js) versus Zero-JS Islands Architecture (Astro)—impact Core Web Vitals (FCP, LCP, TBT, CLS) and Speed Index (SI) under scaling data loads (10 to 10,000 entries) compared to traditional SSR (Laravel Blade) and CSR (React, Vue), and what technical guidelines can be derived for scalable web applications?", {"italic": True}),
        " We contribute a controlled 70-run benchmark, a normalized comparison against [1], causal analysis of Next.js's serialization penalty and DOM-parsing ceiling, and four quantitative design guidelines.",
    ])

    # =========================================================================
    # II. RELATED WORK
    # =========================================================================
    h1("Related Work")
    p_body([
        "We performed a PRISMA 2020 systematic literature review [5]. Google Scholar returned 103 records plus 11 reports from websites and citation tracking; after removing 6 duplicates and screening, 38 reports were assessed for eligibility, yielding 30 primary studies and 8 supplementary reports across seven themes.",
    ])
    p_body([
        "Empirical studies predominantly contrast CSR and SSR. Fahrudin ",
        ("et al.", {"italic": True}),
        " [1] benchmarked Laravel Blade (SSR) against React and Vue (CSR via Inertia.js) in an Academic Assessment Management System across ",
        ("N", {"italic": True}),
        " ∈ {10, 50, 100, 500, 1,000, 5,000, 10,000} entries, exposing a trade-off between fast SSR initial loads and steep TBT growth at scale versus CSR's lower blocking time. Yavuz and Miladinovic [2] showed SSR with rehydration raised Lighthouse scores from 48 to 87 over Angular CSR, while Shitov [6] and Đurić [7] confirmed CWV and streaming-SSR gains for Next.js over React CSR.",
    ])
    p_body([
        "Jamstack and partial-hydration benchmarks remain scarce at scale. Lonka [3] compared React SPA, Next.js, and Astro across 10- and 100-item storefronts, finding 54% client-JS reduction for Next.js and up to 84% for Astro lightweight islands, with steeper HTML growth in Astro. Mishra ",
        ("et al.", {"italic": True}),
        " [4] examined Astro's Islands paradigm, while Vepsäläinen ",
        ("et al.", {"italic": True}),
        " [8], [9] formalized HTML-first design and resumability. Related works studied isomorphic SPA migration [10], rendering patterns [11], and Next.js optimization [12]. None evaluated Next.js SSG versus Astro Islands across the full 10-to-10,000-entry scaling range of [1].",
    ])

    # =========================================================================
    # III. SCENARIO (Past Tense & Active Voice; Boundary Conditions)
    # =========================================================================
    h1("Scenario")
    p_body([
        "Replicating the domain of [1], we built an Academic Assessment Management System comprising four Key Performance Indicator (KPI) cards (count, mean score, pass rate, retakes), a multi-criteria filter toolbar (search, status/course selects, reset), and a 13-column assessment table with an interactive ",
        ("Flag", {"italic": True}),
        " button. Under strict ",
        ("ceteris paribus", {"italic": True}),
        " controls, both production prototypes shared one stylesheet (",
        ("shared/styles.css", {"italic": True}),
        ") and identical DOM trees (~19 DOM nodes/row; 265–190,085 total nodes): ",
        ("(1) Next.js SSG + Full Hydration", {"bold": True}),
        " (Next.js 15.5.29, React 19.3.1, ",
        ("output: 'export'", {"italic": True}),
        "), where a ",
        ("'use client'", {"italic": True}),
        " component hydrated the static table and shipped a 350.5 kB external JS bundle plus React Server Component (RSC) payloads; and ",
        ("(2) Astro SSG + Zero-JS Islands", {"bold": True}),
        " (Astro 5.18.2, ",
        ("output: 'static'", {"italic": True}),
        "), which compiled KPI cards and all ",
        ("N", {"italic": True}),
        " table rows to pure HTML (0.0 kB external JS) with a < 1.2 kB inline script using ",
        ("data-*", {"italic": True}),
        " attributes and event delegation.",
    ])
    p_body([
        "We generated seven deterministic JSON datasets via a seeded Mulberry32 generator (",
        ("SEED = 20261110", {"italic": True}),
        ") across ",
        ("N", {"italic": True}),
        " ∈ {10, 50, 100, 500, 1,000, 5,000, 10,000} (3.4–3,403.4 kB JSON). We executed all builds and audits on an isolated Debian 12 Linux virtual machine (Kernel 6.12.105+, Intel Xeon 6985P-C 2 vCPUs, 7.76 GB RAM, Node.js v24.22.2) using Headless Chromium 156.0.8078.79 and Google Lighthouse v12.8.2 Desktop preset (1350×940 viewport, 40 ms RTT, 10,240 kbps throughput, 1× CPU).",
    ])

    # =========================================================================
    # IV. METHODOLOGY (Past Tense & Active Voice; DOT + 4 Benchmarking Qs)
    # =========================================================================
    h1("Methodology")
    p_body([
        "We followed Development Oriented Triangulation (DOT): ",
        ("Library", {"italic": True}),
        " (PRISMA review), ",
        ("Workshop", {"italic": True}),
        " (two ",
        ("ceteris paribus", {"italic": True}),
        " prototypes), and ",
        ("Lab/Showroom", {"italic": True}),
        " (70 Lighthouse audits benchmarked against [1]). We justify four core benchmarking choices:",
    ], after="45")
    p_body([
        ("Baselines:", {"bold": True}),
        " We benchmarked Next.js SSG and Astro Islands against Laravel Blade (SSR), React (CSR), and Vue (CSR) from [1], spanning all major rendering paradigms. ",
        ("Datasets:", {"bold": True}),
        " The seven stages (",
        ("N", {"italic": True}),
        " = 10 to 10,000) mirror [1] and cover light (< 2,000 nodes), moderate (9,575–19,085 nodes, exceeding Lighthouse's 1,500-node limit), and extreme stress regimes (95,075–190,085 nodes). ",
        ("Metrics:", {"bold": True}),
        " We measured FCP (s), LCP (s), TBT (ms), SI (s), CLS, HTML/JS transfer sizes, and DOM node counts. ",
        ("Comparability & Statistical Reliability:", {"bold": True}),
        " Both static builds ran on a local loopback server (127.0.0.1, ",
        ("Cache-Control: immutable", {"italic": True}),
        ") to remove network jitter, launching fresh ",
        ("--incognito", {"italic": True}),
        " Chromium sessions with storage reset. We executed ",
        ("n", {"italic": True}),
        " = 5 independent runs per configuration (70 total) and computed mean (μ) and standard deviation (σ).",
    ], after="55")
    p_body([
        "To compare VM timings rigorously with [1], we applied three-pillar normalization: (i) Lighthouse Lantern simulation parity, (ii) dimensionless relative scaling (1) canceling host-CPU offsets, and (iii) baseline hardware calibration (2) anchored at ",
        ("N", {"italic": True}),
        " ≤ 100 (TBT = 0 ms):",
    ], after="25")

    body.append(make_equation([
        make_run("S", italic=True, font="Times New Roman", sz=18),
        make_run("N", italic=True, sub=True, font="Times New Roman", sz=18),
        make_run("(", font="Times New Roman", sz=18),
        make_run("M", italic=True, font="Times New Roman", sz=18),
        make_run(") = ", font="Times New Roman", sz=18),
        make_run("M", italic=True, font="Times New Roman", sz=18),
        make_run("N", italic=True, sub=True, font="Times New Roman", sz=18),
        make_run(" / ", font="Times New Roman", sz=18),
        make_run("M", italic=True, font="Times New Roman", sz=18),
        make_run("10", sub=True, font="Times New Roman", sz=18),
    ], 1))

    body.append(make_equation([
        make_run("k", italic=True, font="Times New Roman", sz=18),
        make_run("hw", sub=True, font="Times New Roman", sz=18),
        make_run(" = μ", font="Times New Roman", sz=18),
        make_run("FCP,[1]", sub=True, font="Times New Roman", sz=18),
        make_run(" / μ", font="Times New Roman", sz=18),
        make_run("FCP,Own", sub=True, font="Times New Roman", sz=18),
        make_run(" = 0.3333 / 0.2850 = 1.170", font="Times New Roman", sz=18),
    ], 2))

    p_body([
        "Calibrated timings ",
        ("M", {"italic": True}),
        ("*", {"sup": True}),
        " = 1.170 · ",
        ("M", {"italic": True}),
        ("Own", {"sub": True}),
        " project our VM results onto the baseline latency scale of [1].",
    ])

    # =========================================================================
    # V. RESULTS (Past Tense; Clear Separation of Own vs. [1]; Bold Best)
    # =========================================================================
    h1("Results")
    p_body([
        "Table I reports our 70 controlled measurements (μ ± σ, ",
        ("n", {"italic": True}),
        " = 5), strictly separated from the baselines [1] in Table II. Variance remained low across all 14 configurations (σ",
        ("LCP", {"sub": True}),
        " ≤ 0.077 s), and both Jamstack builds achieved CLS = 0.000 (vs. 0.003–0.011 in [1]).",
    ])

    # --- TABLE I: OWN MEASUREMENTS ---
    body.append(make_para(style="tablehead", runs=[make_run("Own Empirical Measurements (μ ± σ, n = 5 Runs)")], space_before="45", space_after="30", keep_next=True))
    t1_headers = ["N", "Arch.", "Score", "FCP [s]", "LCP [s]", "TBT [ms]", "SI [s]", "HTML"]
    t1_widths = [430, 460, 450, 770, 770, 790, 560, 610]  # sum = 4840 dxa (242 pt)
    t1_align = ["end", "start", "end", "end", "end", "end", "end", "end"]
    t1_rows = [
        ["10", "Astro", ("100.0", True), ("0.25±0.03", True), ("0.25±0.03", True), ("0±0", True), "0.30", ("17.0", True)],
        ["10", "Next.js", ("100.0", True), "0.26±0.00", "0.66±0.00", ("0±0", True), ("0.26", True), "18.6"],
        ["50", "Astro", ("100.0", True), ("0.27±0.00", True), ("0.27±0.00", True), ("0±0", True), ("0.27", True), ("43.8", True)],
        ["50", "Next.js", ("100.0", True), "0.30±0.01", "0.70±0.00", ("0±0", True), "0.30", "55.8"],
        ["100", "Astro", ("100.0", True), ("0.28±0.01", True), ("0.28±0.01", True), ("0±0", True), ("0.28", True), ("77.9", True)],
        ["100", "Next.js", ("100.0", True), "0.34±0.01", "0.74±0.01", ("0±0", True), "0.34", "102.9"],
        ["500", "Astro", ("100.0", True), ("0.58±0.05", True), ("0.59±0.04", True), ("3±4", True), ("0.58", True), ("348.1", True)],
        ["500", "Next.js", "98.4", "0.64±0.02", "0.95±0.08", "10±16", "0.64", "476.7"],
        ["1,000", "Astro", ("98.4", True), ("0.80±0.03", True), ("0.83±0.04", True), "62±29", ("0.80", True), ("685.3", True)],
        ["1,000", "Next.js", "94.0", "1.06±0.06", "1.37±0.06", ("60±35", True), "1.06", "943.0"],
        ["5,000", "Astro", ("37.8", True), ("2.96±0.03", True), ("2.99±0.04", True), "1308±68", ("2.96", True), ("3,385", True)],
        ["5,000", "Next.js", "31.2", "4.03±0.09", "4.35±0.01", ("1031±135", True), "4.03", "4,676"],
        ["10,000", "Astro", ("26.0", True), ("5.67±0.01", True), ("5.70±0.01", True), "2676±103", ("5.67", True), ("6,760", True)],
        ["10,000", "Next.js", "25.0", "7.75±0.01", "8.12±0.01", ("2344±252", True), "7.75", "9,343"],
    ]
    body.append(make_ieee_table(t1_headers, t1_rows, t1_widths, t1_align, group_breaks=[1, 3, 5, 7, 9, 11], cell_sz=13))
    body.append(
        make_para(
            style="tablefootnote",
            runs=[make_run("HTML in kB; best per stage in bold. CLS = 0.000 across all 70 runs; external JS = 0.0 kB (Astro) vs. 350.5 kB (Next.js); DOM = 265–190,085 nodes.", italic=True, sz=13)],
            jc="start",
            no_num=True,
            space_before="20",
            space_after="70",
        )
    )

    p_body([
        "Up to ",
        ("N", {"italic": True}),
        " = 1,000, Astro scored 98.4–100.0, cutting LCP by 39.3%–62.0% over Next.js (0.25 s vs. 0.66 s at ",
        ("N", {"italic": True}),
        " = 10; 0.83 s vs. 1.37 s at ",
        ("N", {"italic": True}),
        " = 1,000) and achieving the lowest Speed Index of all five architectures from ",
        ("N", {"italic": True}),
        " = 50 (0.27 s) to ",
        ("N", {"italic": True}),
        " = 1,000 (0.80 s vs. 1.06 s in Next.js and 1.50 s in Blade SSR [1]).",
    ])
    p_body([
        "Between ",
        ("N", {"italic": True}),
        " = 1,000 and 5,000, scores fell sharply from 98.4/94.0 to 37.8/31.2 as TBT passed 1,000 ms (Fig. 2). At ",
        ("N", {"italic": True}),
        " = 10,000, Astro remained 29.8% faster in LCP than Next.js (5.70 s vs. 8.12 s, Fig. 1; calibrated 6.67 s vs. 9.50 s) with 27.6% less HTML (6,760.2 vs. 9,343.2 kB). Both Jamstack builds reduced TBT by 44.9% (Astro: 2,676 ms) and 51.8% (Next.js: 2,344 ms) relative to Blade SSR (4,860 ms [1]), while CSR retained lower TBT (650–930 ms [1]).",
    ])

    # --- FIG 1: LCP ---
    body.append(make_image_para("rId20", FIG_LCP, width_inches=3.26, doc_pr_id=101, name="ChartLCP"))
    body.append(
        make_para(
            style="figurecaption",
            runs=[make_run("Largest Contentful Paint (LCP) across scaling data loads (N = 10 to 10,000): own Jamstack results (solid) vs. SSR/CSR baselines [1] (dashed).")],
            space_before="20",
            space_after="70",
        )
    )

    # --- FIG 2: TBT ---
    body.append(make_image_para("rId21", FIG_TBT, width_inches=3.26, doc_pr_id=102, name="ChartTBT"))
    body.append(
        make_para(
            style="figurecaption",
            runs=[make_run("Total Blocking Time (TBT) in seconds across scaling data loads (N = 10 to 10,000): own Jamstack results (solid) vs. SSR/CSR baselines [1] (dashed).")],
            space_before="20",
            space_after="70",
        )
    )

    # --- TABLE II: CROSS-STUDY COMPARISON ---
    body.append(make_para(style="tablehead", runs=[make_run("Cross-Study Comparison: Own Results vs. Baselines [1]")], space_before="45", space_after="30", keep_next=True))
    t2_headers = ["N", "Metric", "Astro [Own]", "Next.js [Own]", "Blade [1]", "React [1]", "Vue [1]"]
    t2_widths = [430, 560, 820, 820, 735, 735, 740]  # sum = 4840 dxa
    t2_align = ["end", "start", "end", "end", "end", "end", "end"]
    t2_rows = [
        ["10", "LCP [s]", ("0.25 (0.29*)", True), "0.66 (0.77*)", "0.40", "0.60", "0.50"],
        ["100", "LCP [s]", ("0.28 (0.33*)", True), "0.74 (0.86*)", "0.30", "0.60", "0.60"],
        ["500", "LCP [s]", "0.59 (0.69*)", "0.95 (1.11*)", ("0.40", True), "0.60", "0.80"],
        ["1,000", "LCP [s]", "0.83 (0.97*)", "1.37 (1.60*)", ("0.50", True), "0.80", "0.90"],
        ["5,000", "LCP [s]", "2.99 (3.50*)", "4.35 (5.09*)", ("1.50", True), "1.90", "1.80"],
        ["10,000", "LCP [s]", "5.70 (6.67*)", "8.12 (9.50*)", ("3.10", True), "5.80", "4.90"],
        ["10k", [("S", {"italic": True}), ("N", {"italic": True, "sub": True}), ("(LCP)", {})], "22.80×", "12.34×", ("7.75×", True), "9.67×", "9.80×"],
        ["500", "TBT [ms]", "3", "10", "210", ("0", True), "30"],
        ["1,000", "TBT [ms]", "62", ("60", True), "510", ("60", True), ("60", True)],
        ["5,000", "TBT [ms]", "1,308", "1,031", "1,710", "560", ("480", True)],
        ["10,000", "TBT [ms]", "2,676", "2,344", "4,860", ("650", True), "930"],
    ]
    body.append(make_ieee_table(t2_headers, t2_rows, t2_widths, t2_align, group_breaks=[5, 6], cell_sz=13))
    body.append(
        make_para(
            style="tablefootnote",
            runs=rich_runs([
                ("Best raw value in bold. Asterisk (*) denotes calibrated LCP", {"italic": True}),
                ("*", {"italic": True, "sup": True}),
                (" = 1.170 × LCP", {"italic": True}),
                ("Own", {"italic": True, "sub": True}),
                (" via (2); S", {"italic": True}),
                ("N", {"italic": True, "sub": True}),
                (" = LCP", {"italic": True}),
                ("10k", {"italic": True, "sub": True}),
                (" / LCP", {"italic": True}),
                ("10", {"italic": True, "sub": True}),
                (" via (1). TBT = 0 ms at N ≤ 100.", {"italic": True}),
            ], sz=13),
            jc="start",
            no_num=True,
            space_before="20",
            space_after="70",
        )
    )

    # =========================================================================
    # VI. DISCUSSION AND TECHNICAL ADVICE
    # =========================================================================
    h1("Discussion")

    h2("Interpretation and Literature Triangulation")
    p_body([
        "Four mechanisms explain our empirical trends (Tables I–II, Figs. 1–2). First, ",
        ("Astro Islands dominates typical workloads (N ≤ 1,000)", {"bold": True}),
        ": omitting the 350.5 kB React runtime removes script parsing and hydration latency, extending Lonka's [3] and Mishra ",
        ("et al.", {"italic": True}),
        "'s [4] results up to ~19,000 DOM nodes. Second, payload logs uncover a ",
        ("Next.js RSC Double-Payload Penalty", {"bold": True}),
        ": passing build-time arrays into ",
        ("'use client'", {"italic": True}),
        " serializes every record twice inside one HTML file—as rendered ",
        ("<tr>", {"italic": True}),
        " markup and inline ",
        ("self.__next_f.push(...)", {"italic": True}),
        " chunks—inflating HTML by +38.2% (+2.58 MB) at ",
        ("N", {"italic": True}),
        " = 10,000 and driving Next.js's +2.42 s LCP deficit.",
    ])
    p_body([
        "Third, comparing FCP and LCP exposes ",
        ("the CSR FCP illusion", {"bold": True}),
        ": React and Vue CSR in [1] kept a flat 0.30 s FCP at ",
        ("N", {"italic": True}),
        " = 10,000 because FCP captures only the empty shell, whereas real content paint (LCP) degraded to 5.80 s—slower than Astro (5.70 s, Fig. 1). Fourth, at ",
        ("N", {"italic": True}),
        " ≥ 5,000 (95,075–190,075 nodes), ",
        ("native DOM parsing becomes the universal bottleneck", {"bold": True}),
        ": even with 0.0 kB JS, Astro hit 2,675.5 ms TBT purely from Blink tokenization and table layout (Fig. 2), confirming HTML-first scaling limits [9].",
    ])

    h2("Technical Guidelines for Scalable Web Design")
    p_body([
        ("1) Prefer Islands Architecture up to N ≤ 1,000:", {"bold": True}),
        " Use Astro Islands for content- and table-heavy views up to ~19,000 DOM nodes to sustain CWV compliance (Score ≥ 98.4, LCP ≤ 0.83 s, TBT ≤ 62 ms) and save 39%–62% LCP over full-hydration SSG. ",
        ("2) Enforce a Hard Ceiling of N ≤ 1,000 Rows:", {"bold": True}),
        " Above 1,000 rows, decouple dataset size from DOM size via static pagination (100–500 rows/page) or viewport DOM virtualization (~30 visible rows). ",
        ("3) Avoid the Next.js Double-Payload Anti-Pattern:", {"bold": True}),
        " Never pass large arrays (",
        ("N", {"italic": True}),
        " > 500) across Server-to-Client boundaries; keep tables in pure React Server Components with URL filters or API slicing [12]. ",
        ("4) Pair Static Shells with Async Chunking (N > 5,000):", {"bold": True}),
        " Pre-render 50–100 rows statically (LCP < 0.30 s, TBT = 0 ms) and stream remaining records as compressed JSON into a Web Worker after ",
        ("load", {"italic": True}),
        ".",
    ])

    h2("Threats to Validity and Limitations")
    p_body([
        "Internal validity is high owing to identical datasets, CSS, DOM depth, loopback hosting, and low variance (",
        ("n", {"italic": True}),
        " = 5). Cross-study validity against [1] is bounded by host hardware and markup differences (~19 nodes/row), so conclusions prioritize relative scaling (",
        ("S", {"italic": True}),
        ("N", {"italic": True, "sub": True}),
        ") and calibrated latencies (",
        ("k", {"italic": True}),
        ("hw", {"sub": True}),
        " = 1.170). Finally, local Desktop audits isolate client rendering rather than constrained mobile CPUs or multi-user traffic spikes. Although static Jamstack bundles offload traffic spikes to CDN edges without per-request server computation (unlike SSR), high-concurrency testing (e.g., ",
        ("oha", {"italic": True}),
        " [7]) and mobile-throttled studies remain valuable future work.",
    ])

    # =========================================================================
    # VII. CONCLUSION
    # =========================================================================
    h1("Conclusion")
    p_body([
        "This study evaluated Next.js SSG with full React hydration against Astro's Zero-JS Islands Architecture across 10 to 10,000 records relative to SSR and CSR baselines [1]. Astro outperformed Next.js across all stages in FCP, LCP (by 29.8%–62.0%), and HTML weight (avoiding Next.js's 38.2% double-payload bloat), while both Jamstack architectures achieved zero CLS and cut TBT by over 44% versus monolithic SSR at 10,000 entries. Because native DOM parsing imposes a universal scalability cliff above ",
        ("N", {"italic": True}),
        " = 1,000 rows, pagination, DOM virtualization, and RSC boundary discipline are essential for scalable web design. All prototype source code, dataset generators, Lighthouse runners, and raw CSV/JSON logs are provided in the accompanying repository for full reproducibility.",
    ])

    # =========================================================================
    # REFERENCES (Excluded from 3-page limit -> cleanly starts on Page 4)
    # =========================================================================
    body.append(
        make_para(
            style="Heading5",
            runs=[make_run("References")],
            space_before="80",
            space_after="60",
            keep_next=True,
            page_break_before=True,
        )
    )

    refs = [
        [
            "M. Fahrudin, T. F. Kusumasari, and E. N. Alam, “A performance comparison of frontend rendering strategies in Laravel applications,” in ",
            ("Proc. 9th Int. Conf. Electrical, Electronics and Information Engineering (ICEEIE)", {"italic": True}),
            ", Mataram, Indonesia, 2025, pp. 1–6, doi: 10.1109/ICEEIE66203.2025.11252452.",
        ],
        [
            "S. Yavuz and I. Miladinovic, “Analyse von Rendering-Techniken in Webapplikationen und deren Anwendungsfälle,” Master’s thesis, Univ. of Applied Sciences Campus Vienna (FH Campus Wien), Vienna, Austria, 2023. [Online]. Available: https://pub.hcw.ac.at/obvfcwhsacc/content/titleinfo/8874859/full.pdf",
        ],
        [
            "T. Lonka, “Improving the initial rendering performance of React applications through contemporary rendering approaches,” M.S. thesis, School of Science, Aalto Univ., Espoo, Finland, 2023. [Online]. Available: https://urn.fi/URN:NBN:fi:aalto-202308275116",
        ],
        [
            "D. P. Mishra, K. Muduli, D. S. Sahoo, R. K. Barik, P. Giri, and A. K. Muduli, “Astro’s web architecture: A paradigm shift in performance-optimized web development,” in ",
            ("Proc. Int. Conf. Cognitive, Green and Ubiquitous Computing (IC-CGU)", {"italic": True}),
            ", Bhubaneswar, India, 2025, pp. 1–5, doi: 10.1109/ICCGU67042.2025.11338002.",
        ],
        [
            "M. J. Page ",
            ("et al.", {"italic": True}),
            ", “The PRISMA 2020 statement: An updated guideline for reporting systematic reviews,” ",
            ("BMJ", {"italic": True}),
            ", vol. 372, p. n71, Mar. 2021, doi: 10.1136/bmj.n71.",
        ],
        [
            "N. Shitov, “Comparative analysis of server-side versus client-side rendering,” Bachelor’s thesis, Czech Univ. of Life Sciences Prague, Prague, Czech Republic, 2025. [Online]. Available: https://theses.cz/id/pwzle8/",
        ],
        [
            "Z. Đurić, “Comparative analysis of server-side rendering: React vs. Next.js,” Bachelor’s thesis, Metropolia Univ. of Applied Sciences, Helsinki, Finland, 2025. [Online]. Available: https://urn.fi/URN:NBN:fi:amk-202505089947",
        ],
        [
            "J. Vepsäläinen, M. Hevery, and P. Vuorimaa, “Resumability—A new primitive for developing web applications,” ",
            ("IEEE Access", {"italic": True}),
            ", vol. 12, pp. 9038–9046, 2024, doi: 10.1109/ACCESS.2024.3352891.",
        ],
        [
            "J. Vepsäläinen, “The case for HTML first web development,” ",
            ("J. Web Eng.", {"italic": True}),
            ", vol. 25, no. 5, pp. 797–822, Jul. 2026, doi: 10.13052/jwe1540-9589.2553.",
        ],
        [
            "A. Huotala, M. Luukkainen, and T. Mikkonen, “Benefits and challenges of isomorphism in single-page applications: Case study and review of gray literature,” ",
            ("J. Web Eng.", {"italic": True}),
            ", vol. 21, no. 8, pp. 2363–2403, Nov. 2022, doi: 10.13052/jwe1540-9589.2186.",
        ],
        [
            "T.-C. Huang, C.-F. Liao, and Y. Chen, “Architectural patterns for web front-end rendering,” in ",
            ("Proc. Asian Conf. Pattern Languages of Programs (AsianPLoP)", {"italic": True}),
            ", 2025. [Online]. Available: https://plopcon.org/proceedings/asianplop/2025/papers/sa2.pdf",
        ],
        [
            "M. Savenko and K. Babii, “Performance optimization strategies for large-scale web applications using Next.js,” ",
            ("IEEE Access", {"italic": True}),
            ", vol. 13, pp. 217376–217386, 2025, doi: 10.1109/ACCESS.2025.3647563.",
        ],
    ]

    for ref_segs in refs:
        body.append(
            make_para(
                style="references",
                runs=rich_runs(ref_segs),
                start_ind="354",
                hanging="354",
                space_after="55",
                line="190",
                line_rule="exact",
            )
        )

    body.append(make_sect_pr(cols=2, col_space="18pt", top="54pt", bottom="72pt", left="45.35pt", right="45.35pt", continuous=True))
    return doc


def update_content_types(xml_bytes):
    CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
    ET.register_namespace("", CT_NS)
    root = ET.fromstring(xml_bytes)
    has_png = any(
        el.tag == f"{{{CT_NS}}}Default" and el.attrib.get("Extension") == "png"
        for el in root
    )
    if not has_png:
        el = ET.Element(f"{{{CT_NS}}}Default")
        el.set("Extension", "png")
        el.set("ContentType", "image/png")
        root.insert(0, el)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def update_document_rels(xml_bytes):
    REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
    ET.register_namespace("", REL_NS)
    root = ET.fromstring(xml_bytes)
    for rel in list(root):
        if rel.attrib.get("Id") in {"rId9", "rId10"}:
            root.remove(rel)
    img_type = "http://purl.oclc.org/ooxml/officeDocument/relationships/image"
    for rid, target in [
        ("rId20", "media/chart-lcp.png"),
        ("rId21", "media/chart-tbt.png"),
    ]:
        rel = ET.Element(f"{{{REL_NS}}}Relationship")
        rel.set("Id", rid)
        rel.set("Type", img_type)
        rel.set("Target", target)
        root.append(rel)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def clean_footer_xml():
    ftr = ET.Element(w("ftr"))
    p = ET.SubElement(ftr, w("p"))
    pPr = ET.SubElement(p, w("pPr"))
    ps = ET.SubElement(pPr, w("pStyle"))
    ps.set(w("val"), "Footer")
    return ET.tostring(ftr, encoding="utf-8", xml_declaration=True)


def simulate_pagination(doc_root):
    """Exact Times-New-Roman-metric (LiberationSerif) 2-column IEEE pagination check."""
    font_dir = "/usr/share/fonts/truetype/liberation"
    fonts = {
        (False, False): ImageFont.truetype(f"{font_dir}/LiberationSerif-Regular.ttf", 100),
        (True, False): ImageFont.truetype(f"{font_dir}/LiberationSerif-Bold.ttf", 100),
        (False, True): ImageFont.truetype(f"{font_dir}/LiberationSerif-Italic.ttf", 100),
        (True, True): ImageFont.truetype(f"{font_dir}/LiberationSerif-BoldItalic.ttf", 100),
    }

    def w_pt(txt, pt, b=False, it=False):
        return fonts[(b, it)].getlength(txt) * (pt / 100.0)

    def wrap(txt, col_w, pt, first_ind=0.0, b=False, it=False):
        words = txt.split()
        if not words:
            return 1
        lines = 1
        cur = first_ind
        sp = w_pt(" ", pt, b, it)
        for wd in words:
            ww = w_pt(wd, pt, b, it)
            if cur > (first_ind if lines == 1 else 0.0) and cur + sp + ww > col_w:
                lines += 1
                cur = ww
            else:
                cur = ww if cur == 0.0 else cur + (sp if (cur > first_ind or lines > 1) else 0.0) + ww
        return lines

    body = doc_root.find(w("body"))
    COL_W = 243.3
    title_h = 2 * 28 + 4 + 2 * (4 * 9.5 + 3) + 10  # ~150 pt
    col_heights = [715.9 - title_h, 715.9 - title_h] + [715.9] * 10
    col_idx = 0
    y = 0.0
    in_body = False
    body_words = 0
    ref_words = 0
    in_refs = False
    max_table_wrap = 1

    for el in body:
        tag = el.tag.split("}")[-1]
        if tag == "p":
            if el.find(f"{w('pPr')}/{w('sectPr')}") is not None and not in_body:
                in_body = True
                continue
            if not in_body:
                continue
            ps = el.find(f"{w('pPr')}/{w('pStyle')}")
            st = ps.attrib.get(w("val")) if ps is not None else "Normal"
            txt = "".join(t.text or "" for t in el.findall(f".//{w('t')}"))
            pb = el.find(f"{w('pPr')}/{w('pageBreakBefore')}") is not None
            if pb:
                print(f"  >>> MAIN BODY ENDS: Page {col_idx//2 + 1}, Col {col_idx%2 + 1}, y={y:.1f}/{col_heights[col_idx]:.1f} pt ({y/col_heights[col_idx]*100:.0f}% of column)")
                in_refs = True
                col_idx = ((col_idx // 2) + 1) * 2
                y = 0.0
            if in_refs:
                ref_words += len(txt.split())
            else:
                body_words += len(txt.split())

            if el.find(f".//{w('drawing')}") is not None:
                ext = next((n for n in el.iter() if n.tag.endswith("}extent")), None)
                h = (int(ext.attrib["cy"]) / 914400.0 * 72.0) + 3.0 if ext is not None else 115.0
                if y + h + 26 > col_heights[col_idx]:
                    col_idx += 1
                    y = 0.0
                print(f"  [P{col_idx//2+1}C{col_idx%2+1}] IMAGE h={h:.0f}pt (y={y:.0f}..{y+h:.0f})")
                y += h
                continue

            if st == "Abstract":
                h = wrap(txt, COL_W, 9.0, 13.6, b=True) * 10.6 + 4.5
            elif st == "Keywords":
                h = wrap(txt, COL_W, 9.0, 13.7, b=True, it=True) * 10.6 + 4.0
            elif st == "Heading1":
                h = 12.0 + 7.5
            elif st == "Heading2":
                h = 11.2 + 5.3
            elif st == "Heading5":
                h = 12.0 + 7.0
            elif st == "equation":
                h = 15.0
            elif st == "tablehead":
                h = 13.0
            elif st == "tablefootnote":
                h = wrap(txt, COL_W, 6.5, 0.0, it=True) * 7.8 + 4.5
            elif st == "figurecaption":
                h = wrap("Fig. 1. " + txt, COL_W, 8.0, 0.0) * 9.5 + 4.5
            elif st == "references":
                h = wrap("[12] " + txt, COL_W - 17.7, 8.0, 0.0) * 9.5 + 2.75
            else:
                h = wrap(txt, COL_W, 10.0, 14.4) * 11.1 + 3.5

            if y + h > col_heights[col_idx]:
                col_idx += 1
                y = 0.0
            if st in {"Heading1", "Heading2", "Heading5", "tablehead"}:
                print(f"  [P{col_idx//2+1}C{col_idx%2+1}] {st}: {txt[:48]} (y={y:.0f})")
            y += h
        elif tag == "tbl" and in_body:
            rows = el.findall(w("tr"))
            tbl_h = 0.0
            for ri, tr in enumerate(rows):
                ml = 1
                for tc in tr.findall(w("tc")):
                    tcW = tc.find(f"{w('tcPr')}/{w('tcW')}")
                    cw = int(tcW.attrib[w("w")]) / 20.0 - 2.0
                    ctxt = "".join(t.text or "" for t in tc.findall(f".//{w('t')}"))
                    ml = max(ml, wrap(ctxt, cw, 6.5, 0.0, b=(ri == 0)))
                max_table_wrap = max(max_table_wrap, ml)
                tbl_h += ml * 8.0 + 1.8
            if y + tbl_h > col_heights[col_idx]:
                col_idx += 1
                y = 0.0
            print(f"  [P{col_idx//2+1}C{col_idx%2+1}] TABLE ({len(rows)} rows, h={tbl_h:.0f}pt) y={y:.0f}..{y+tbl_h:.0f}")
            y += tbl_h

    print(f"  >>> REFERENCES END: Page {col_idx//2 + 1}, Col {col_idx%2 + 1}, y={y:.1f}/{col_heights[col_idx]:.1f} pt")
    print(f"  >>> Main body words: {body_words} | Reference words: {ref_words} | Max table cell lines: {max_table_wrap}")


def main():
    doc_root = build_document_xml()
    simulate_pagination(doc_root)
    doc_xml_bytes = ET.tostring(doc_root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(TEMPLATE_PATH, "r") as zin, zipfile.ZipFile(OUTPUT_PATH, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "word/document.xml":
                data = doc_xml_bytes
            elif item.filename == "[Content_Types].xml":
                data = update_content_types(data)
            elif item.filename == "word/_rels/document.xml.rels":
                data = update_document_rels(data)
            elif item.filename == "word/footer1.xml":
                data = clean_footer_xml()
            zout.writestr(item, data)

        zout.write(FIG_LCP, "word/media/chart-lcp.png")
        zout.write(FIG_TBT, "word/media/chart-tbt.png")

    print(f"Successfully generated: {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size / 1024:.1f} kB)")


if __name__ == "__main__":
    main()
