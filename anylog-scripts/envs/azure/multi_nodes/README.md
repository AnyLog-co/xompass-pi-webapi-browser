# Env
The following is a "clean" set-up that a user can easily change in order to connect a full cluster with Pi (Xompass). [Develop brach](https://github.com/AnyLog-co/pi-download/tree/demo/anylog_connector/multi_nodes) provides a a working multi-node system which one can use an example of what needs to be filled in.

Our set-up uses the following config 
* 2 Operator 
* 1 Publisher 
* 1 Query (Can be ran through publisher node) 
 
# Directions 
0. On all nodes update code to latest
```
cd $HOME/AnyLog-demo    # Source
git pull origin ${BRANCH_NAME} 

cd $HOME/pi-download/   # Scripts 
git pull origin ${BRANCH_NAME} 
``` 

1. Clean Env and Create Directory Structure 
```
# On  all nodes 
bash ~/AnyLog-demo/scripts/remove_dir_structure.sh ~/AnyLog-demo 
bash ~/AnyLog-demo/scripts/create_dir_structure.sh ~/AnyLog-demo 

# On Query and Publisher Nodes 
psql -d postgres "DROP DATABASE IF EXISTS system_query;"  

# On Operator Nodes
psql -d postgres "DROP DATABASE IF EXISTS ${database_name};" 
```

2. Update init_file – this needs to be done on all nodes 
```
# Update ip, ip_out and node_name 
cd $HOME/pi-download/anylog_connector/multi_nodes
vim init_env.anylog
``` 

3. Update config file – this needs to be done only on query node
```
cd $HOME/pi-download/anylog_connector/multi_nodes
vim config_all.anylog
# Update lines 7-10 with proper IP address. If machine seats on a cloud use DNS IPv4 Address. 
``` 
4. Install NodeJS (first time only) - Publisher Only
```
cd ~/
sudo apt-get -y install nvm

cd ~/pi-download/nodejs
npm install
```

5. Set Pi Configuration - Publisher Only 
```
# Option 1 - copy backed-up config files 
cd ~/pi-download
cp bkup_config_files/* nodejs/
cp bkup_config_files/* nodejs/config_files

# Option 2 - copy config in Xomposs 
cd ~/pi-download
cp ~/xompass-pi-webapi-browser/config_files/* nodejs 
cp ~/xompass-pi-webapi-browser/config_files/* nodejs/config_files
``` 
 
6. Start getting data from Pi - Publisher Only 
```
screen -Sd get_data -m bash -c "cd ~/pi-download/nodejs; bash $HOME/pi-download/anylog_connector/get_data.sh ~/AnyLog-demo 0.03"
```

7. Start AnyLog – on all nodes 
```
screen -S anylog -m bash -c "cd; "python3 $HOME/AnyLog-demo/source/cmd/user_cmd.py process $HOME/pi-download/anylog_connector/multi_nodes/init_env.anylog" 
```

8. Start query node - Query node only
```
AL > process $HOME/pi-download/anylog_connector/multi_nodes/query_main.anylog
```

9. Validate blockchain & config got transfered (OPTIONAL)
```
AL > system cat $HOME/pi-download/anylog_connector/multi_nodes/config_all.anylog
AL > system cat $HOME/AnyLog-demo/data/blockchain/blockchain.txt 
``` 

10. Start Operator Nodes 
```
AL > process $HOME/pi-download/anylog_connector/multi_nodes/operator_main.anylog
``` 

11. Start Publisher 
```
AL > process $HOME/pi-download/anylog_connector/multi_nodes/publisher_main.anylog
```

# Notes
* When `AL` is declared in the first part of the code, note it is *not* a command, but rather decleration informing user we s/he is now in AnyLog, rather than bash.
* To exit screen execute `ctrl+a+d` and to reenter `screen -R ${screen_name}`
* You can visit the [demo branch](https://github.com/AnyLog-co/pi-download/tree/demo/anylog_connector/multi_nodes) for a working example. 

## Example 
```
# Start process 
screen -S anylog -m bash -c "cd; "python3 $HOME/AnyLog-demo/source/cmd/user_cmd.py process $HOME/pi-download/anylog_connector/multi_nodes/init_env.anylog" 

# Execute processes 

# exit screen 
ctrl+a+d 

# re-enter 
screen -R anylog 
```

