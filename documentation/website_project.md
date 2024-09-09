## Step by step guide - Run a web server in a Linux VM
### Pre-Requisites
- Create an aws account
[AWS account](aws.amazon.com)
- Install the aws cli
follow aws [documentation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
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
- Launch an EC2 instance
aws [documentation](https://docs.aws.amazon.com/cli/v1/userguide/cli-services-ec2-instances.html) as a guide

