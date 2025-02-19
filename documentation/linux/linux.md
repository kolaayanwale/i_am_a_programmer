- list of block devices attached to your linux workstation
lsblk

sudo fdisk -l 

- see disk space usage 
df -h 

- list all of the storage devices mounted on the system
mount

- unmount a device. #can use path or device name
sudo umount /tmp 

- manage disk partitions. It allows you to view, create, delete, resize, and modify partitions on a hard disk.
sudo fdisk

- format a partition with a file system. mkfs.ext4 for linux
sudo mkfs

- scans file system to let you know what is using the most space. often not installed by default
ncdu

- static file system info. i.e these disks are mounted at boot
cat /etc/fstab 

- repeat the same command every 2 seconds
watch

- truncate a file to 0
truncate -s 0 <filename>

- check processes
ps -ef

systemctl

- check logs for jenkins
sudo journalctl -u jenkins --no-pager

### Error: Built in node had no space on the /tmp directory to run a Jenkins job
### Solution: Resize the /tmp directory to be greater than 1GB
* Since /tmp is tmpfs, it’s using RAM, not disk.
* You resize it by remounting with a larger size (mount -o remount,size=2G /tmp).
* To make it permanent, update /etc/fstab.
* wait a few minutes to reconnect after rebooting
```
df -h /tmp
sudo mount -o remount,size=2G /tmp
sudo nano /etc/fstab
#new line if missing -> tmpfs /tmp tmpfs defaults,size=2G 0 0
sudo reboot
```

### Error: sudo required a password from jenkins
### Solution: allow jenkins user to run sudo without requiring a password
* Figure out which user is running Jenkins. usually jenkins
```
ps -ef | grep jenkins
```
* modify visudo
```
sudo visudo
```
* Add: jenkins ALL=(ALL) NOPASSWD: /usr/bin/dnf 