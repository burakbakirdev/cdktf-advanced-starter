import { Construct } from "constructs";
import { NetworkingSecgroup } from "../../../.gen/providers/huaweicloud/networking-secgroup";
import { NetworkingSecgroupRule } from "../../../.gen/providers/huaweicloud/networking-secgroup-rule";
import { BaseEnvironment } from "../../environments/base-environment";

export class SecurityGroupsStack extends Construct {
  private groups = new Map<string, NetworkingSecgroup>();

  constructor(scope: Construct, id: string, environment: BaseEnvironment) {
    super(scope, id);

    for (const secgr of environment.secgrConfigs) {
      const secgrResource = new NetworkingSecgroup(this, secgr.name, {
        name: secgr.name,
        description: secgr.description,
        tags: secgr.tags,
      });

      this.groups.set(secgr.name, secgrResource);
    }

    // If the user configures the env files incorrectly, the following logic may result in an error.

    for (const secgr of environment.secgrConfigs) {
      const secgrResource = this.groups.get(secgr.name)!;

      for (const rule of secgr.rules) {
        const ports = rule.portRange.split(",");

        for (const port of ports) {
          const [min, max] = port.includes("-") ? port.split("-") : [port, port];

          if (rule.remoteGroupNames && rule.remoteGroupNames.length > 0) {
            for (const [i, remoteGroupName] of rule.remoteGroupNames.entries()) {
              new NetworkingSecgroupRule(this, `${secgr.name}-${min}-rg${i}`, {
                securityGroupId: secgrResource.id,
                direction: rule.direction,
                ethertype: rule.ethertype,
                protocol: rule.protocol,
                portRangeMin: parseInt(min),
                portRangeMax: parseInt(max),
                remoteGroupId: this.getSecgrId(remoteGroupName),
              });
            }
          }

          if (rule.remoteIpPrefix) {
            new NetworkingSecgroupRule(this, `${secgr.name}-${min}-ip-${rule.remoteIpPrefix}`, {
              securityGroupId: secgrResource.id,
              direction: rule.direction,
              ethertype: rule.ethertype,
              protocol: rule.protocol,
              portRangeMin: parseInt(min),
              portRangeMax: parseInt(max),
              remoteIpPrefix: rule.remoteIpPrefix,
            });
          }
        }
      }
    }
  }

  public getSecgrId(name: string): string {
    const group = this.groups.get(name);
    if (!group) {
      throw new Error(`Security group '${name}' not found.`);
    }
    return group.id;
  }
}
