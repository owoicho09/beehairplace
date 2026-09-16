declare module "@paystack/inline-js" {
  export type PopupTransactionResponse = {
    reference: string;
    status?: string;
    message?: string;
    trans?: string;
    transaction?: string;
  };

  export type ResumeTransactionOptions = {
    onSuccess?: (response: PopupTransactionResponse) => void;
    onCancel?: () => void;
    onLoad?: (response: unknown) => void;
    onError?: (error: unknown) => void;
  };

  export default class PaystackPop {
    constructor();
    newTransaction(options: Record<string, unknown>): unknown;
    resumeTransaction(accessCode: string, options?: ResumeTransactionOptions): unknown;
  }
}
