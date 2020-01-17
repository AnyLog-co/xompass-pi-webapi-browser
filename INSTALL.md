# Install Process 
The following document is suppose to help understand how to communicate with the PI Web API

## VPN 
[OpenVPN](https://www.ovpn.com/en/guides/) is needed only for Lite San Leandro config, but is not a must for default config.

* [Install OpenVPN on Ubuntu via Command Line][(https://www.ovpn.com/en/guides/ubuntu-cli)  
* Start OpenVPN 
**Commnad**: `sudo bash $HOME/xompass-pi-webapi-browswer/support/run_vpn.sh`
[OpenVPN](https://www.ovpn.com/en/guides/) is needed only for Lite San Leandro config (the default install doesn't require OpenVPN)

* [Install OpenVPN on Ubuntu via Command Line](https://www.ovpn.com/en/guides/ubuntu-cli)

`sudo bash $HOME/xompass-pi-webapi-browser/support/install_vpn.sh ${instance_user_name} ${instance_user_password}` 

* Start OpenVPN 

`sudo bash $HOME/xompass-pi-webapi-browswer/support/run_vpn.sh`

## Setting Up Xompass 
1. Make sure port 7400 is open for communication 
2. Install npm: `sudo apt -y install npm`
3. Clone Xompass: `git clone https://github.com/AnyLog-co/xompass-pi-webapi-browser` 

### Connecting directly between AnyLog + PI (master node) 
Using API calls (via [AnyLog Network](https://github.com/AnyLog-co/AnyLog-Network)) communicate with the PI Web API  
1. Checkout master (needed whenever `origin/master` is updated): `cd $HOME/xompass-pi-webapi-browser ; git checkout master; git pull origin master`
2. Copy config (needed only when switching between branches or configs): `cp -r $HOME/xompass-pi-webapi-browser/bkup_config_files/lsl_config_files/*  $HOME/xompass-pi-webapi-browser/config_files`
3. Install npm (needed only when switching between branches or configs): `cd $HOME/xompass-pi-webapi-browser ; npm install` 
4. Start process as a screen (needed everytime): `screen -Sd xompass -m bash -c "cd $HOME/xompass-pi-webapi-browser/ ; npm start"`

### Store data from PI in file (anylog-live) 
Data generated via PI is stored into $HOME/xompass-pi-webapi-browser/out1. 
1. Checkout anylog-live (needed whenever `origin/anylog-live` is updated): `cd $HOME/xompass-pi-webapi-browser ; git checkout anylog-live; git pull origin anylog-live ; mkdir -p $HOME/xompass-pi-webapi-browser/output_data` 
 2. Copy config (needed only when switching between branches or configs): `cp -r $HOME/xompass-pi-webapi-browser/bkup_config_files/lsl_config_files/*  $HOME/xompass-pi-webapi-browser/config_files`
3. Install npm (needed only when switching between branches or configs): `cd $HOME/xompass-pi-webapi-browser ; npm install`
4. Start process as a screen (needed everytime): `screen -Sd xompass -m bash -c "cd $HOME/xompass-pi-webapi-browser/ ; npm start"`
5. Access PI Web via browser (URL: `{xompass-location-ip}:7400`) 
6. Under PI Elements, select devices/sensors you want to get data from 

### Connecting directly between AnyLog + PI Instance (branch: master)  
Using API calls (via [AnyLog Network](https://github.com/AnyLog-co/AnyLog-Network)) communicate with the PI Web API  
1. Checkout master (needed whenever `origin/master` is updated): 

`cd $HOME/xompass-pi-webapi-browser ; git checkout master; git pull origin master`


2. Copy config (needed only when switching between branches or configs): 

`cp -r $HOME/xompass-pi-webapi-browser/bkup_config_files/lsl_config_files/*  $HOME/xompass-pi-webapi-browser/config_files`

3. Install npm (needed only when switching between branches or configs): 

`cd $HOME/xompass-pi-webapi-browser ; npm install` 

4. Start process as a screen (needed everytime): 

`screen -Sd xompass -m bash -c "cd $HOME/xompass-pi-webapi-browser/ ; npm start"`

### Store data from PI Instance in file (branch: anylog-live) 
Data generated via PI Interface is stored into $HOME/xompass-pi-webapi-browser/output_data 
1. Checkout anylog-live (needed whenever `origin/anylog-live` is updated): 

`cd $HOME/xompass-pi-webapi-browser ; git checkout anylog-live; git pull origin anylog-live ; mkdir -p $HOME/xompass-pi-webapi-browser/output_data` 

2. Copy config (needed only when switching between branches or configs): 

`cp -r $HOME/xompass-pi-webapi-browser/bkup_config_files/lsl_config_files/*  $HOME/xompass-pi-webapi-browser/config_files`

3. Install npm (needed only when switching between branches or configs): 

`cd $HOME/xompass-pi-webapi-browser ; npm install`

4. Start process as a screen (needed everytime): 

`screen -Sd xompass -m bash -c "cd $HOME/xompass-pi-webapi-browser/ ; npm start"`

5. Access PI Web via browser (URL: `{xompass-location-ip}:7400`) 

6. Under PI Elements, select devices/sensors you want to get data from 

Data will be stored in $HOME/xompass-pi-webapi-browser/output_data

## Stop Xompass 
Givne that xompass will be runnining in a screen, a user needs to just kill the screen in order to stop the process 
`screen -S xompass -X Quit` 
