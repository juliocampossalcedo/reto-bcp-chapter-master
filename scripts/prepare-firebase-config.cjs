const fs = require('node:fs');
const path = require('node:path');

const configPath = path.resolve(
  __dirname,
  '../src/capabilities/auth/infrastructure/firebase/firebaseConfig.ts',
);

if (!fs.existsSync(configPath)) {
  fs.copyFileSync(`${configPath}.example`, configPath);
}
