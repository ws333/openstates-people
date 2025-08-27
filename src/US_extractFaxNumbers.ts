import fs from 'node:fs';
import path from 'node:path';
import * as YAML from 'yaml';
import { csvUnparse } from './helpers/csvUnParse.js';

interface Office {
  classification?: string;
  address?: string;
  voice?: string;
  fax?: string;
}

interface PersonData {
  name?: string;
  offices?: Office[];
}

interface FaxRecord {
  name: string;
  fax: string;
}

/**
 * Extracts the first fax number from each YAML file in data/us/legislature/
 * and saves them to a CSV file in dataExtracted folder
 */
export function US_extractFaxNumbers(): void {
  const legislatureDir = path.join(process.cwd(), 'data', 'us', 'legislature');
  const outputDir = path.join(process.cwd(), 'dataExtracted');
  const outputFile = path.join(outputDir, 'US_fax_numbers.csv');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Read all YAML files
  const files = fs
    .readdirSync(legislatureDir)
    .filter((file) => file.endsWith('.yml'));

  const faxRecords: FaxRecord[] = [];

  console.log(`Processing ${files.length} YAML files...`);

  for (const file of files) {
    try {
      const filePath = path.join(legislatureDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = YAML.parse(fileContent) as PersonData;

      if (data.name && data.offices) {
        // Find the first office with a fax number
        for (const office of data.offices) {
          if (office.fax) {
            faxRecords.push({
              name: data.name,
              fax: office.fax,
            });
            break; // Only take the first fax number found
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  console.log(`Found ${faxRecords.length} records with fax numbers`);

  // Convert to CSV and write to file
  const csvContent = csvUnparse(faxRecords);
  fs.writeFileSync(outputFile, csvContent);

  console.log(`Fax numbers extracted and saved to: ${outputFile}`);
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  US_extractFaxNumbers();
}
