## Step by step guide - Run a web server in a Linux VM
### Pre-Requisites
- Create an aws account
[AWS account](aws.amazon.com)
- Install the aws cli
follow aws [documentation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Create an IAM user so as to not use the Root account. Create group for the user and attach IAM policy (AdministratorAccess) to group.
- Note: AWS Identity center (SSO) is the recommended practice as credentials are temporary (Enable AWS Orgs and Identity Centre). User's secret key/access keys sufficient for this use case
- retrieve and save credentials. Configure aws cli
```
aws configure
```
- Create or use an existing [repo](github.com)

### Deploy ec2 instance
- Create a new directory and cd into it
```
mkdir website_project
cd website_project
```
Create a virtual environment
```
python3 -m venv .venv
source .venv/bin/activate
```
- [Install ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-and-upgrading-ansible-with-pip) in the virtual env for configuration
```
python3 -m pip install ansible 
```
- [Install terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
```
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```
- Create terraform and ansible directories
```
mkdir ansible terraform
```
### Terraform
- Create terraform layers
```
cd terraform
touch README.md
mkdir layer00 layer01 layer02
```
- Layer00 - Networking
```
cd layer00
touch main.tf providers.tf outputs.tf variables.tf terraform.tfvars
```
- Create terraform remote state
* Need to create s3 bucket to store state file and dynamodb table for state file locking
```
aws s3 mb s3://kola-playground/
```
