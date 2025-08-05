export interface VpcConfig {
  name: string;
  cidr: string;
  description: string;
  tags: Record<string, string>;
}

export interface SubnetConfig {
  name: string;
  availabilityZone?: string;
  cidr: string;
  gatewayIp: string;
  description: string;
  tags: Record<string, string>;
}

export interface SecgrConfig {
  name: string;
  description: string;
  tags: Record<string, string>;
  rules: RuleConfig[];
}

export interface RuleConfig {
  direction: "ingress" | "egress";
  ethertype: "IPv4";
  protocol: string;
  portRange: string;
  remoteIpPrefix?: string;
  remoteGroupNames?: string[];
}

export interface EcsConfig {
  name: string;
  flavorId: string;
  imageId?: string;
  securityGroupName: string[];
  subnetName: string;
  fixedIpV4?: string;
  availabilityZone: string;
  systemDiskType: string;
  systemDiskSize: number;
  adminPass?: string;
  keyPair?: string;
  description: string;
  tags: Record<string, string>;
}

export interface CceClusterConfig {
  name: string;
  flavorId: string;
  containerNetworkType: string;
  clusterVersion: string;
  availabilityZones: string[];
  subnetName: string;
  description: string;
  tags: Record<string, string>;
}

export interface NodePoolConfig {
  name: string;
  os: string;
  nodeImageId?: string;
  initialNodeCount: number;
  flavorId: string;
  availabilityZone?: string;
  keyPair: string;
  scallEnable?: boolean;
  minNodeCount?: number;
  maxNodeCount?: number;
  scaleDownCooldownTime?: number;
  priority?: number;
  type: string;
  runtime: string;
  rootVolumeType: string;
  rootVolumeSize: number;
  dataVolumeType: string[];
  dataVolumeSize: number[];
}

export abstract class BaseEnvironment {
  public abstract get name(): string;
  public abstract get environmentTag(): string;
  public abstract get envCidrPrefix(): string;
  public abstract get privateImageId(): string;
  public abstract get commonKeyPairName(): string;

  // Network
  public abstract get vpcConfig(): VpcConfig;
  public abstract get subnetConfigs(): SubnetConfig[];
  public abstract get secgrConfigs(): SecgrConfig[];

  // ECS
  public abstract get nginxEcsConfigs(): EcsConfig[];

  // CCE
  public abstract get cceClusterConfig(): CceClusterConfig;
  public abstract get nodePoolConfig(): NodePoolConfig[];
}
