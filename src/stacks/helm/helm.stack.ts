import { Construct } from "constructs";
import { Fn } from "cdktf";
import { HelmProvider } from "@cdktf/provider-helm/lib/provider";
import { Release } from "@cdktf/provider-helm/lib/release";
import { CceClusterStack } from "../cce/cce-cluster.stack";

export class HelmStack extends Construct {
  constructor(scope: Construct, id: string, cceClusterStack: CceClusterStack) {
    super(scope, id);

    new HelmProvider(this, "helm", {
      kubernetes: {
        host: `https://${cceClusterStack.eip.address}:5443`,
        clusterCaCertificate: Fn.base64decode(cceClusterStack.cceCluster.certificateClusters.get(0).certificateAuthorityData),
        clientKey: Fn.base64decode(cceClusterStack.cceCluster.certificateUsers.get(0).clientKeyData),
        clientCertificate: Fn.base64decode(cceClusterStack.cceCluster.certificateUsers.get(0).clientCertificateData),
      },
    });

    new Release(this, "helm-releae-traefik", {
      name: "traefik-proxy",
      repository: "https://helm.traefik.io/traefik",
      chart: "traefik",
      createNamespace: true,
      namespace: "traefik",
      dependencyUpdate: true,
      timeout: 120,
      set: [
        {
          name: "service.type",
          value: "ClusterIP",
        },
      ],
    });
  }
}
