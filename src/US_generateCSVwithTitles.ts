import fs from 'node:fs';
import path from 'node:path';
import { csvUnparse } from './helpers/csvUnParse.js';
import { csvParse } from './helpers/csvParse.js';
import {
  filenameFaxNumbers,
  filenameNameFax,
  folderDataExtracted,
  representative,
  senator,
} from './constants/constants.js';
import { normalizeName } from './helpers/normalizeName.js';
import { writeFile } from './utils/writeFile.js';

interface LegislatorRecord {
  last_name: string;
  first_name: string;
  middle_name: string;
  suffix: string;
  nickname: string;
  full_name: string;
  type: string;
  state: string;
  district: string;
}

interface FaxRecord {
  name: string;
  fax: string;
}

/**
 * Creates a CSV file with title, name, and fax for all contacts from US_fax_numbers.csv
 * Uses legislators-current.csv to determine if a person is a Senator or Representative
 * based on the type field. All contacts from US_fax_numbers.csv are included in output.
 * Check for updates at https://unitedstates.github.io/congress-legislators/legislators-current.csv
 *
 * Output file dataExtracted/US_congress.csv is copied to iases3collector/data/fax when running pnpm start
 * Check diff in iases3collector to see if there are updates
 */
export function US_generateCSVwithTitles(): void {
  const dataDir = path.join(process.cwd(), folderDataExtracted);
  const srcDir = path.join(process.cwd(), 'src', 'constants');
  const faxFile = path.join(dataDir, filenameFaxNumbers);
  const legislatorsFile = path.join(srcDir, 'legislators-current.csv');
  const outputFile = path.join(dataDir, filenameNameFax);

  try {
    // Read both CSV files
    const faxData = fs.readFileSync(faxFile, 'utf-8');
    const legislatorsData = fs.readFileSync(legislatorsFile, 'utf-8');

    // Parse CSV data
    const faxRecords = csvParse<FaxRecord>(faxData).data;

    const legislatorRecords = csvParse<LegislatorRecord>(legislatorsData).data;

    const combinedRecords: FaxRecord[] = [];
    const unmatchedNames: string[] = [];

    // Create a map of legislators by normalized names for faster lookup
    const legislatorMap = new Map<string, LegislatorRecord>();
    legislatorRecords.forEach((legislator) => {
      if (legislator.full_name) {
        const { firstName, lastName } = normalizeName(legislator.full_name);
        const key = `${firstName}|${lastName}`;
        legislatorMap.set(key, legislator);

        // Also create an entry using nickname if available
        if (legislator.nickname && legislator.nickname.trim()) {
          const nicknameKey = `${legislator.nickname.toLowerCase()}|${lastName}`;
          legislatorMap.set(nicknameKey, legislator);
        }
      }
    });

    // Match fax records with legislator records, assign appropriate titles
    faxRecords.forEach((faxRecord) => {
      if (faxRecord.name && faxRecord.fax) {
        const { firstName, lastName } = normalizeName(faxRecord.name);
        const key = `${firstName}|${lastName}`;
        const matchingLegislator = legislatorMap.get(key);

        // Determine title based on the type field from legislators-current.csv
        let title = '';
        let nameToUse = '';

        if (matchingLegislator) {
          if (matchingLegislator.type === 'sen') {
            title = senator;
          } else if (matchingLegislator.type === 'rep') {
            title = representative;
          }
          // Use the full_name from legislators file when match is found
          nameToUse = matchingLegislator.full_name;
        } else {
          // Log unmatched names
          unmatchedNames.push(faxRecord.name);
        }

        // Add all records: include all fax records with appropriate titles
        combinedRecords.push({
          name: `${title} ${nameToUse}`,
          fax: faxRecord.fax,
        });
      }
    });

    // Sort by name for consistency
    combinedRecords.sort((a, b) => {
      const lastNameA = a.name.split(' ').pop() || '';
      const lastNameB = b.name.split(' ').pop() || '';
      return lastNameA.localeCompare(lastNameB);
    });

    // Convert to CSV and save
    const csvContent = csvUnparse(combinedRecords, {
      header: true,
      skipEmptyLines: true,
    });

    writeFile(outputFile, csvContent);
    console.log(
      `Successfully created ${outputFile} with ${combinedRecords.length} total records`
    );

    // Log some statistics
    const senatorCount = combinedRecords.filter((r) =>
      r.name.startsWith(senator)
    ).length;
    const representativeCount = combinedRecords.filter((r) =>
      r.name.startsWith(representative)
    ).length;

    console.log(`Total fax records processed: ${faxRecords.length}`);
    console.log(
      `Total legislator records available: ${legislatorRecords.length}`
    );
    console.log(`Records with Senator title: ${senatorCount}`);
    console.log(`Records with Representative title: ${representativeCount}`);
    console.log(`Total output records: ${combinedRecords.length}`);

    // Log unmatched names
    if (unmatchedNames.length > 0) {
      console.log('\nNames that did not match with legislators-current.csv:');
      unmatchedNames.forEach((name) => {
        console.log(`  - ${name}`);
      });
    }
  } catch (error) {
    console.error('Error combining fax and legislator data:', error);
  }
}

// Allow direct execution of this script
if (import.meta.url === `file://${process.argv[1]}`) {
  US_generateCSVwithTitles();
}
