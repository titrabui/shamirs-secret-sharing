require('dotenv').config();

import path from "path";
import glob from "glob";
const fs = require('fs');

import { Contract } from "@ethersproject/contracts";
import { isAddress } from "@ethersproject/address";


export function isValidAddress(address: string): boolean {
  return isAddress(address) && (address != "0x0000000000000000000000000000000000000000");
}

function getContractsDir(): string {
  var dir:string = '';
  if (process.env.CONTRACTS_DIR_DEV){
    dir = path.join(process.env.CONTRACTS_DIR_DEV);
  } else {
    dir = path.join('artifacts','contracts');
  }

  const absDir:string = path.resolve(dir);
  if (!fs.existsSync(absDir)){
    throw new Error('Contracts directory not existed `${absDir}`');
  }
  return path.resolve(dir);
}

export function LoadAllContracts(): Map<string, Contract> {

  const dir:string = getContractsDir();

  const dirContracts: string[] = glob.sync(path.join(dir, '/**/*.sol'));

  var contracts = new Map<string, Contract>();
  dirContracts.forEach( (d) => {
    const contractName:string = path.basename(d, '.sol');
    try {
      const c:Contract = LoadContractWithAddress(contractName);
      contracts.set(contractName, c);
    } catch (err){
      console.log(`\nWARNING : failed to load contract in ${d}`);
      if (err instanceof Error) {
        console.log(err.message, '\n');
      } else {
        console.log(err);
      }
    }
  });

  return contracts;
}

export function LoadContractWithAddress(name:string): Contract {

  const dir:string = getContractsDir();

  const dirContracts: string[] = glob.sync(path.join(dir, `/**/${name}.sol`));
  if (dirContracts.length<1){
    throw Error(`Unable to find contract ${name}.sol in ${dir}`);
  }
  if (dirContracts.length>1){
    var errMsg:string = `Ambiguous contract name ${name}.sol in ${dir}\n`;
    dirContracts.forEach( (d) => {
      errMsg += `    ${d}\n`;
    });
    throw Error(errMsg);
  }

  const c = _loadContractFromDir(dirContracts[0]);
  return c;
}

function _loadContractFromDir(d:string): Contract {
  if (!fs.existsSync(d)){
    throw new Error(`Directory not existed ${d}`);
  }

  const contractName:string = path.basename(d, '.sol');
  const fileArtifact:string = path.join(d,`${contractName}.json`);
  const fileAcddress:string = path.join(d,'address.json');

  if (!fs.existsSync(fileArtifact)){
    throw new Error(`ABI file not existed for contract ${contractName}\n    [${fileArtifact}]`);
  }
  if (!fs.existsSync(fileAcddress)){
    throw new Error(`Address file not existed for contract ${contractName}\n    [${fileAcddress}]`);
  }

  const abi = require(fileArtifact).abi;
  const addr = require(fileAcddress).address;

  if (!isValidAddress(addr)) {
    throw new TypeError(`Invalid address ${contractName}[${addr}]\n    ${fileAcddress}`);
  }

  const c = new Contract(addr, abi);
  return c;
}