# Creating required Folders with Ansible

This a simple playbook to create the necessary prerequisites for installing a sharded MongoDB cluster on all required cluster nodes


Please adapt the playbook to your needs be changing the list of shards in `setup-cluster-nodes.yaml`
`shards` lists all the shards that should be created by name.

You can run this playbook using the following command:

`ansible-playbook setup-cluster-nodes.yaml -e node_grp=[your_host_group]`

`node_grp` is the host group as defined in your
ansible hosts file (eg. `/etc/ansible/hosts`).
