import fs from "node:fs/promises";

const teamUrls = [
  ["ATA", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8524/atalanta"],
  ["BOL", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/9857/bologna"],
  ["CAG", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8529/cagliari"],
  ["COM", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/10171/como-players"],
  ["FIO", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8535/fiorentina"],
  ["FRO", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/9891/frosinone"],
  ["GEN", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/10233/genoa"],
  ["INT", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8636/inter"],
  ["JUV", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/9885/juventus-players"],
  ["LAZ", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8543/lazio"],
  ["LEC", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/9888/lecce"],
  ["MIL", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8564/milan-players"],
  ["MON", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/6504/monza"],
  ["NAP", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/9875/napoli"],
  ["PAR", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/10167/parma"],
  ["ROM", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8686/roma-players"],
  ["SAS", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/7943/sassuolo"],
  ["TOR", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/9804/torino"],
  ["UDI", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/8600/udinese"],
  ["VEN", "https://www.fotmob.com/leagues/55/stats/season/36072/players/mins_played/team/7881/venezia"]
];

function extractRows(html, team, sourceUrl) {
  const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!nextData) return [];
  const data = JSON.parse(nextData[1]).props?.pageProps?.data?.statsData ?? [];
  return data
    .filter((row) => row?.name && row?.statValue?.name === "mins_played")
    .map((row) => ({
      name: String(row.name).trim(),
      team,
      matches: Number(row.substatValue?.value ?? 0),
      minutes: Number(row.statValue?.value ?? 0),
      source: sourceUrl
    }));
}

const output = [];
for (const [team, url] of teamUrls) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  const html = await response.text();
  output.push(...extractRows(html, team, url));
}

const byName = Array.from(new Map(output.map((row) => [row.name, row])).values())
  .sort((a, b) => a.name.localeCompare(b.name));

await fs.writeFile("src/data/early_usage_2026_27.json", `${JSON.stringify(byName, null, 2)}\n`);
console.log(`Wrote ${byName.length} usage rows`);
console.log(byName.filter((row) => row.name.toLowerCase().includes("chukwueze")));
