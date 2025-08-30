import {
  type PathOrFileDescriptor,
  type WriteFileOptions,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

export function writeFile(
  filename: PathOrFileDescriptor,
  data: string | NodeJS.ArrayBufferView,
  options?: Omit<WriteFileOptions, 'null'>
) {
  writeFileSync(filename, data, { encoding: 'utf-8', ...options });
}

export { path };
