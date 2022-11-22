import { TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";

export class GenericContractCaller {
  readonly signer: Signer;
  readonly contract: Contract;
  readonly confirmations: number;

  txReceipt?: TransactionReceipt;
  txResponse?: TransactionResponse;

  constructor(contract: Contract, signer: Signer, confirmations?: number) {
    this.signer = signer;
    this.contract = contract.connect(this.signer);

    this.confirmations = confirmations ? confirmations : 1;
  }

  // non blocking method, it will return a Promise<TransactionResponse>.
  async call(methodName: string, ...args: Array<any>): Promise<any> {
    if (this.contract[methodName] == undefined) {
      throw Error(`Method ${methodName} not found in contract`);
    }

    return this.contract[methodName](...args);
  }

  // blocking method, it will return the TransactionResponse and TransactionReceipt held by this.
  async blockCall(methodName: string, ...args: Array<any>) {
    if (this.contract[methodName] == undefined) {
      throw Error(`Method ${methodName} not found in contract`);
    }

    const func = this.contract[methodName];
    this.txResponse = await func(...args);
    this.txReceipt = await this.txResponse?.wait(this.confirmations);
    return this.txReceipt;
  }
}
