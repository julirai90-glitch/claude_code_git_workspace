/**
 * WordPress Browser Console Script
 * Erstellt alle Datenstory-Seiten auf julianreich.ch
 *
 * Anleitung:
 * 1. Im Browser auf https://julianreich.ch/wp-admin/ einloggen
 * 2. Auf einer beliebigen Admin-Seite bleiben (z.B. Dashboard)
 * 3. Browser-Entwicklerkonsole öffnen (F12 → Console)
 * 4. Dieses gesamte Script reinkopieren und Enter drücken
 * 5. Warten bis "FERTIG" ausgegeben wird (~30 Sek.)
 */

(async () => {
  const BASE_IFRAME = "https://julirai90-glitch.github.io/claude_code_git_workspace/ausgaben/";
  const NONCE = typeof wpApiSettings !== "undefined" ? wpApiSettings.nonce : null;

  if (!NONCE) {
    console.error("❌ wpApiSettings nicht gefunden. Stelle sicher, dass du im WordPress Admin bist.");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    "X-WP-Nonce": NONCE,
  };

  async function createPage(params) {
    const r = await fetch("/wp-json/wp/v2/pages", {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("❌ Fehler:", data.message, params.title);
      return null;
    }
    console.log(`✅ Seite erstellt: "${data.title.rendered}" → ${data.link}`);
    return data;
  }

  // 1. Übersichtsseite /datenstories erstellen
  console.log("⏳ Erstelle Übersichtsseite /datenstories …");
  const overview = await createPage({
    title: "Datenstories",
    slug: "datenstories",
    status: "draft",
    content: `<!-- wp:paragraph -->
<p>Interaktive Datenstories zu Bevölkerung, Demografie und Raum in Graubünden. Alle Grafiken sind direkt im Browser bedienbar.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
<li><a href="/datenstories/chur-gemeinden/">Chur vs. die 60 kleinsten Bündner Gemeinden</a></li>
<li><a href="/datenstories/haefte-haefte/">13 Gemeinden = eine Hälfte, 88 Gemeinden = die andere</a></li>
<li><a href="/datenstories/treemap-gemeinden/">Gemeindegrössen Graubünden 2024</a></li>
<li><a href="/datenstories/schlafdoerfer/">Schlafdörfer &amp; Arbeitsorte Graubünden 2023</a></li>
<li><a href="/datenstories/demografie-alter-geschlecht/">Alter &amp; Geschlecht in Graubünden 2024</a></li>
<li><a href="/datenstories/demografie-scrollytelling/">Jung oder alt, Mann oder Frau? — Graubünden 2024</a></li>
<li><a href="/datenstories/geschlecht-gemeinden/">Geschlechterverhältnis nach Gemeinde</a></li>
</ul>
<!-- /wp:list -->`,
  });

  if (!overview) {
    console.error("❌ Übersichtsseite konnte nicht erstellt werden. Abbruch.");
    return;
  }

  const parentId = overview.id;

  // 2. Story-Seiten erstellen
  const stories = [
    {
      title: "Chur vs. die 60 kleinsten Bündner Gemeinden",
      slug: "chur-gemeinden",
      file: "01-chur-60-gemeinden.html",
      desc: "Bevölkerungsvergleich zwischen der Kantonshauptstadt Chur und den 60 einwohnerschwächsten Gemeinden Graubündens.",
    },
    {
      title: "13 Gemeinden = eine Hälfte, 88 Gemeinden = die andere",
      slug: "haefte-haefte",
      file: "01-haefte-haefte.html",
      desc: "Wie die Bevölkerung Graubündens auf die 101 Gemeinden verteilt ist — und was das über Verdichtung und Peripherie aussagt.",
    },
    {
      title: "Gemeindegrössen Graubünden 2024",
      slug: "treemap-gemeinden",
      file: "01-treemap-gemeinden.html",
      desc: "Alle 101 Bündner Gemeinden nach Einwohnerzahl, dargestellt als Treemap.",
    },
    {
      title: "Schlafdörfer & Arbeitsorte Graubünden 2023",
      slug: "schlafdoerfer",
      file: "02-schlafdoerfer.html",
      desc: "Wo wohnen die Beschäftigten, wo arbeiten sie? Eine Analyse der Pendlerströme in Graubünden.",
    },
    {
      title: "Alter & Geschlecht in Graubünden 2024",
      slug: "demografie-alter-geschlecht",
      file: "03-demografie-alter-geschlecht.html",
      desc: "Alters- und Geschlechterstruktur der Bündner Gemeinden im Vergleich.",
    },
    {
      title: "Jung oder alt, Mann oder Frau? — Graubünden 2024",
      slug: "demografie-scrollytelling",
      file: "03-scrollytelling-demografie.html",
      desc: "Scrollytelling zur Demografie Graubündens: Altersstruktur und Geschlechterverteilung in allen Gemeinden.",
    },
    {
      title: "Geschlechterverhältnis nach Gemeinde",
      slug: "geschlecht-gemeinden",
      file: "geschlechterverteilung-graubuenden.html",
      desc: "Anteil Frauen und Männer pro Bündner Gemeinde im Überblick.",
    },
  ];

  console.log(`\n⏳ Erstelle ${stories.length} Story-Seiten (Parent ID: ${parentId}) …\n`);

  for (const story of stories) {
    await createPage({
      title: story.title,
      slug: story.slug,
      status: "draft",
      parent: parentId,
      content: `<!-- wp:paragraph -->
<p>${story.desc}</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<iframe
  src="${BASE_IFRAME}${story.file}"
  width="100%"
  style="height:90vh;border:none;display:block;"
  loading="lazy"
  title="${story.title}">
</iframe>
<!-- /wp:html -->`,
    });
  }

  console.log("\n🎉 FERTIG — alle Seiten als Draft erstellt.");
  console.log("Öffne https://julianreich.ch/wp-admin/edit.php?post_type=page zum Überprüfen.");
})();
