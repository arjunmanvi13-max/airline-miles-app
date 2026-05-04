import fs from "fs";
import https from "https";

const url = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const outputPath = "app/airports.ts";

console.log("Downloading airport data...");

function download(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Download timed out after 15 seconds"));
    });

    req.on("error", reject);
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

try {
  const csv = await download(url);
  console.log("Download complete. Processing...");

  const lines = csv.split("\n").filter(Boolean);
  const headers = parseCSVLine(lines[0]);

  const airports = lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);
      const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));

      return {
        code: row.iata_code,
        name: row.name,
        municipality: row.municipality,
        country: row.iso_country,
        region: row.continent || row.iso_country,
        type: row.type,
        latitude: Number(row.latitude_deg),
        longitude: Number(row.longitude_deg),
      };
    })
    .filter((airport) => {
      return (
        airport.code &&
        airport.code.length === 3 &&
        ["large_airport", "medium_airport"].includes(airport.type)
      );
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  const fileContent = `export type Airport = {
  code: string;
  name: string;
  municipality: string;
  country: string;
  region: string;
  type: string;
  latitude: number;
  longitude: number;
};

export const airports: Airport[] = ${JSON.stringify(airports, null, 2)};
`;

  fs.writeFileSync(outputPath, fileContent);

  console.log(`Generated ${airports.length} airports at ${outputPath}`);
} catch (error) {
  console.error("Airport generation failed:");
  console.error(error.message);
}