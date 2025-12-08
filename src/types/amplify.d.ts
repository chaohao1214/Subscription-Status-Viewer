declare module "../../amplify_outputs.json" {
  interface AmplifyOutputs {
    auth: {
      user_pool_id: string;
      aws_region: string;
      user_pool_client_id: string;
      identity_pool_id: string;
    };
    custom?: {
      lambdaFunctions?: {
        getSubscriptionStatus: string;
        createBillingPortal: string;
      };
    };
  }

  const outputs: AmplifyOutputs;
  export default outputs;
}
