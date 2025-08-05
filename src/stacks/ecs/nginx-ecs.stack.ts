import { Construct } from "constructs";
import { BaseEnvironment } from "../../environments/base-environment";
import { NetworkStack } from "../base/network.stack";
import { SecurityGroupsStack } from "../base/security-group.stack";
import { ComputeInstance } from "../../../.gen/providers/huaweicloud/compute-instance/index";
import { DataHuaweicloudImagesImage } from "../../../.gen/providers/huaweicloud/data-huaweicloud-images-image/index";

export class NginxEcsStack extends Construct {
  constructor(scope: Construct, id: string, environment: BaseEnvironment, network: NetworkStack, secgr: SecurityGroupsStack) {
    super(scope, id);

    const imageId = new DataHuaweicloudImagesImage(this, "ubuntu", { name: "Ubuntu 24.04 server 64bit", visibility: "public" }).id;

    for (const config of environment.nginxEcsConfigs) {
      new ComputeInstance(this, config.name, {
        name: config.name,
        imageId: config.imageId ? config.imageId : imageId,
        flavorId: config.flavorId,
        adminPass: config.adminPass ? config.adminPass : undefined,
        keyPair: config.keyPair ? config.keyPair : undefined,
        systemDiskType: config.systemDiskType,
        systemDiskSize: config.systemDiskSize,
        network: [
          {
            uuid: network.getSubnetId(config.subnetName),
            fixedIpV4: config.fixedIpV4 ?? undefined,
          },
        ],
        availabilityZone: config.availabilityZone,
        securityGroupIds: [secgr.getSecgrId(config.securityGroupName[0])],
        description: config.description,
        tags: config.tags,
      });
    }
  }
}
