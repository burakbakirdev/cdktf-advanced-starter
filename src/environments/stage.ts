import { regionMain } from "../stacks/accounts/stage-provider.stack";
import { BaseEnvironment, CceClusterConfig, EcsConfig, NodePoolConfig, SecgrConfig, SubnetConfig, VpcConfig } from "./base-environment";

export class Stage extends BaseEnvironment {
  public get name(): string {
    return "xyz-stage";
  }

  public get environmentTag(): string {
    return "Staging";
  }

  public get envCidrPrefix(): string {
    return "10.11";
  }

  public get privateImageId(): string {
    return "9a63ea4b--200973731973"; // This is a private image ID, Change this or make a Data Search to obtain any Public Image ID.
  }

  public get commonKeyPairName(): string {
    return "KeyPair-burak"; // You can give adminPass field to the ECS configuration, or create your own key-pair in DEW service.
  }

  public get vpcConfig(): VpcConfig {
    return {
      name: `vpc-${this.name}`,
      cidr: `${this.envCidrPrefix}.0.0/16`,
      description: "Managed by Terraform.",
      tags: {
        ManagedBy: "Terraform",
        Environment: this.environmentTag,
      },
    };
  }

  public get subnetConfigs(): SubnetConfig[] {
    return [
      {
        name: `snet-${this.name}-ecs`,
        cidr: `${this.envCidrPrefix}.0.0/24`,
        gatewayIp: `${this.envCidrPrefix}.0.1`,
        description: "Managed by Terraform",
        tags: { ManagedBy: "Terraform", Environment: this.environmentTag },
      },
      {
        name: `snet-${this.name}-cce`,
        cidr: `${this.envCidrPrefix}.1.0/24`,
        gatewayIp: `${this.envCidrPrefix}.1.1`,
        description: "Managed by Terraform.",
        tags: { ManagedBy: "Terraform", Environment: this.environmentTag },
      },
    ];
  }

  public get secgrConfigs(): SecgrConfig[] {
    return [
      {
        name: `secgr-${this.name}-a`,
        description: "Managed by Terraform.",
        tags: { ManagedBy: "Terraform", Environment: this.environmentTag },
        rules: [
          {
            direction: "ingress",
            ethertype: "IPv4",
            protocol: "tcp",
            portRange: "6666",
            remoteIpPrefix: "0.0.0.0/0",
          },
        ],
      },
      {
        name: `secgr-${this.name}-b`,
        description: "Managed by Terraform.",
        tags: { ManagedBy: "Terraform", Environment: this.environmentTag },
        rules: [
          {
            direction: "ingress",
            ethertype: "IPv4",
            protocol: "tcp",
            portRange: "443",
            remoteIpPrefix: "0.0.0.0/0",
          },
        ],
      },
      {
        name: `secgr-${this.name}-db`,
        description: "Managed by Terraform.",
        tags: { ManagedBy: "Terraform", Environment: this.environmentTag },
        rules: [
          {
            direction: "ingress",
            ethertype: "IPv4",
            protocol: "tcp",
            portRange: "5432",
            remoteIpPrefix: "10.15.5.5/32",
            remoteGroupNames: [`secgr-${this.name}-a`, `secgr-${this.name}-b`],
          },
          {
            direction: "ingress",
            ethertype: "IPv4",
            protocol: "tcp",
            portRange: "22",
            remoteIpPrefix: "10.15.5.5/32",
          },
          {
            direction: "ingress",
            ethertype: "IPv4",
            protocol: "tcp",
            portRange: "5432",
            remoteIpPrefix: "10.66.6.6/32",
          },
        ],
      },
    ];
  }

  public get nginxEcsConfigs(): EcsConfig[] {
    return [
      {
        name: `ecs-${this.name}-nginx-01`,
        // imageId: this.privateImageId,
        flavorId: "c7n.large.2",
        // keyPair: this.commonKeyPairName,
        adminPass: "Huawei123@", // Use this or key-pair.
        systemDiskType: "GPSSD",
        systemDiskSize: 40,
        subnetName: `snet-${this.name}-ecs`,
        availabilityZone: `${regionMain}a`,
        securityGroupName: [`secgr-${this.name}-b`],
        description: "Managed by Terraform.",
        tags: {
          ManagedBy: "Terraform",
          Environment: this.environmentTag,
        },
      },
      {
        name: `ecs-${this.name}-nginx-02`,
        // imageId: this.privateImageId,
        flavorId: "c7n.large.2",
        // keyPair: this.commonKeyPairName,
        adminPass: "Huawei123@",
        systemDiskType: "GPSSD",
        systemDiskSize: 40,
        subnetName: `snet-${this.name}-ecs`,
        availabilityZone: `${regionMain}b`,
        securityGroupName: [`secgr-${this.name}-b`],
        description: "Managed by Terraform.",
        tags: {
          ManagedBy: "Terraform",
          Environment: this.environmentTag,
        },
      },
    ];
  }

  public get cceClusterConfig(): CceClusterConfig {
    return {
      name: `cce-${this.name}`,
      flavorId: "cce.s1.small",
      containerNetworkType: "eni",
      clusterVersion: "v1.31",
      availabilityZones: [`${regionMain}a`],
      subnetName: `snet-${this.name}-cce`,
      description: "Managed by Terraform",
      tags: {
        ManagedBy: "Terraform",
      },
    };
  }

  public get nodePoolConfig(): NodePoolConfig[] {
    return [
      {
        name: `cce-node-pool-${this.name}-az1`,
        os: `Ubuntu 22.04`,
        initialNodeCount: 1,
        flavorId: "c7n.4xlarge.2",
        availabilityZone: `${regionMain}a`,
        keyPair: this.commonKeyPairName,
        scallEnable: true,
        minNodeCount: 1,
        maxNodeCount: 2,
        scaleDownCooldownTime: 60,
        type: "vm",
        runtime: "containerd",
        rootVolumeType: "SAS",
        rootVolumeSize: 50,
        dataVolumeType: ["SAS"],
        dataVolumeSize: [100],
      },
      {
        name: `cce-node-pool-${this.name}-az2`,
        os: `Ubuntu 22.04`,
        initialNodeCount: 1,
        flavorId: "c7n.4xlarge.2",
        availabilityZone: `${regionMain}b`,
        keyPair: this.commonKeyPairName,
        scallEnable: true,
        minNodeCount: 1,
        maxNodeCount: 2,
        scaleDownCooldownTime: 60,
        type: "vm",
        runtime: "containerd",
        rootVolumeType: "SAS",
        rootVolumeSize: 50,
        dataVolumeType: ["SAS"],
        dataVolumeSize: [100],
      },
    ];
  }
}
