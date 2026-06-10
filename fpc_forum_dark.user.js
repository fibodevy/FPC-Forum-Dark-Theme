// ==UserScript==
// @name         FPC Forum Dark (theme + Pascal highlighter)
// @namespace    https://forum.lazarus.freepascal.org/
// @version      4.0.26
// @description  All-in-one: the combined FPC / Lazarus dark theme (curve base + manual overrides) AND the Unleashed-aware Pascal syntax highlighter, bundled into a single userscript. The two parts are fully independent IIFEs separated by the banner below.
// @author       Fibonacci
// @match        https://forum.lazarus.freepascal.org/*
// @run-at       document-start
// @grant        none
// @updateURL    https://fibo.gg/userscript/fpc_forum_dark.user.js
// @downloadURL  https://fibo.gg/userscript/fpc_forum_dark.user.js
// ==/UserScript==

// ============================================================================
// ============================================================================
// ===  PART 1 / 2 :  FORUM DARK THEME  (palette-driven, SMF curve)
// ============================================================================
// ============================================================================

(function () {
  'use strict';

  // ==================================================================
  // PALETTE
  // ==================================================================
  const PALETTE = '0d1b2a-1b263b-415a77-778da9-e0e1dd';

  const hexes0 = (PALETTE.match(/[0-9a-fA-F]{6}/g) || []).map(h => '#' + h.toLowerCase());
  if (hexes0.length < 2) { console.warn('[FPC Theme 3] need >= 2 colors'); return; }

  const toRgb = h => { h = h.replace('#', ''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; };
  const lumi = h => { const [r,g,b] = toRgb(h).map(c => { c/=255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }); return 0.2126*r + 0.7152*g + 0.0722*b; };
  const sorted = [...hexes0].sort((a,b) => lumi(a) - lumi(b)); // dark -> light
  const slot = i => sorted.length === 5 ? sorted[i] : sorted[Math.round((i/4)*(sorted.length-1))];

  // shared color helpers
  const rgba = (h,a) => { const [r,g,b] = toRgb(h); return `rgba(${r},${g},${b},${a})`; };
  const mix  = (h,t) => { const [r,g,b] = toRgb(h); const f = c => Math.round(c+(255-c)*t); return `rgb(${f(r)},${f(g)},${f(b)})`; };
  const dark = (h,t) => { const [r,g,b] = toRgb(h); const f = c => Math.round(c*(1-t)); return `rgb(${f(r)},${f(g)},${f(b)})`; };
  const brighten = mix; // theme-1 alias

  // role colors (both themes map slot 0..4 the same way)
  const C_BG = slot(0), C_SURFACE = slot(1), C_BAR = slot(2), C_ACCENT = slot(3), C_TEXT = slot(4);
  const bg = C_BG, surface = C_SURFACE, surface2 = C_BAR, accent = C_ACCENT, text = C_TEXT;

  // theme-2 CSS custom properties
  const V = {
    '--bg':        C_BG,
    '--surface':   C_SURFACE,
    '--surface2':  mix(C_SURFACE, 0.05),
    '--surface3':  mix(C_SURFACE, 0.10),
    '--bar':       C_BAR,
    '--bar2':      dark(C_BAR, 0.18),
    '--accent':    C_ACCENT,
    '--text':      C_TEXT,
    '--dim':       rgba(C_TEXT, 0.65),
    '--faint':     rgba(C_TEXT, 0.40),
    '--link':      mix(C_ACCENT, 0.35),
    '--border':    rgba(C_TEXT, 0.12),
    '--border2':   rgba(C_TEXT, 0.22),
    '--sticky':    rgba(C_ACCENT, 0.18),
    '--code-bg':   mix(C_TEXT, 0.25),
    '--code-fg':   C_BG,
    '--radius':    '5px',
    '--err-bg':    dark('#ff3355', 0.55),
  };

  console.log('[FPC Theme 3] dark->light:', sorted, '| roles', {C_BG,C_SURFACE,C_BAR,C_ACCENT,C_TEXT});

  // ==================================================================
  // LAYER 1 (BASE) — SMF curve, mapped against real index.css
  // ==================================================================
  const CSS_BASE = `
:root {
${Object.entries(V).map(([k,v]) => `  ${k}: ${v};`).join('\n')}
}

/* ---- kill every curve sprite (backdrop / main_block / menu_gfx /
   frame_repeat / submit_bg / quickbuttons / quote / loadingbar) ---- */
body,
#header, #header div.frame, #content_section, #content_section div.frame,
.button_submit, .button_reset,
div.cat_bar, div.title_bar, div.title_barIC,
.cat_bar h3, .catbg, .catbg h3, .catbg2, .catbg2 h3,
h3.catbg, h4.catbg, h3.catbg2, h4.catbg2,
.titlebg, .titlebg h3, .titlebg h4, h3.titlebg, h4.titlebg, .titlebg2, .titlebg2 h3,
div.roundframe div.cat_bar, div.roundframe div.cat_bar h3.catbg,
.table_list tbody.header td.catbg,
tr.catbg th.first_th, tr.catbg th.last_th, tr.titlebg th.first_th, tr.titlebg th.last_th,
.windowbg .titlebg, .windowbg2 .titlebg,
.windowbg .titlebg h3, .windowbg2 .titlebg h3,
.roundframe, span.upperframe, span.upperframe span,
span.lowerframe, span.lowerframe span,
.windowbg span.topslice, .windowbg span.topslice span,
.windowbg span.botslice, .windowbg span.botslice span,
.windowbg2 span.topslice, .windowbg2 span.topslice span,
.windowbg2 span.botslice, .windowbg2 span.botslice span,
.windowbg3 span.topslice, .windowbg3 span.topslice span,
.windowbg3 span.botslice, .windowbg3 span.botslice span,
.approvebg span.topslice, .approvebg span.topslice span,
.approvebg span.botslice, .approvebg span.botslice span,
.dropmenu li ul, .dropmenu a.firstlevel, .dropmenu span.firstlevel,
.dropmenu li li a, blockquote, code.bbc_code, .openid_login,
#ajax_in_progress, .progress_bar, .codeheader, .quoteheader,
.quickbuttons, .quickbuttons li a, ul.quickbuttons li a,
.buttonlist li a, .buttonlist li a span,
.buttonlist li a:hover, .buttonlist li a:hover span,
.buttonlist li.active a, .buttonlist li.active a span,
.tp_half, .tp_half h3, .tp_half h4,
.tp_leftblock_frame .titlebg, .tp_rightblock_frame .titlebg {
  background-image: none !important;
}

/* ---- white frame backgrounds (the bottom/edge white) ---- */
#content_section, #content_section div.frame,
#header div.frame, #main_content_section {
  background: transparent !important;
  background-color: transparent !important;
  padding-left: 0 !important;
}

/* ---- base ---- */
html, body, body#forumpage {
  background: var(--bg) !important;
  color: var(--text) !important;
}
body, td, th, tr { color: var(--text) !important; }
div#wrapper { background: var(--bg) !important; }
.smalltext, .middletext, tr.smalltext th { color: var(--dim) !important; }
h1, h2, h3, h4, h5, h6 { color: var(--text) !important; }
hr, .hrcolor {
  color: var(--border) !important;
  background-color: var(--border) !important;
  background: var(--border) !important;
  border: 0 !important;
  height: 1px !important;
}
fieldset { border: 1px solid var(--border) !important; }
fieldset legend { color: var(--text) !important; }

/* ---- links ---- */
a:link, a:visited, a.new_win:link, a.new_win:visited { color: var(--link) !important; }
a:hover { color: var(--text) !important; }
a.bbc_link { border-bottom: none !important; }

/* ---- inputs / selects / textareas ---- */
input, button, select, textarea,
input.input_text {
  color: var(--text) !important;
  background: var(--bg) !important;
  border: 1px solid var(--border2) !important;
}
input.input_check, input.input_radio { border: none !important; background: none !important; }
input[disabled].input_text { background-color: var(--surface2) !important; color: var(--dim) !important; }
select { background: var(--bar) !important; }
select option { background: var(--bar) !important; color: var(--text) !important; }
input:hover, textarea:hover, button:hover, select:hover { border-color: var(--accent) !important; }
input:focus, textarea:focus, button:focus, select:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 2px ${rgba(C_ACCENT, 0.3)} !important;
}
input[type=file]::file-selector-button, input[type=file]::-webkit-file-upload-button {
  background: var(--bar) !important; color: var(--text) !important;
  border: 1px solid var(--border2) !important; border-radius: 4px !important;
  padding: 4px 10px !important; margin-right: 8px !important; cursor: pointer !important;
}

/* ---- buttons (curve .button_submit / .button_reset + html buttons) ---- */
.button_submit, .button_reset, .button,
input[type=submit], input[type=button], input[type=reset], button[type=submit], button[type=button] {
  background: var(--bar) !important;
  color: var(--text) !important;
  border: 1px solid var(--border2) !important;
  border-radius: 4px !important;
  padding: 4px 12px !important;
  font-weight: normal !important;
  cursor: pointer !important;
  text-shadow: none !important;
  box-shadow: none !important;
}
.button_submit:hover, .button_reset:hover, .button:hover,
input[type=submit]:hover, input[type=button]:hover, button:hover {
  background: var(--accent) !important;
  color: var(--bg) !important;
  border-color: var(--accent) !important;
}

/* ---- buttonlist buttons (REPLY / ADD BOOKMARK / ...) ---- */
.buttonlist li { margin: 0 3px !important; }
.buttonlist li a {
  float: none !important;
  display: inline-block !important;
  padding: 0 !important;
  background: var(--bar) !important;
  color: var(--text) !important;
  border: 1px solid var(--border2) !important;
  border-radius: 4px !important;
}
.buttonlist li a span {
  display: inline-block !important;
  background: none !important;
  color: var(--text) !important;
  padding: 4px 12px !important;
  height: auto !important;
  line-height: 1.4 !important;
}
.buttonlist li a:hover, .buttonlist li a:hover span,
.buttonlist li.active a, .buttonlist li.active a span {
  background: var(--accent) !important;
  color: var(--bg) !important;
}
.buttonlist li a:hover { border-color: var(--accent) !important; }

/* ---- header ---- */
#header {
  background: var(--bar) !important;
  color: var(--text) !important;
  border: none !important;
  border-radius: var(--radius) !important;
}
#header > .frame, #top_section { background: transparent !important; }
.forumtitle, .forumtitle a, h1.forumtitle, h1.forumtitle a {
  color: var(--text) !important;
  background: none !important;
  line-height: normal !important;
}
h1.forumtitle { display: flex !important; align-items: center !important; padding: 12px 0 !important; margin: 0 !important; }

/* ---- main menu / dropmenu ---- */
#main_menu { background: transparent !important; }
.dropmenu { background: transparent !important; }
.dropmenu li { background: none !important; border: none !important; }
.dropmenu a.firstlevel, .dropmenu span.firstlevel,
.dropmenu li a {
  background: transparent !important;
  color: var(--text) !important;
  border: none !important;
}
.dropmenu li:hover > a, .dropmenu a.active, .dropmenu li a:hover {
  background: var(--bar) !important;
  color: var(--text) !important;
}
.dropmenu li ul {
  background: var(--bar) !important;
  border: 1px solid var(--border2) !important;
  border-bottom: 1px solid var(--border2) !important;
  border-radius: 0 0 var(--radius) var(--radius) !important;
}
.dropmenu li li { border-left-color: var(--border2) !important; border-right-color: var(--border2) !important; }
.dropmenu li ul li { width: 100% !important; }
.dropmenu li ul li a {
  background: var(--bar) !important;
  color: var(--text) !important;
  width: auto !important;
}
.dropmenu li ul li a:hover { background: var(--accent) !important; color: var(--bg) !important; }

/* ---- cat_bar / catbg / titlebg / titlebg2 / catbg2 ---- */
.cat_bar, .cat_bar h3,
.catbg, .catbg h3, .catbg2, .catbg2 h3,
.titlebg, .titlebg h3, .titlebg h4, .titlebg2, .titlebg2 h3,
.windowbg .titlebg, .windowbg2 .titlebg,
.windowbg .titlebg h3, .windowbg2 .titlebg h3,
.table_grid .catbg, .table_grid .titlebg {
  background: var(--bar) !important;
  color: var(--text) !important;
}
h3.catbg, h3.catbg a, h4.catbg, h4.catbg a,
.catbg, .catbg a, .catbg2, .catbg2 a, .catbg2 a:link, .catbg2 a:visited,
.titlebg, .titlebg a, .titlebg a:link, .titlebg a:hover, .titlebg a:visited,
.titlebg2, .titlebg2 a {
  color: var(--text) !important;
}

/* ---- windowbg variants ---- */
.windowbg, #preview_body { background-color: var(--surface)  !important; color: var(--text) !important; }
.windowbg2 { background-color: var(--surface2) !important; color: var(--text) !important; padding-top: 10px !important; }
.windowbg3 { background-color: var(--surface3) !important; color: var(--text) !important; }
.highlight2 { background-color: var(--surface3) !important; color: var(--text) !important; }
.table_grid tr.catbg, .table_grid tr.titlebg { border-bottom-color: var(--border) !important; }

/* the rounded-corner slices wrapping each post */
.windowbg span.topslice, .windowbg span.botslice,
.windowbg2 span.topslice, .windowbg2 span.botslice,
.windowbg3 span.topslice, .windowbg3 span.botslice,
.windowbg span.topslice span, .windowbg span.botslice span,
.windowbg2 span.topslice span, .windowbg2 span.botslice span,
.windowbg3 span.topslice span, .windowbg3 span.botslice span,
.approvebg span.topslice, .approvebg span.botslice,
.approvebg span.topslice span, .approvebg span.botslice span {
  background: transparent !important;
  height: 0 !important;
  padding: 0 !important;
}

/* approval / sticky / locked rows */
.approvebg, .approvebg2 { background-color: ${rgba('#ff3355', 0.12)} !important; color: var(--text) !important; }
.approvetbg, .approvetbg2 { background-color: ${rgba('#ff8844', 0.18)} !important; color: var(--text) !important; }
.stickybg, .stickybg2, .lockedbg, .lockedbg2 { background: var(--sticky) !important; }

/* ---- borders / frames ---- */
.bordercolor { background-color: var(--border) !important; }
.table_grid { background-color: var(--surface) !important; }
.table_grid td { border-bottom: 1px solid var(--border) !important; border-right: 1px solid var(--border) !important; }
.plainbox { background: var(--surface) !important; border: 1px solid var(--border) !important; }
.roundframe {
  background: var(--surface) !important;
  border-color: var(--border) !important;
  border-radius: var(--radius) !important;
}
.roundframe .upperframe, .upperframe span, .lowerframe, .lowerframe span { background: none !important; height: 0 !important; }
.information { background: var(--surface2) !important; color: var(--dim) !important; border: 1px solid var(--border) !important; }

/* ---- tables: board index / message index ---- */
table.table_list { background: transparent !important; }
a.subject { color: var(--link) !important; font-weight: bold; }
a.subject:hover { color: var(--text) !important; }
tbody.divider td { background: transparent !important; border: none !important; }
#messageindex, #topic_icons.tborder { border: 1px solid var(--border) !important; border-radius: var(--radius) !important; }

/* ---- posts ---- */
.post_wrapper, .postarea, .post, .inner, .keyinfo, .keyinfo h5 {
  background: transparent !important;
  color: var(--text) !important;
}
.post_wrapper .postarea .inner, .inner { border-top: 1px solid rgba(255,255,255,0.15) !important; }
.postarea { padding-top: 2px !important; }
.poster, .poster h4 a { color: var(--text) !important; }
.poster li, .poster .membergroup, .poster .title, .poster .postgroup { color: var(--dim) !important; }
.poster h4 a, .poster h4 a:link { color: ${mix(C_ACCENT, 0.35)} !important; }
.moderatorbar, .signature, .attachments { border-color: var(--border) !important; color: var(--dim) !important; }
.reportlinks img { display: none !important; }

/* ---- quotes & code ---- */
.quoteheader, .codeheader {
  background: var(--bar) !important;
  color: var(--text) !important;
  font-size: inherit !important;
}
.quoteheader a, .codeheader a { color: var(--text) !important; }
.codeheader { padding: 5px !important; border-radius: var(--radius) var(--radius) 0 0 !important; }
.quoteheader { padding: 4px 8px !important; border-radius: var(--radius) var(--radius) 0 0 !important; }
blockquote, blockquote.bbc_standard_quote, blockquote.bbc_alternate_quote {
  background: ${rgba(C_TEXT, 0.07)} !important;
  color: var(--text) !important;
  border: none !important;
  border-radius: 0 0 var(--radius) var(--radius) !important;
  font-size: inherit !important;
}
code, code.bbc_code, .bbc_code, div.geshi, pre.bbc_code {
  background: var(--code-bg) !important;
  color: var(--code-fg) !important;
  border: 1px solid var(--border2) !important;
  border-radius: var(--radius) !important;
}
div.geshi { width: auto !important; margin: 0 !important; }
div.geshi ol, div.geshi li, div.geshi li > div { background: transparent !important; color: var(--code-fg) !important; border-color: ${rgba(C_BG, 0.1)} !important; }

/* ---- errors / approval boxes ---- */
.errorbox, #errors {
  background: var(--err-bg) !important;
  background-color: var(--err-bg) !important;
  border: 1px solid ${rgba('#ff3355', 0.6)} !important;
  color: #fff !important;
  border-radius: var(--radius) !important;
}
.errorbox a, #errors a, .error { color: #fff !important; }

/* ---- pagination ---- */
.pagelinks a, .navPages, a.navPages {
  background: var(--surface) !important;
  color: var(--link) !important;
  border: 1px solid var(--border) !important;
  border-radius: 3px !important;
  padding: 2px 6px !important;
}
.pagelinks strong, .current_page {
  background: var(--accent) !important;
  color: var(--bg) !important;
  border-radius: 3px !important;
  padding: 2px 6px !important;
}

/* ---- breadcrumbs / navigate ---- */
.navigate_section, .navigate_section ul, .navigate_section li {
  background: transparent !important;
  color: var(--dim) !important;
  border-color: var(--border) !important;
}
.navigate_section a { color: var(--link) !important; }

/* ---- jump-to / legend ---- */
#display_jump_to, #topic_icons, #topic_icons .description {
  background: transparent !important;
  color: var(--text) !important;
}

/* ---- TinyPortal sidebar blocks ---- */
.tp_leftblock_frame, .tp_rightblock_frame,
.tp_leftblock_noframe, .tp_rightblock_noframe,
div#block_recentbox, div#tpleftbarContainer > div > div {
  background: var(--surface) !important;
  border: none !important;
  border-radius: var(--radius) !important;
}
.tp_catmenu_header, a.tp_catmenu_header { background: var(--bar) !important; color: var(--text) !important; }
ul.tp_catmenu, ul.recent_topics { background: transparent !important; }
ul.recent_topics > li { border-color: var(--border) !important; }
#tpbottombarHeader, #tpbottombarHeader .blockbody { background: transparent !important; border: none !important; }
.tp_half, .tp_half h3, .tp_half h4 {
  background: var(--bar) !important;
  padding-right: 0 !important;
}
div.tp_half { border-radius: 3px 3px 0 0 !important; }
.titlebg .l, .titlebg .r, .catbg .l, .catbg .r,
.tp_half .l, .tp_half .r, .tp_half h3 .l, .tp_half h3 .r,
.tp_leftblock_frame .l, .tp_leftblock_frame .r,
.tp_rightblock_frame .l, .tp_rightblock_frame .r {
  display: none !important;
}

/* ---- footer ---- */
#footer_section, #footer_section .frame {
  background: transparent !important;
  color: var(--dim) !important;
  border-top: 1px solid var(--border) !important;
}
#footer_section a { color: var(--link) !important; }

/* ---- icons sitting on dark bars ---- */
.cat_bar img, .catbg img, .titlebg img, .table_grid thead img, .dropmenu img {
  filter: brightness(0) invert(0.85) !important;
}
`;

  // ==================================================================
  // LAYER 2 (OVERRIDE) — hand-tuned theme-1 rules; injected after BASE
  // so it wins on equal specificity.
  // ==================================================================
  const CSS_OVERRIDE = `
    /* ================= base ================= */
    html, body, body#forumpage {
      background: ${bg} !important;
      color: ${text} !important;
    }
    #wrapper, #content_section, #main_content_section, .frame {
      background: transparent !important;
      color: ${text} !important;
    }

    /* ================= text / links ================= */
    p, td, li, div, span, h1, h2, h3, h4, h5, h6, strong, b, em, i, label {
      color: inherit;
    }
    a, a:link, a:visited {
      color: ${brighten(accent, 0.35)} !important;
    }
    a:hover {
      color: ${text} !important;
    }
    a.bbc_link,
    a.bbc_link:link,
    a.bbc_link:visited,
    a.bbc_link:hover,
    a.bbc_link:active,
    body a.bbc_link,
    body a.bbc_link:link,
    body a.bbc_link:visited,
    html body a.bbc_link,
    html body a.bbc_link:link,
    html body a.bbc_link:visited {
      border-bottom: none !important;
      border-bottom-style: none !important;
      border-bottom-width: 0 !important;
      border-bottom-color: transparent !important;
      text-decoration: none !important;
    }
    .smalltext, .smalltext a, .middletext {
      color: ${rgba(text, 0.7)} !important;
    }
    hr {
      background: rgba(224, 225, 221, 0.16) !important;
      background-color: rgba(224, 225, 221, 0.16) !important;
      border: none !important;
      color: rgba(224, 225, 221, 0.16) !important;
      height: 1px !important;
    }

    /* ================= header banner ================= */
    #header, div#header {
      background: ${surface2} !important;
      color: ${text} !important;
      border: none !important;
      border-radius: 5px !important;
      background-image: none !important;
    }
    #header a, .forumtitle, .forumtitle a, h1.forumtitle a {
      color: ${text} !important;
    }
    #top_section { background: transparent !important; }
    div#top_section > h1.forumtitle,
    div#header h1.forumtitle,
    #header h1.forumtitle {
      line-height: normal !important;
      display: flex !important;
      align-items: center !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* ================= main menu (dropmenu) ================= */
    #main_menu, .dropmenu_wrap { background: transparent !important; }
    ul.dropmenu, .dropmenu {
      background: ${surface} !important;
      border: 1px solid ${surface2} !important;
      background-image: none !important;
    }
    .dropmenu li { background: transparent !important; border: none !important; }
    .dropmenu > li > a,
    .dropmenu a.firstlevel,
    .dropmenu span.firstlevel {
      color: ${text} !important;
      background: transparent !important;
      background-image: none !important;
      border: none !important;
    }
    .dropmenu > li > a:hover,
    .dropmenu > li:hover > a,
    .dropmenu a.active {
      background: ${surface2} !important;
      color: ${text} !important;
    }
    .dropmenu li ul {
      background: ${surface2} !important;
      border: 1px solid ${accent} !important;
    }
    .dropmenu li ul a { color: ${text} !important; }
    .dropmenu li ul a:hover { background: ${accent} !important; color: ${bg} !important; }
    ul#menu_nav > li > ul > li,
    body ul#menu_nav > li > ul > li {
      width: 100% !important;
    }

    /* ================= blocks / panels ================= */
    .tborder,
    .tp_leftblock_frame, .tp_rightblock_frame,
    .tp_leftblock_noframe, .tp_rightblock_noframe,
    .tp_leftblock, .tp_rightblock {
      background: ${surface} !important;
      border: 1px solid ${surface2} !important;
      background-image: none !important;
    }
    div.tborder.tp_rightblock_frame {
      border: none !important;
    }
    .tp_leftblock_body, .tp_rightblock_body,
    .blockbody {
      background: ${surface} !important;
      color: ${text} !important;
    }
    .botslice, .topslice, .botslice span, .topslice span {
      background: transparent !important;
      background-image: none !important;
    }

    /* ================= category / title bars ================= */
    .catbg, h3.catbg, h4.catbg,
    .titlebg, h3.titlebg, h4.titlebg,
    .cat_bar,
    .catbg_grey, .table_list .catbg {
      background: ${surface2} !important;
      color: ${text} !important;
      border: none !important;
      background-image: none !important;
    }
    body h3.titlebg, body h4.titlebg,
    body div.tp_half > h3.titlebg,
    body div#tpleftbarHeader h3.titlebg,
    body div#tprightbarHeader h3.titlebg,
    body div#tpbottombarHeader h3.titlebg {
      display: block !important;
      line-height: normal !important;
      height: auto !important;
      padding: 8px !important;
      margin-top: 5px !important;
      background: ${brighten(bg, 0.1)} !important;
      background-color: ${brighten(bg, 0.1)} !important;
    }
    body h3.titlebg > .header,
    body div.tp_half > h3.titlebg > .header {
      margin-left: 10px !important;
    }
    body h3.titlebg > span,
    body h3.titlebg > a,
    body h4.titlebg > span,
    body h4.titlebg > a,
    body div.tp_half > h3.titlebg > span,
    body div.tp_half > h3.titlebg > a,
    body div#tpleftbarHeader h3.titlebg > span,
    body div#tpleftbarHeader h3.titlebg > a,
    body div#tprightbarHeader h3.titlebg > span,
    body div#tprightbarHeader h3.titlebg > a {
      display: inline-block !important;
      vertical-align: middle !important;
      float: none !important;
      position: static !important;
      margin: 0 !important;
    }
    body h3.titlebg > a,
    body h4.titlebg > a,
    body div.tp_half > h3.titlebg > a {
      margin-right: 5px !important;
    }
    h3.titlebg > a > div,
    h4.titlebg > a > div,
    div.tp_half h3.titlebg > a > div {
      margin-right: 10px !important;
    }
    h3.titlebg > a > img,
    h4.titlebg > a > img,
    div.tp_half > h3.titlebg > a > img {
      margin: 0 !important;
    }
    h3.catbg, h4.catbg {
      border: none !important;
    }
    h3.catbg > a {
      margin: 6px 0 0 10px !important;
    }
    /* category bar — no border */
    div.cat_bar {
      border: none !important;
    }
    /* title_barIC (info-center header bar) — drop curve's fixed sizing */
    div.title_barIC {
      background: none !important;
      padding-left: 0 !important;
      height: auto !important;
      margin-bottom: 0 !important;
    }
    /* collapse toggle + unread link in a category header */
    h3.catbg > .collapse,
    h3.catbg > .unreadlink {
      margin-top: 0px !important;
    }
    h3.catbg > .collapse > .fpc-toggle-marker {
      margin-top: 5px !important;
    }
    tbody > tr > td > div > h1.catbg {
      border: none !important;
    }
    div.tp_rightblock_frame > .tp_half > h3.titlebg,
    .tborder.tp_rightblock_frame > .tp_half > .titlebg {
      padding: 0 !important;
    }
    .tp_rightblock_body {
      background: none !important;
    }
    .tp_rightblock_body .blockbody {
      padding: 0 !important;
    }
    .tp_rightblock_body > div:first-child {
      padding-top: 0 !important;
    }
    #block25 > .windowbg2 {
      background: none !important;
    }
    .titlebg > .l, .titlebg > .r,
    .catbg > .l, .catbg > .r {
      display: none !important;
      background-image: none !important;
    }
    .catbg a, .titlebg a, .cat_bar a,
    .catbg span, .titlebg span, .cat_bar span,
    h3.catbg a, h4.titlebg a {
      color: ${text} !important;
    }

    /* TinyPortal category menu headers */
    .tp_catmenu_header, a.tp_catmenu_header,
    li.tp_catmenu_header {
      background: ${surface2} !important;
      color: ${text} !important;
      background-image: none !important;
    }
    ul.tp_catmenu {
      background: ${surface} !important;
    }
    ul.tp_catmenu li {
      background: transparent !important;
      color: ${text} !important;
    }
    ul.tp_catmenu li a { color: ${accent} !important; }
    ul.tp_catmenu li a:hover { color: ${text} !important; }

    /* ================= windowbg rows ================= */
    .windowbg, tr.windowbg, td.windowbg,
    .windowbg2, tr.windowbg2, td.windowbg2,
    .windowbg3, tr.windowbg3, td.windowbg3 {
      background: ${surface} !important;
      color: ${text} !important;
      background-image: none !important;
    }
    .windowbg2 .windowbg, .windowbg .windowbg2 {
      background: ${surface} !important;
    }
    /* windowbg2 — surface lightened 3% */
    .windowbg2, tr.windowbg2, td.windowbg2, tr.windowbg2 td {
      background: ${brighten(surface, 0.03)} !important;
      background-color: ${brighten(surface, 0.03)} !important;
    }

    /* ================= board list table ================= */
    table.table_list {
      background: transparent !important;
      border-collapse: collapse !important;
      border: none !important;
    }
    table.table_list td {
      border-top: 1px solid ${rgba(text, 0.06)} !important;
      color: ${text} !important;
    }
    tbody.content tr td {
      background: ${surface} !important;
    }
    tbody.content tr.windowbg2 td {
      background: ${rgba(text, 0.025)} !important;
    }
    table.table_list a.subject,
    .info a.subject {
      color: ${accent} !important;
      font-weight: bold;
    }
    table.table_list a.subject:hover {
      color: ${text} !important;
    }
    tbody.divider td {
      background: transparent !important;
      border: none !important;
    }

    /* ================= navigate section (breadcrumb) ================= */
    .navigate_section, .navigate_section ul, .navigate_section li {
      background: transparent !important;
      color: ${text} !important;
    }
    .navigate_section a { color: ${accent} !important; }

    /* ================= inputs / buttons ================= */
    input[type=text], input[type=password], input[type=email],
    input[type=search], input[type=number], input[type=url],
    textarea, input.input_text {
      background: ${bg} !important;
      color: ${text} !important;
      border: 1px solid ${surface2} !important;
    }
    input[type=file] {
      background: ${bg} !important;
      color: ${text} !important;
      border: 1px solid ${surface2} !important;
      border-radius: 4px !important;
      padding: 4px !important;
      font: inherit !important;
    }
    input[type=file]::file-selector-button,
    input[type=file]::-webkit-file-upload-button {
      background: ${surface2} !important;
      background-image: none !important;
      color: ${text} !important;
      border: 1px solid ${rgba(text, 0.2)} !important;
      border-radius: 4px !important;
      padding: 5px 12px !important;
      margin-right: 8px !important;
      font: inherit !important;
      cursor: pointer !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }
    input[type=file]::file-selector-button:hover,
    input[type=file]::-webkit-file-upload-button:hover {
      background: ${accent} !important;
      color: ${bg} !important;
      border-color: ${accent} !important;
    }
    input[type=submit], input[type=button], input[type=reset],
    input.button, button, .button {
      display: inline-block !important;
      background: ${surface2} !important;
      background-image: none !important;
      color: ${text} !important;
      border: 1px solid ${rgba(text, 0.2)} !important;
      border-radius: 4px !important;
      padding: 5px 12px !important;
      margin: 0 2px !important;
      height: auto !important;
      line-height: 1.3 !important;
      font: inherit !important;
      font-weight: normal !important;
      text-decoration: none !important;
      text-shadow: none !important;
      box-shadow: none !important;
      cursor: pointer !important;
      outline: none !important;
    }
    input[type=submit]:hover, input[type=button]:hover, input[type=reset]:hover,
    input.button:hover, button:hover, .button:hover {
      background: ${accent} !important;
      color: ${bg} !important;
      border-color: ${accent} !important;
    }
    input[type=submit]:focus, input[type=button]:focus, input[type=reset]:focus,
    input.button:focus, button:focus, .button:focus {
      border-color: ${accent} !important;
      box-shadow: 0 0 0 2px ${rgba(accent, 0.3)} !important;
    }

    /* ================= footer ================= */
    #footer_section,
    div#footer_section {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      color: ${rgba(text, 0.7)} !important;
      border-top: 1px solid ${rgba(text, 0.08)} !important;
    }
    #footer_section a { color: ${accent} !important; }
    #footer_section a:hover { color: ${text} !important; }

    div#tpbottombarHeader,
    div#tpbottombarHeader div.blockbody,
    div#tpbottombarHeader .tp_bottomblock_noframe,
    div#tpbottombarHeader .tp_bottomblock_noframe > div {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: none !important;
    }

    /* ================= images in bars (icons) ================= */
    .cat_bar img, .catbg img, .titlebg img,
    .tp_leftblock_frame .titlebg img,
    .tp_rightblock_frame .titlebg img {
      filter: invert(0.9) brightness(1.5) !important;
    }

    /* Code / pre */
    pre, code {
      background: ${bg} !important;
      color: ${text} !important;
      border: 1px solid ${surface2} !important;
    }

    /* ================= quote blocks ================= */
    blockquote.bbc_standard_quote,
    blockquote.bbc_alternate_quote,
    blockquote {
      background: ${rgba(text, 0.08)} !important;
      background-color: ${rgba(text, 0.08)} !important;
      color: ${text} !important;
      border: none !important;
      border-radius: 0 !important;
      margin: 0 !important;
      font-size: inherit !important;
    }
    .quoteheader, .codeheader {
      background: ${surface2} !important;
      color: ${text} !important;
      background-image: none !important;
      border: none !important;
    }
    div.codeheader {
      padding: 5px !important;
      border-radius: 2px 2px 0 0 !important;
    }
    .quoteheader a, .codeheader a { color: ${text} !important; }
    .topslice_quote {
      background: transparent !important;
      background-image: none !important;
      padding: 2px !important;
    }
    .botslice_quote {
      background: transparent !important;
      background-image: none !important;
    }
    .fpc-quote-wrap {
      border-radius: 5px !important;
      overflow: hidden !important;
      margin: 8px 0 !important;
    }

    /* ================= GeSHi code blocks ================= */
    div.geshi,
    div[class*="geshi"] {
      background: ${brighten(text, 0.25)} !important;
      background-color: ${brighten(text, 0.25)} !important;
      color: ${bg} !important;
      border: 1px solid ${rgba(bg, 0.25)} !important;
      margin: 0 !important;
      width: auto !important;
    }
    div.geshi ol,
    div.geshi ol li,
    div.geshi ol li div,
    div.geshi ol li > div {
      background: transparent !important;
      background-color: transparent !important;
      color: ${bg} !important;
      border-color: ${rgba(bg, 0.08)} !important;
    }
    div.geshi ol {
      color: ${rgba(bg, 0.5)} !important;
    }

    /* <code> / <pre> (plain [code]) — no rounded corners, no border. */
    code, code.bbc_code, pre, pre.bbc_code {
      border-radius: 0 !important;
    }
    code.bbc_code {
      border: none !important;
    }

    /* Table headers of stats / bookstore / user blocks */
    .info_center, .stats_table {
      background: ${surface} !important;
      color: ${text} !important;
    }

    /* ================= post action buttons ================= */
    div.buttonlist ul,
    div.buttonlist ul li {
      background: none !important;
      background-image: none !important;
      list-style: none !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
    }
    div.buttonlist ul li {
      display: inline-block !important;
      margin: 0 3px !important;
    }
    div.buttonlist ul li a,
    div.buttonlist ul li a:link,
    div.buttonlist ul li a:visited {
      display: inline-block !important;
      background: ${surface2} !important;
      background-image: none !important;
      color: ${text} !important;
      border: 1px solid ${rgba(text, 0.2)} !important;
      border-radius: 4px !important;
      padding: 5px 12px !important;
      margin: 0 !important;
      height: auto !important;
      line-height: 1.3 !important;
      text-decoration: none !important;
      font-weight: normal !important;
      box-shadow: none !important;
      overflow: visible !important;
    }
    div.buttonlist ul li a span {
      display: inline !important;
      background: none !important;
      background-image: none !important;
      color: inherit !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      height: auto !important;
      line-height: inherit !important;
      float: none !important;
    }
    div.buttonlist ul li a:hover,
    div.buttonlist ul li a:hover span {
      background: ${accent} !important;
      color: ${bg} !important;
    }
    div.buttonlist ul li a:hover {
      border-color: ${accent} !important;
    }

    /* ================= hardcoded light borders (SMF defaults) ================= */
    div.post,
    div.post > div {
      border-color: ${rgba(text, 0.08)} !important;
    }

    /* separate each post visually */
    .post_wrapper {
      padding-top: 5px !important;
      padding-bottom: 5px !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
    }

    div.geshi,
    div[class*="geshi"] {
      border-left: 1px solid ${rgba(bg, 0.25)} !important;
      border-right: 1px solid ${rgba(bg, 0.25)} !important;
      border-top: 1px solid ${rgba(bg, 0.25)} !important;
      border-bottom: 1px solid ${rgba(bg, 0.25)} !important;
    }

    div.navigate_section > ul,
    div.navigate_section ul {
      border-top-color: ${rgba(text, 0.1)} !important;
      border-color: ${rgba(text, 0.1)} !important;
    }

    ul.recent_topics > li,
    ul.recent_topics li {
      border-bottom-color: ${rgba(text, 0.1)} !important;
      border-color: ${rgba(text, 0.1)} !important;
    }

    div.moderatorbar div.signature,
    div.signature {
      border-top-color: ${rgba(text, 0.1)} !important;
      border-color: ${rgba(text, 0.1)} !important;
    }

    div.attachments {
      border-top-color: ${rgba(text, 0.1)} !important;
      border-color: ${rgba(text, 0.1)} !important;
    }

    div#preview_body,
    body div#preview_body {
      color: #f0f0f0 !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    /* ================= post edit / reply form ================= */
    div.roundframe,
    body div.roundframe {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border-left: none !important;
      border-right: none !important;
    }

    form#postmodify span.upperframe,
    form#postmodify span.upperframe > span,
    form#postmodify span.lowerframe,
    form#postmodify span.lowerframe > span,
    body form#postmodify span.upperframe,
    body form#postmodify span.upperframe > span,
    body form#postmodify span.lowerframe,
    body form#postmodify span.lowerframe > span {
      background: none !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    form#postmodify > div.cat_bar,
    body form#postmodify > div.cat_bar {
      border-radius: 5px !important;
    }

    div#message_resizer,
    body div#message_resizer {
      background: ${brighten(bg, 0.5)} !important;
      background-color: ${brighten(bg, 0.5)} !important;
      background-image: none !important;
      border: none !important;
    }

    div#errors,
    body div#errors {
      background: #6b0018 !important;
      background-color: #6b0018 !important;
      background-image: none !important;
      color: #ffffff !important;
      border-radius: 5px !important;
    }
    div#errors a, body div#errors a {
      color: #ffffff !important;
    }
    div#errors div.error,
    body div#errors div.error {
      color: #ffffff !important;
    }
    .error, body .error {
      color: #ffffff !important;
    }

    div.moderatorbar > div.reportlinks img,
    div.reportlinks img {
      display: none !important;
    }

    /* ================= thread list page (messageindex) ================= */
    div#messageindex.tborder,
    div#messageindex {
      border-color: ${rgba(text, 0.1)} !important;
      border: 1px solid ${rgba(text, 0.1)} !important;
      border-radius: 5px !important;
    }
    div#messageindex table.table_grid td,
    div#messageindex table.table_grid th {
      border-color: ${rgba(text, 0.08)} !important;
      border-right-color: ${rgba(text, 0.08)} !important;
      border-bottom-color: ${rgba(text, 0.08)} !important;
    }
    div.topic_table table tr.catbg > th,
    div.topic_table table tr.catbg th,
    div#messageindex table tr.catbg > th,
    div#messageindex table tr.catbg th {
      background: ${surface2} !important;
      background-color: ${surface2} !important;
      background-image: none !important;
    }

    td.stickybg, td.stickybg2,
    td.lockedbg, td.lockedbg2,
    tr.stickybg td, tr.stickybg2 td,
    tr.lockedbg td, tr.lockedbg2 td {
      background: ${rgba(accent, 0.22)} !important;
      background-color: ${rgba(accent, 0.22)} !important;
      color: #f0f0f0 !important;
    }
    td.stickybg a, td.stickybg2 a,
    td.lockedbg a, td.lockedbg2 a,
    tr.stickybg td a, tr.stickybg2 td a,
    tr.lockedbg td a, tr.lockedbg2 td a {
      color: #f0f0f0 !important;
    }
    div#topic_icons {
      border-radius: 5px !important;
    }
    div#topic_icons > div.description,
    div#topic_icons div.description {
      background: none !important;
      background-color: transparent !important;
      background-image: none !important;
      border: none !important;
    }

    div#forumposts > div.cat_bar > h3.catbg img,
    div#forumposts div.cat_bar h3.catbg img {
      display: none !important;
    }
    div#forumposts > div.cat_bar > h3.catbg,
    div#forumposts div.cat_bar h3.catbg {
      border: none !important;
    }
    div#forumposts > div.cat_bar,
    div#forumposts > h3.cat_bar,
    div#forumposts div.cat_bar {
      margin-bottom: 0 !important;
    }

    div#block_recentbox {
      background: ${brighten(bg, 0.08)} !important;
      background-color: ${brighten(bg, 0.08)} !important;
      border: none !important;
      border-radius: 5px !important;
      overflow: hidden !important;
    }
    div#block_recentbox h3.titlebg,
    body div#block_recentbox h3.titlebg,
    html body div#block_recentbox h3.titlebg {
      background: rgba(255, 255, 255, 0.05) !important;
      background-image: none !important;
      border: none !important;
      margin-top: 0px !important;
      padding: 5px !important;
    }

    div#tpleftbarContainer > div > div {
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
    }
    div#tpleftbarContainer > div > div > div {
      border: none !important;
      margin-top: 3px !important;
    }
    div#tpleftbarContainer > div > div h3.titlebg {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: none !important;
    }

    /* ================= tp_catmenu_header — drop SMF's inline bg ================= */
    a.tp_catmenu_header,
    li.tp_catmenu_header a.tp_catmenu_header {
      background: none !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    /* ================= TinyPortal toggle markers ================= */
    .fpc-toggle-marker {
      display: inline-block;
      width: 16px;
      height: 16px;
      line-height: 14px;
      text-align: center;
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
      color: ${text};
      background: ${rgba(text, 0.12)};
      border: 1px solid ${rgba(text, 0.2)};
      border-radius: 3px;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
    }
    .fpc-toggle-marker:hover {
      background: ${accent};
      color: ${bg};
      border-color: ${accent};
    }

    /* ================= "new" badge (replaces img[alt="new"]) ================= */
    .fpc-new-badge {
      display: inline-block;
      padding: 1px 4px;
      margin: 0 2px;
      background: ${accent} !important;
      color: ${bg} !important;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 3px;
      vertical-align: middle;
      line-height: 1.4;
      text-decoration: none !important;
    }
    a .fpc-new-badge:hover {
      background: ${text} !important;
    }

    /* ================= plainbox / display_jump_to ================= */
    .plainbox,
    div#display_jump_to.plainbox,
    div#display_jump_to {
      background: ${surface} !important;
      background-color: ${surface} !important;
      color: ${text} !important;
      border: 1px solid ${rgba(text, 0.1)} !important;
    }
    .plainbox a, #display_jump_to a {
      color: ${accent} !important;
    }

    /* ================= native <select> ================= */
    select,
    select.input_text {
      background: ${surface2} !important;
      background-color: ${surface2} !important;
      color: ${text} !important;
      border: 1px solid ${rgba(text, 0.2)} !important;
      border-radius: 3px !important;
      padding: 3px 6px !important;
      font: inherit !important;
      outline: none !important;
      appearance: auto;
    }
    select:hover {
      border-color: ${accent} !important;
    }
    select:focus {
      border-color: ${accent} !important;
      box-shadow: 0 0 0 2px ${rgba(accent, 0.3)} !important;
    }
    select option {
      background: ${surface2} !important;
      color: ${text} !important;
    }
  `;

  // ==================================================================
  // INJECT  — base first, override second (override wins on ties)
  // ==================================================================
  function inject() {
    if (!document.getElementById('fpc-theme-3-base')) {
      const base = document.createElement('style');
      base.id = 'fpc-theme-3-base';
      base.textContent = CSS_BASE;
      (document.head || document.documentElement).appendChild(base);
    }
    if (!document.getElementById('fpc-theme-3-override')) {
      const ov = document.createElement('style');
      ov.id = 'fpc-theme-3-override';
      ov.textContent = CSS_OVERRIDE;
      (document.head || document.documentElement).appendChild(ov);
    }
  }

  // ---- replace <img alt="new"> with .fpc-new-badge spans --------------
  function replaceNewImages() {
    // img[alt="new"] = sidebar "Recent Topics" new.gif
    // img.new_posts  = "new" gif next to board / topic subject links
    document.querySelectorAll('img[alt="new"], img.new_posts').forEach(img => {
      const badge = document.createElement('span');
      badge.className = 'fpc-new-badge';
      badge.textContent = 'new';
      img.replaceWith(badge);
    });
  }

  // ---- wrap TinyPortal toggle <img>s with .fpc-toggle-marker divs -----
  function isToggleCollapsed(src) {
    return /TPupshrink2\.png|TPexpand\.png/i.test(src || '');
  }
  function markerText(src) {
    return isToggleCollapsed(src) ? '+' : '−';
  }
  function wrapToggleImages() {
    const selectors = [
      'img#toggle_tpleftbarHeader',
      'img#toggle_tprightbarHeader',
      'img#toggle_tpbottombarHeader',
      'h3.titlebg > a > img',
      'h3.catbg > a > img',
    ];
    document.querySelectorAll(selectors.join(',')).forEach(img => {
      if (img.dataset.fpcToggleWrapped === '1') return;
      img.dataset.fpcToggleWrapped = '1';

      const marker = document.createElement('div');
      marker.className = 'fpc-toggle-marker';
      marker.textContent = markerText(img.src);

      img.style.display = 'none';
      img.parentNode.insertBefore(marker, img);

      const obs = new MutationObserver(() => {
        marker.textContent = markerText(img.src);
      });
      obs.observe(img, { attributes: true, attributeFilter: ['src'] });
    });
  }

  // ---- strip inline width:99.8% from editor form inner divs ---------
  function stripEditorInlineWidth() {
    document.querySelectorAll(
      'form#postmodify div.roundframe div[style*="99.8"]'
    ).forEach(el => el.removeAttribute('style'));
  }

  // ---- strip decorative span.l / span.r from h3.titlebg -------------
  function stripTitlebarDecor() {
    document.querySelectorAll(
      'h3.titlebg > span.l, h3.titlebg > span.r, ' +
      'h4.titlebg > span.l, h4.titlebg > span.r, ' +
      'h3.catbg > span.l, h3.catbg > span.r, ' +
      'h4.catbg > span.l, h4.catbg > span.r'
    ).forEach(span => span.remove());
  }

  // ---- rewrite "Logged" to "IP logged" in div.reportlinks ------------
  function renameLoggedLink() {
    document.querySelectorAll('div.reportlinks a').forEach(a => {
      if (a.dataset.fpcRenamed === '1') return;
      if ((a.textContent || '').trim() === 'Logged') {
        a.textContent = 'IP logged';
        a.dataset.fpcRenamed = '1';
      }
    });
  }

  // ---- kill underline on collapse toggles (<a name="toggle_*">) -------
  // SMF's a:hover { text-decoration: underline } underlines the sidebar
  // collapse anchors. An inline text-decoration:none beats the stylesheet
  // :hover rule (no !important on it), covering both states.
  function stripToggleUnderline() {
    document.querySelectorAll('a[name^="toggle_"]').forEach(a => {
      if (a.dataset.fpcNoUnderline === '1') return;
      a.style.textDecoration = 'none';
      a.dataset.fpcNoUnderline = '1';
    });
  }

  // ---- wrap quoteheader + blockquote (+ quotefooter) in a div ---------
  function wrapQuoteBlocks() {
    document.querySelectorAll('div.quoteheader').forEach(header => {
      if (header.parentElement &&
          header.parentElement.classList.contains('fpc-quote-wrap')) return;

      const blockquote = header.nextElementSibling;
      if (!blockquote || blockquote.tagName !== 'BLOCKQUOTE') return;

      const maybeFooter = blockquote.nextElementSibling;
      const hasFooter = maybeFooter &&
                        maybeFooter.classList &&
                        maybeFooter.classList.contains('quotefooter');

      const wrap = document.createElement('div');
      wrap.className = 'fpc-quote-wrap';
      header.parentNode.insertBefore(wrap, header);
      wrap.appendChild(header);
      wrap.appendChild(blockquote);
      if (hasFooter) wrap.appendChild(maybeFooter);
    });
  }

  // ==================================================================
  // BOOT
  // ==================================================================
  if (document.head) {
    inject();
  } else {
    const obs = new MutationObserver(() => {
      if (document.head) { obs.disconnect(); inject(); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function runDomPasses() {
    replaceNewImages();
    wrapQuoteBlocks();
    renameLoggedLink();
    wrapToggleImages();
    stripTitlebarDecor();
    stripEditorInlineWidth();
    stripToggleUnderline();
  }

  function onReady() {
    inject();
    runDomPasses();

    let timer = null;
    const mo = new MutationObserver(() => {
      if (timer !== null) return;
      timer = setTimeout(() => { timer = null; runDomPasses(); }, 80);
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  } else {
    onReady();
  }
})();

// ============================================================================
// ============================================================================
// ===  PART 2 / 2 :  PASCAL SYNTAX HIGHLIGHTER  (Unleashed-aware tokenizer)
// ============================================================================
// ============================================================================

console.log('[Unleashed HL / dark] userscript loaded, readyState=' + document.readyState + ', url=' + location.href);

(function () {
  'use strict';

  const KEYWORDS = new Set([
    'and','array','as','asm','begin','break','case','class','const',
    'constructor','continue','destructor','div','do','downto','else',
    'end','except','exit','exports','file','finalization','finally',
    'for','function','generic','goto','if','implementation','in',
    'inherited','initialization','inline','interface','is','label',
    'library','mod','nil','not','object','of','on','operator','or',
    'out','packed','procedure','program','property','raise','record',
    'repeat','resourcestring','self','set','shl','shr','specialize',
    'then','threadvar','to','try','type','unit','until','uses','var',
    'while','with','xor',
    'match','leave','all','default','private','protected','public',
    'published','virtual','override','overload','abstract','reintroduce',
    'static','dynamic','forward','external','cdecl','stdcall','register',
    'pascal','safecall','varargs','read','write','stored','nodefault'
  ]);

  const TYPES = new Set([
    'integer','longint','boolean','double','real','char','byte','word',
    'cardinal','int64','uint64','shortint','smallint','single','extended',
    'currency','ansistring','widestring','unicodestring','pchar',
    'pointer','string','tobject','dword','qword','variant','longword',
    'nativeint','nativeuint','sizeint','ptrint','ptruint','ansichar',
    'widechar','rawbytestring','shortstring','utf8string','comp','bytebool',
    'wordbool','longbool','text','textfile'
  ]);

  const LITERALS = new Set(['true','false','nil']);

  // Dark palette — designed to pair with the navy theme palette
  // (0d1b2a-1b263b-415a77-778da9-e0e1dd). Token colors pop on the dark
  // code-block background while identifiers stay in a bright near-white.
  const BLOCK_BG    = '#0d1b2a'; // palette: bg (darkest navy)
  const BLOCK_TEXT  = '#f0f0f0'; // near-white — default + pascal identifiers
  const LINE_NUMBER = 'rgba(240,240,240,0.45)';

  const COLORS = {
    keyword:   { color: '#6cb8ff', 'font-weight': 'bold' },
    type:      { color: '#4ec9b0' },
    literal:   { color: '#c792ea', 'font-weight': 'bold' },
    string:    { color: '#e6b450', 'background-color': 'rgba(230,180,80,0.10)' },
    number:    { color: '#b5cea8' },
    comment:   { color: '#7a8a9c', 'font-style': 'italic' },
    directive: { color: '#ff9580', 'font-weight': 'bold' },
    op:        { color: BLOCK_TEXT },
    punct:     { color: BLOCK_TEXT },
    ident:     { color: BLOCK_TEXT },
    ws:        null,
  };

  function tokenize(src) {
    const toks = [];
    const n = src.length;
    let i = 0;
    // 0 = normal, 1 = inside $'...'  text portion, 2 = inside {expr} portion
    let interp = 0;

    while (i < n) {

      // --- state 1: text portion of interpolated string ---
      if (interp === 1) {
        let j = i;
        let handled = false;
        while (j < n) {
          const ch = src[j];
          if (ch === "'") {
            toks.push({ t: 'string', v: src.slice(i, j + 1) });
            i = j + 1;
            interp = 0;
            handled = true;
            break;
          }
          if (ch === '{') {
            if (src[j + 1] === '{') { j += 2; continue; }
            if (j > i) toks.push({ t: 'string', v: src.slice(i, j) });
            toks.push({ t: 'punct', v: '{' });
            i = j + 1;
            interp = 2;
            handled = true;
            break;
          }
          if (ch === '}' && src[j + 1] === '}') { j += 2; continue; }
          if (ch === '\n') {
            if (j > i) toks.push({ t: 'string', v: src.slice(i, j) });
            toks.push({ t: 'ws', v: '\n' });
            i = j + 1;
            handled = true;
            break;
          }
          j++;
        }
        if (!handled) {
          if (j > i) toks.push({ t: 'string', v: src.slice(i, j) });
          i = j;
          interp = 0;
        }
        continue;
      }

      // --- state 2: expression portion — intercept `}` and lone `{` ---
      if (interp === 2) {
        if (src[i] === '}') {
          toks.push({ t: 'punct', v: '}' });
          i++;
          interp = 1;
          continue;
        }
        if (src[i] === '{') {
          toks.push({ t: 'punct', v: '{' });
          i++;
          continue;
        }
        if (src[i] === ':') {
          // format mask `{expr:mask}` — string content, not code
          let j = i + 1;
          while (j < n && src[j] !== '}' && src[j] !== '\n') j++;
          toks.push({ t: 'string', v: src.slice(i, j) });
          i = j;
          continue;
        }
        // fall through to normal tokenizing
      }

      const c = src[i];
      const c2 = src.substr(i, 2);

      // --- interpolated string start: $' ---
      if (c === '$' && src[i + 1] === "'") {
        toks.push({ t: 'string', v: "$'" });
        i += 2;
        interp = 1;
        continue;
      }

      if (c2 === '//') {
        let j = i;
        while (j < n && src[j] !== '\n') j++;
        toks.push({ t: 'comment', v: src.slice(i, j) });
        i = j;
        continue;
      }

      if (c === '{') {
        let j = i + 1;
        while (j < n && src[j] !== '}') j++;
        if (j < n) j++;
        const raw = src.slice(i, j);
        toks.push({ t: raw.startsWith('{$') ? 'directive' : 'comment', v: raw });
        i = j;
        continue;
      }

      if (c2 === '(*') {
        let j = i + 2;
        while (j + 1 < n && !(src[j] === '*' && src[j + 1] === ')')) j++;
        if (j + 1 < n) j += 2; else j = n;
        const raw = src.slice(i, j);
        toks.push({ t: raw.startsWith('(*$') ? 'directive' : 'comment', v: raw });
        i = j;
        continue;
      }

      if (c === "'") {
        let j = i + 1;
        while (j < n) {
          if (src[j] === "'") {
            if (src[j + 1] === "'") { j += 2; continue; }
            j++;
            break;
          }
          if (src[j] === '\n') break;
          j++;
        }
        toks.push({ t: 'string', v: src.slice(i, j) });
        i = j;
        continue;
      }

      if (c === '#') {
        let j = i;
        while (j < n && src[j] === '#') {
          j++;
          if (src[j] === '$') {
            j++;
            while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++;
          } else if (/[0-9]/.test(src[j] || '')) {
            while (j < n && /[0-9_]/.test(src[j])) j++;
          } else {
            break;
          }
        }
        if (j > i + 1) {
          toks.push({ t: 'string', v: src.slice(i, j) });
          i = j;
          continue;
        }
      }

      if (c === '$' && /[0-9a-fA-F]/.test(src[i + 1] || '')) {
        let j = i + 1;
        while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++;
        toks.push({ t: 'number', v: src.slice(i, j) });
        i = j;
        continue;
      }

      if (c === '%' && /[01]/.test(src[i + 1] || '')) {
        let j = i + 1;
        while (j < n && /[01_]/.test(src[j])) j++;
        toks.push({ t: 'number', v: src.slice(i, j) });
        i = j;
        continue;
      }

      if (/[0-9]/.test(c)) {
        let j = i;
        while (j < n && /[0-9_]/.test(src[j])) j++;
        if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) {
          j++;
          while (j < n && /[0-9_]/.test(src[j])) j++;
        }
        if (src[j] === 'e' || src[j] === 'E') {
          j++;
          if (src[j] === '+' || src[j] === '-') j++;
          while (j < n && /[0-9]/.test(src[j])) j++;
        }
        toks.push({ t: 'number', v: src.slice(i, j) });
        i = j;
        continue;
      }

      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
        const word = src.slice(i, j);
        const lower = word.toLowerCase();
        let t = 'ident';
        if (KEYWORDS.has(lower)) t = 'keyword';
        else if (TYPES.has(lower)) t = 'type';
        else if (LITERALS.has(lower)) t = 'literal';
        toks.push({ t, v: word });
        i = j;
        continue;
      }

      const two = src.substr(i, 2);
      if (['..', ':=', '<>', '<=', '>=', '+=', '-=', '*=', '/='].includes(two)) {
        toks.push({ t: 'op', v: two });
        i += 2;
        continue;
      }
      if ('+-*/=<>'.includes(c)) {
        toks.push({ t: 'op', v: c });
        i++;
        continue;
      }
      if (';,:()[]^@.'.includes(c)) {
        toks.push({ t: 'punct', v: c });
        i++;
        continue;
      }

      if (/\s/.test(c)) {
        let j = i;
        while (j < n && /\s/.test(src[j])) j++;
        toks.push({ t: 'ws', v: src.slice(i, j) });
        i = j;
        continue;
      }

      toks.push({ t: 'ident', v: c });
      i++;
    }
    return toks;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function styleFor(type) {
    const c = COLORS[type];
    if (!c) return '';
    return Object.entries(c).map(([k, v]) => `${k}:${v}`).join(';');
  }

  function renderTokens(tokens) {
    let out = '';
    for (const tok of tokens) {
      const text = esc(tok.v).replace(/ /g, '\u00a0');
      const style = styleFor(tok.t);
      out += style ? `<span style="${style}">${text}</span>` : text;
    }
    return out || '\u00a0';
  }

  function splitByNewlines(tokens) {
    const lines = [[]];
    for (const tok of tokens) {
      if (!tok.v.includes('\n')) {
        lines[lines.length - 1].push(tok);
        continue;
      }
      const parts = tok.v.split('\n');
      for (let k = 0; k < parts.length; k++) {
        if (parts[k].length > 0) {
          lines[lines.length - 1].push({ t: tok.t, v: parts[k] });
        }
        if (k < parts.length - 1) lines.push([]);
      }
    }
    return lines;
  }

  // Apply the default dark background + light text to a div.geshi and
  // all of its <ol>/<li>/inner-div descendants. Runs on EVERY code
  // block, regardless of language, so that plain [code] blocks also
  // adopt the dark theme. Uses setProperty(..., 'important') so these
  // inline declarations beat any external theme stylesheet with
  // !important on div.geshi.
  function applyDarkBase(block) {
    block.style.setProperty('color', BLOCK_TEXT, 'important');
    block.style.setProperty('background-color', BLOCK_BG, 'important');
    block.style.setProperty('background', BLOCK_BG, 'important');

    const ol = block.querySelector('ol');
    if (ol) {
      ol.style.setProperty('color', LINE_NUMBER, 'important');
    }

    block.querySelectorAll('li').forEach(li => {
      // <li>'s color drives the ::marker pseudo-element (line number).
      // The theme sheet sets <li> color to a very dark palette value
      // which disappears on our dark background, so we must override
      // with !important inline. The inner div gets its own color so
      // the code text stays bright.
      li.style.setProperty('color', LINE_NUMBER, 'important');
      li.style.setProperty('background', 'transparent', 'important');
      li.style.setProperty('background-color', 'transparent', 'important');
      const inner = li.querySelector('div');
      if (inner) {
        inner.style.setProperty('color', BLOCK_TEXT, 'important');
        inner.style.setProperty('background', 'transparent', 'important');
        inner.style.setProperty('background-color', 'transparent', 'important');
      }
    });

    // GeSHi emits inline-styled <span>s with hardcoded colors designed
    // for a LIGHT page (#000099, #666666, #FF0000 etc.). On the dark
    // background most of them become unreadable. For non-pascal blocks
    // (.ini, .text, .javascript, .php, ...) we keep GeSHi's semantic
    // structure but BRIGHTEN any too-dark color in place — luminance
    // stays similar, hue stays similar, but the color now shows up.
    // Pascal/Delphi blocks get their innerHTML replaced later by the
    // tokenizer so no point touching their spans.
    const isPascalBlock = block.classList.contains('pascal') ||
                          block.classList.contains('delphi');
    if (!isPascalBlock) {
      block.querySelectorAll('span').forEach(span => {
        span.style.setProperty('background', 'transparent', 'important');
        span.style.setProperty('background-color', 'transparent', 'important');

        const rgb = parseInlineColor(span.getAttribute('style'));
        if (!rgb) return;

        // Relative luminance (Rec. 709 weights).
        const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
        if (lum >= 0.55) return; // already bright enough

        // Interpolate toward white. The darker the original, the more
        // we shift — this keeps mid-bright colors largely intact.
        const t = 0.6 + (0.55 - lum) * 0.4;
        const r = Math.round(rgb[0] + (255 - rgb[0]) * t);
        const g = Math.round(rgb[1] + (255 - rgb[1]) * t);
        const b = Math.round(rgb[2] + (255 - rgb[2]) * t);
        span.style.setProperty('color', 'rgb(' + r + ',' + g + ',' + b + ')', 'important');
      });
    }
  }

  // Parse the `color:` value out of an inline style string.
  // Supports #rgb / #rrggbb / rgb(r,g,b) / rgba(r,g,b,a). Returns
  // [r,g,b] (0..255) or null.
  function parseInlineColor(style) {
    if (!style) return null;
    const m = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (!m) return null;
    const v = m[1].trim();

    let h = v.match(/^#([0-9a-f]{3})$/i);
    if (h) {
      const s = h[1];
      return [
        parseInt(s[0] + s[0], 16),
        parseInt(s[1] + s[1], 16),
        parseInt(s[2] + s[2], 16),
      ];
    }
    h = v.match(/^#([0-9a-f]{6})$/i);
    if (h) {
      return [
        parseInt(h[1].slice(0, 2), 16),
        parseInt(h[1].slice(2, 4), 16),
        parseInt(h[1].slice(4, 6), 16),
      ];
    }
    const rgb = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) {
      return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10)];
    }
    return null;
  }

  // Plain [code] without a language tag renders as <code class="bbc_code">
  // (display:block), with NO div.geshi > ol > li structure. Give it the
  // same dark skin as a text block — no tokenizing, just bg + text.
  function skinPlainCodeBlocks() {
    document.querySelectorAll('code.bbc_code').forEach(el => {
      if (el.dataset.unleashedHighlighted === '1') return;
      el.style.setProperty('background', BLOCK_BG, 'important');
      el.style.setProperty('background-color', BLOCK_BG, 'important');
      el.style.setProperty('color', BLOCK_TEXT, 'important');
      // curve gives code.bbc_code a 2px #999 top+bottom border — drop it.
      el.style.setProperty('border-top', 'none', 'important');
      el.style.setProperty('border-bottom', 'none', 'important');
      // its wrapping <pre> (no class) carries a border too — strip it.
      const pre = el.closest('pre');
      if (pre) pre.style.setProperty('border', 'none', 'important');
      el.dataset.unleashedHighlighted = '1';
    });
  }

  function highlightAll() {
    skinPlainCodeBlocks();

    const blocks = document.querySelectorAll('div.geshi');
    let blockCount = 0;
    let lineCount = 0;

    blocks.forEach(block => {
      if (block.dataset.unleashedHighlighted === '1') return;

      // 1. Default dark skin for ALL code blocks (pascal, text, anything).
      applyDarkBase(block);

      // 2. Pascal / Delphi blocks additionally get tokenized and the
      //    identifier spans overwritten with syntax colors.
      const isPascal = block.classList.contains('pascal') ||
                       block.classList.contains('delphi');
      if (!isPascal) {
        block.dataset.unleashedHighlighted = '1';
        blockCount++;
        return;
      }

      const ol = block.querySelector('ol');
      if (!ol) {
        block.dataset.unleashedHighlighted = '1';
        blockCount++;
        return;
      }

      const lis = Array.from(ol.querySelectorAll(':scope > li'));
      if (lis.length === 0) {
        block.dataset.unleashedHighlighted = '1';
        blockCount++;
        return;
      }

      const lines = lis.map(li => li.textContent.replace(/\u00a0/g, ' '));
      const src = lines.join('\n');
      const tokens = tokenize(src);
      const perLine = splitByNewlines(tokens);

      lis.forEach((li, idx) => {
        const inner = li.querySelector('div') || li;
        inner.innerHTML = renderTokens(perLine[idx] || []);
        inner.style.setProperty('color', BLOCK_TEXT, 'important');
        inner.style.setProperty('background', 'transparent', 'important');
        inner.style.setProperty('background-color', 'transparent', 'important');
      });

      block.dataset.unleashedHighlighted = '1';
      blockCount++;
      lineCount += lis.length;
    });

    if (blockCount > 0) {
      console.log(`[Unleashed HL / dark] ${blockCount} block(s) skinned, ${lineCount} Pascal line(s) tokenized.`);
    }
  }

  // Re-run strategy:
  //   1. Initial pass on load
  //   2. MutationObserver on documentElement for instant updates when we can
  //      see mutations (cheap primary path)
  //   3. setInterval fallback every 500 ms — bulletproof polling for cases
  //      where the observer misses events (Tampermonkey isolation, etc.).
  //      highlightAll() is idempotent thanks to dataset.unleashedHighlighted,
  //      so a poll with nothing new costs only one querySelectorAll.
  function installObserver() {
    try {
      const obs = new MutationObserver(highlightAll);
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {
      console.warn('[Unleashed HL] MutationObserver failed:', e);
    }
  }

  function installPoller() {
    setInterval(highlightAll, 500);
  }

  function init() {
    highlightAll();
    installObserver();
    installPoller();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
