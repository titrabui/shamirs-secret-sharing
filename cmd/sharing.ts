import { Command } from 'commander';
import { split } from 'shamirs-secret-sharing';

require('dotenv').config()
const fs = require("fs");

const program = new Command();

const getEnvValue = (envName: string): string => {
  if (!envName) {
    throw new Error(`Unspecified environment variable`);
  }

  if (!(envName in process.env)) {
    throw new Error(`Environment variable ${envName} is not set`);
  }

  const value = process.env[envName] as string;
  if (!value) {
    throw new Error(`Environment variable ${envName} is not set`);
  }

  return value;
}

/* ========================================================== */
/* ======================= INTERFACE ======================== */
/* ========================================================== */

interface SSSOptions {
  shares: number,
  threshold: number
}

/* ========================================================== */
/* ===================== MAIN FUNCTIONS ===================== */
/* ========================================================== */

// Usage: node -r ts-node/register cmd/sharing.ts -f <path_secret_key> -s 3 -t 2

program
  .name('sharing')
  .version('v1.0.0')
  .requiredOption('-s, --shares <number>', 'The number of n shares that should be created for this secret')
  .requiredOption('-t, --threshold <number>', 'The number of t of n distinct share that are required to reconstruct this secret')

  .action(async (options: SSSOptions) => {
    try {
      const content = getEnvValue('PRIVATE_KEY');
      const secret = Buffer.from(content);
      const shares = split(secret, { shares: Number(options.shares), threshold: Number(options.threshold) });

      console.log('=================================================================\n')
      console.log('SPLITED FILES:\n')

      for (let i = 0; i < shares.length; i++) {
        const fileName = `shares/${i + 1}.txt`;   
        console.log(` ${fileName}`);
        await fs.writeFileSync(fileName, shares[i]);
      }

      console.log('\nSharing file successful 👍👍👍')
    } catch (error: any) {
      console.error(error);
    }
  });

program.showHelpAfterError('\n(add --help for additional information)');
program.parse();
