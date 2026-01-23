import { defineFunction } from "@aws-amplify/backend";

export const cognitoPostConfirmation = defineFunction({
  name: "cognito-post-confirmation",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  resourceGroupName: "auth",
});
