import fs from 'node:fs';
import path from 'node:path';
import * as YAML from 'yaml';
import { csvUnparse } from './helpers/csvUnParse.js';

interface Office {
  classification?: string;
  address?: string;
  voice?: string;
  email?: string;
}

interface PersonData {
  name?: string;
  email?: string;
  offices?: Office[];
}

interface EmailRecord {
  name: string;
  email: string;
}

/**
 * Extracts the first email address from each YAML file in data/us/legislature/
 * that contains an @ character and saves them to a CSV file in dataExtracted folder
 */
export function US_extractEmailContactFormUrls(): void {
  const legislatureDir = path.join(process.cwd(), 'data', 'us', 'legislature');
  const outputDir = path.join(process.cwd(), 'dataExtracted');
  const outputFile = path.join(outputDir, 'US_email_contact_form_urls.csv');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Read all YAML files
  const files = fs
    .readdirSync(legislatureDir)
    .filter((file) => file.endsWith('.yml'));

  const emailRecords: EmailRecord[] = [];

  console.log(`Processing ${files.length} YAML files...`);

  for (const file of files) {
    try {
      const filePath = path.join(legislatureDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = YAML.parse(fileContent) as PersonData;

      if (data.name) {
        let emailFound = false;

        // First check the top-level email field
        if (data.email) {
          emailRecords.push({
            name: data.name,
            email: data.email,
          });
          emailFound = true;
        }

        // If no email found at top level and not already found, check offices
        if (!emailFound && data.offices) {
          for (const office of data.offices) {
            if (office.email) {
              emailRecords.push({
                name: data.name,
                email: office.email,
              });
              break; // Only take the first email address found
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  console.log(`Found ${emailRecords.length} records with email addresses`);

  // Convert to CSV and write to file
  const csvContent = csvUnparse(emailRecords);
  fs.writeFileSync(outputFile, csvContent);

  console.log(`Email addresses extracted and saved to: ${outputFile}`);
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  US_extractEmailContactFormUrls();
}
