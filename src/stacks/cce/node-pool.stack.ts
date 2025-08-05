import { Construct } from "constructs";
import { BaseEnvironment } from "../../environments/base-environment";
import { CceNodePool } from "../../../.gen/providers/huaweicloud/cce-node-pool";
import { CceClusterStack } from "./cce-cluster.stack";

export class NodePoolStack extends Construct {
  constructor(scope: Construct, id: string, environment: BaseEnvironment, cceClusterStack: CceClusterStack) {
    super(scope, id);

    for (const config of environment.nodePoolConfig) {
      new CceNodePool(this, `node-pool-${config.name}`, {
        clusterId: cceClusterStack.cceClusterId,
        name: config.name,
        os: config.os,
        initialNodeCount: config.initialNodeCount,
        flavorId: config.flavorId,
        availabilityZone: config.availabilityZone,
        keyPair: config.keyPair,
        scallEnable: config.scallEnable,
        minNodeCount: config.minNodeCount,
        maxNodeCount: config.maxNodeCount,
        scaleDownCooldownTime: config.scaleDownCooldownTime,
        type: config.type,
        runtime: config.runtime,
        rootVolume: {
          size: config.rootVolumeSize,
          volumetype: config.rootVolumeType,
        },
        dataVolumes: [
          {
            size: config.dataVolumeSize[0],
            volumetype: config.dataVolumeType[0],
          },
        ],
      });
    }
  }
}
