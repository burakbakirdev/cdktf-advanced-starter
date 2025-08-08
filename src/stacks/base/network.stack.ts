import { Construct } from "constructs";
import { BaseEnvironment } from "../../environments/base-environment";
import { Vpc } from "../../../.gen/providers/huaweicloud/vpc/index";
import { VpcSubnet } from "../../../.gen/providers/huaweicloud/vpc-subnet/index";
// import { NatGateway } from "../../../.gen/providers/huaweicloud/nat-gateway/index";
// import { NatSnatRule } from "../../../.gen/providers/huaweicloud/nat-snat-rule/index";
// import { VpcEip } from "../../../.gen/providers/huaweicloud/vpc-eip";

// Please remove all comment lines to deploy a application on CCE.

export class NetworkStack extends Construct {
  private vpc: Vpc;
  private subnets = new Map<string, VpcSubnet>();
  // private nat: NatGateway;
  // private snat: NatSnatRule;

  constructor(scope: Construct, id: string, environment: BaseEnvironment) {
    super(scope, id);

    this.vpc = new Vpc(this, `${environment.vpcConfig.name}`, {
      name: environment.vpcConfig.name,
      cidr: environment.vpcConfig.cidr,
      description: environment.vpcConfig.description,
      tags: environment.vpcConfig.tags,
    });

    for (const net of environment.subnetConfigs) {
      let number = 1;
      this.subnets.set(
        `${net.name}`,
        new VpcSubnet(this, `${net.name}-${number}`, {
          vpcId: this.vpc.id,
          name: net.name,
          cidr: net.cidr,
          gatewayIp: net.gatewayIp,
          description: net.description,
          tags: net.tags,
        })
      );
      number++;
    }

    // const eip = new VpcEip(this, `eip-cce`, {
    //   publicip: {
    //     type: "5_bgp",
    //   },
    //   bandwidth: {
    //     shareType: "PER",
    //     name: `nat`,
    //     size: 300,
    //     chargeMode: "traffic",
    //   },
    // });

    // this.nat = new NatGateway(this, "nat", {
    //   name: `nat-${environment.name}`,
    //   spec: "1",
    //   vpcId: this.vpc.id,
    //   subnetId: this.getSubnetId(`snet-${environment.name}-cce`),
    // });

    // this.snat = new NatSnatRule(this, "snat", {
    //   natGatewayId: this.nat.id,
    //   floatingIpId: eip.id,
    //   subnetId: this.getSubnetId(`snet-${environment.name}-cce`),
    //   sourceType: 0,
    // });
  }

  public get vpcId(): string {
    return this.vpc.id;
  }

  public getSubnetId(name: string): string {
    if (this.subnets.has(name)) {
      return this.subnets.get(name)!.id;
    }
    throw new Error(`Invalid subnet ${name}`);
  }

  public getSubnetIpV4Id(name: string): string {
    if (this.subnets.has(name)) {
      return this.subnets.get(name)!.ipv4SubnetId;
    }
    throw new Error(`Invalid subnet ${name}`);
  }

  // public get natId(): string {
  //   return this.nat.id;
  // }

  // public get snatId(): string {
  //   return this.snat.id;
  // }
}
