import { combine } from 'shamirs-secret-sharing';
import { Command } from 'commander';
import { Contract } from "@ethersproject/contracts";
import { GetSignerFromEnv } from '../common/SignerLoader';
import { LoadAllContracts } from '../common/ContractLoader';
import { GenericContractCaller } from '../common/GenericContractCaller';

const fs = require("fs");
const program = new Command();

/* ========================================================== */
/* ======================= INTERFACE ======================== */
/* ========================================================== */

const parseFiles = (value: any, _: any) => {
  if (!value) return [];

  const files = value.split(',');
  if (files.length === 0) return [];
  return files;
}

interface SSSOptions {
  pathFiles: string[],
  to: string
}

/* ========================================================== */
/* ===================== MAIN FUNCTIONS ===================== */
/* ========================================================== */

// Usage: node -r ts-node/register cmd/combine.ts -f <path_1>,<path_2>,<...>

program
  .name('combine')
  .version('v1.0.0')
  .requiredOption('-f, --path-files <string>', 'The list key file contain path secret key', parseFiles, [])

  .action(async (options: SSSOptions) => {
    try {
      // Recover private key
      const splitedTokens = [];
      for (let i = 0; i < options.pathFiles.length; i++) {
        const content = await fs.readFileSync(options.pathFiles[i]);
        splitedTokens.push(content);
      }
      const recovered = combine(splitedTokens);

      console.log('=================================================================\n')
      console.log('RECOVERED KEY:', recovered.toString())
      console.log('\n=================================================================\n')
      console.log('Minting NFT ...')

      // Load contract instance
      const contracts = LoadAllContracts();
      const contractIns = contracts.get('TokenERC721') as Contract;

      // Load signer instance
      const signer = GetSignerFromEnv(recovered.toString(), 'https://data-seed-prebsc-1-s1.binance.org:8545/');

      // Connect signer to contract
      const contract = new GenericContractCaller(contractIns, signer);

      // Sign and send transaction
      const txResponse = await contract.blockCall('mint', ...[await signer.getAddress()]);

      console.log('Minted NFT successful 👍👍👍')
      console.log(`Transaction hash: ${txResponse.transactionHash}`)
    } catch (error: any) {
      console.error(error);
    }
  });

program.showHelpAfterError('\n(add --help for additional information)');
program.parse();
