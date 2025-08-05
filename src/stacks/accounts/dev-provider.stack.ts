import { Construct } from "constructs";
import { HuaweicloudProvider } from "../../../.gen/providers/huaweicloud/provider/index";
import * as baseValues from "../../../base.values.json"; // same as main.ts directory.
import { S3Backend } from "cdktf";
import { BaseEnvironment } from "../../environments/base-environment";

export const regionMain = "";

export class DevProviderStack extends Construct {
  public hwcMain: HuaweicloudProvider;

  constructor(scope: Construct, id: string, environment: BaseEnvironment, stackName: string) {
    super(scope, id);

    this.hwcMain = new HuaweicloudProvider(this, `hwc-main-${regionMain}`, {
      enterpriseProjectId: "",
      region: regionMain,
      accessKey: baseValues.accounts.dev.keys.accessKey,
      secretKey: baseValues.accounts.dev.keys.secretKey,
    });

    new S3Backend(this, {
      bucket: `cdktf-${environment.name}-state`,
      key: `terraform/${environment.name}/terraform.${stackName}.tfstate`,
      region: regionMain,
      endpoints: {
        s3: `https://obs.${regionMain}.myhuaweicloud.com`,
      },
      skipRegionValidation: true,
      skipCredentialsValidation: true,
      skipMetadataApiCheck: true,
      skipRequestingAccountId: true,
      skipS3Checksum: true,
    });
  }
}
