bash $HOME/kill_envs.sh
  
#echo "Generate data" 
#screen -Sd get_data -m bash -c "bash $HOME/pi-download/anylog_connector/get_data.sh $HOME/AnyLog-Network 0.03" 

#screen -Sd move_by_time -m bash -c "python3 source/move_by_time.py ~/AnyLog-Network/data/publisher/prep ~/AnyLog-Network/data/publisher/in" 

#echo "Start Operator"
sshpass -p 'demo' ssh -p 9022 -o StrictHostKeyChecking=no ubuntu@45.56.114.54 'screen -Sd anylog -m bash -c "python3 $HOME/AnyLog-Network/source/cmd/user_cmd.py process $HOME/pi-download/anylog_connector/multi_nodes/operator_init.anylog"'
sleep 10

echo "Start Query/Publisher and call Operator Main" 
screen -Sd anylog -m bash -c "python3 $HOME/AnyLog-Network/source/cmd/user_cmd.py process $HOME/pi-download/anylog_connector/multi_nodes/query_publisher_init.anylog"
