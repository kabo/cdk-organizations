import { App, Aspects, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { AwsSolutionsChecks } from "cdk-nag";
import { Account, IamUserAccessToBilling, Organization } from "../src";

describe("Account", () => {
  it("Should match snapshot", () => {
    // Given
    const app = new App();
    const stack = new Stack(app, "Stack");
    const organization = new Organization(stack, "Organization", {});

    // When
    new Account(stack, "Account", {
      email: "info@pepperize.com",
      accountName: "test",
      parent: organization.root,
    });

    // Then
    const template = Template.fromStack(stack);
    expect(template).toMatchSnapshot();
  });

  it("Should have delegated administrator", () => {
    // Given
    const app = new App();
    const stack = new Stack(app, "Stack");
    const organization = new Organization(stack, "Organization", {});
    const account = new Account(stack, "Account", {
      email: "info@pepperize.com",
      accountName: "test",
      parent: organization.root,
    });

    // When
    account.delegateAdministrator("service-abbreviation.amazonaws.com");

    // Then
    const template = Template.fromStack(stack);
    template.resourceCountIs("Custom::Organization_DelegatedAdministrator", 1);
  });

  it("Should comply to best practices", () => {
    // Given
    const app = new App();
    const stack = new Stack(app, "Stack");
    const organization = new Organization(stack, "Organization", {});

    // When
    new Account(stack, "Account", {
      email: "info@pepperize.com",
      accountName: "test",
      roleName: "PreconfiguredRoleForNewMemberAccounts",
      iamUserAccessToBilling: IamUserAccessToBilling.DENY,
      parent: organization.root,
    });

    // Then
    Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
  });
});
