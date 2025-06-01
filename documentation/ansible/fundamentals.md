### Ping moodule
This can be used as a simple test for connectivity to the remote server/system
INI format for an inventory file is simpler but I work more with YAML format
if you have an inventory file (INI) ~/ansible/hosts
```
[servers]
node1 ansible_host=10.1.1.50
node2 ansible_host=10.1.1.51
node3 ansible_host=10.1.1.52
```
in ~/ansible to simply test network connectivity (without ansible)
```
ping node1 
```

test through ansible. Meaning - Can ansible make an SSH connection to server and does it have python installed on it? Required for ansible to work
```
ansible -i hosts servers -m ping
```
ansible inventory file server group module ping
