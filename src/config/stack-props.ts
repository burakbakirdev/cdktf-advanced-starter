import { BaseEnvironment } from "../environments/base-environment";

export interface StackProps {
  accountSuffix: string;
  stackName: string;
  environment: BaseEnvironment;
  region?: string;
  tags?: Record<string, string>;
  enableSecurityFeatures?: boolean;
}
