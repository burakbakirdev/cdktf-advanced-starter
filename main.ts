import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Development } from "./src/environments/development";
import { Stage } from "./src/environments/stage";
import { Production } from "./src/environments/production";
import { DevProviderStack } from "./src/stacks/accounts/dev-provider.stack";
import { StageProviderStack } from "./src/stacks/accounts/stage-provider.stack";
import { ProdProviderStack } from "./src/stacks/accounts/prod-provider.stack";
import { NetworkStack } from "./src/stacks/base/network.stack";
import { StackProps } from "./src/config/stack-props";
import { SecurityGroupsStack } from "./src/stacks/base/security-group.stack";
import { CceClusterStack } from "./src/stacks/cce/cce-cluster.stack";
import { NodePoolStack } from "./src/stacks/cce/node-pool.stack";
import { NginxEcsStack } from "./src/stacks/ecs/nginx-ecs.stack";
import { HelmStack } from "./src/stacks/helm/helm.stack";

class DevBaseStack extends TerraformStack {
  public network: NetworkStack;
  public secgr: SecurityGroupsStack;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    const { accountSuffix, stackName, environment } = props;

    new DevProviderStack(this, `hwc-${accountSuffix}`, environment, stackName);
    this.network = new NetworkStack(this, `network-${accountSuffix}`, environment);
    this.secgr = new SecurityGroupsStack(this, `secgr-${accountSuffix}`, environment);
  }
}

class DevEcsStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: StackProps, devBaseStack: DevBaseStack) {
    super(scope, id);

    const { accountSuffix, stackName, environment } = props;

    new DevProviderStack(this, `hwc-${accountSuffix}`, environment, stackName);

    new NginxEcsStack(this, `nginx-proxy-ecs-${accountSuffix}`, environment, devBaseStack.network, devBaseStack.secgr);
  }
}

class DevCceClusterStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: StackProps, devBaseStack: DevBaseStack) {
    super(scope, id);

    const { accountSuffix, stackName, environment } = props;

    new DevProviderStack(this, `hwc-${accountSuffix}`, environment, stackName);

    const cce = new CceClusterStack(this, `cce-cluster-${accountSuffix}`, environment.cceClusterConfig, devBaseStack.network);
    new NodePoolStack(this, `node-pool-${accountSuffix}`, environment, cce);
    new HelmStack(this, `helm-${accountSuffix}`, cce);
  }
}

class StageBaseStack extends TerraformStack {
  public network: NetworkStack;
  public secgr: SecurityGroupsStack;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    const { accountSuffix, stackName, environment } = props;

    new StageProviderStack(this, `hwc-${accountSuffix}`, environment, stackName);
    this.network = new NetworkStack(this, `network-${accountSuffix}`, environment);
    this.secgr = new SecurityGroupsStack(this, `secgr-${accountSuffix}`, environment);
  }
}
class ProdBaseStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    const { accountSuffix, stackName, environment } = props;

    new ProdProviderStack(this, `hwc-${accountSuffix}`, environment, stackName);
    new NetworkStack(this, `network-${accountSuffix}`, environment);
  }
}

const app = new App();

// Dev
const devBaseStack = new DevBaseStack(app, "dev-base", {
  accountSuffix: "dev-account",
  stackName: "dev-base",
  environment: new Development(),
});
new DevEcsStack(
  app,
  "dev-ecs",
  {
    accountSuffix: "dev-account",
    stackName: "dev-ecs",
    environment: new Development(),
  },
  devBaseStack
);
new DevCceClusterStack(
  app,
  "dev-cce-cluster",
  {
    accountSuffix: "dev-account",
    stackName: "dev-cce-cluster",
    environment: new Development(),
  },
  devBaseStack
);

// Stage
new StageBaseStack(app, "stage-base", {
  accountSuffix: "stage-account",
  stackName: "stage-base",
  environment: new Stage(),
});

// Prod
new ProdBaseStack(app, "prod-base", { accountSuffix: "prod-account", stackName: "prod-base", environment: new Production() });

app.synth();
