import { Construct } from "constructs";
import { CceCluster } from "../../../.gen/providers/huaweicloud/cce-cluster";
import { CceClusterConfig } from "../../environments/base-environment";
import { NetworkStack } from "../base/network.stack";
import { VpcEip } from "../../../.gen/providers/huaweicloud/vpc-eip/index";

export class CceClusterStack extends Construct {
  public readonly cceCluster: CceCluster;
  public readonly eip: VpcEip;

  constructor(scope: Construct, id: string, config: CceClusterConfig, network: NetworkStack) {
    super(scope, id);

    this.eip = new VpcEip(this, `eip-cce`, {
      publicip: {
        type: "5_bgp",
      },
      bandwidth: {
        shareType: "PER",
        name: `cce`,
        size: 300,
        chargeMode: "traffic",
      },
    });

    this.cceCluster = new CceCluster(this, "cce", {
      name: config.name,
      flavorId: config.flavorId,
      containerNetworkType: config.containerNetworkType,
      clusterVersion: config.clusterVersion,
      masters: [
        {
          availabilityZone: config.availabilityZones[0],
        },
      ],
      vpcId: network.vpcId,
      subnetId: network.getSubnetId(config.subnetName),
      eniSubnetId: network.getSubnetIpV4Id(config.subnetName),
      eip: this.eip.address,
      description: config.description,
      tags: config.tags,
    });
  }

  public get cceClusterId(): string {
    return this.cceCluster.id;
  }
}
