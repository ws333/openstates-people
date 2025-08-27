import Papa from 'papaparse';

type Config = Parameters<typeof Papa.unparse>[1];

const defaultConfig: Config = {
  skipEmptyLines: true,
};

export function csvUnparse(data: unknown[], config: Config = defaultConfig) {
  return Papa.unparse(data, config);
}
