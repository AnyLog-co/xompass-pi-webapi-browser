echo "Stop and Clean screens" 
screen -S anylog -X quit
screen -wipe
sshpass -p 'demo' ssh -p 9022 -o StrictHostKeyChecking=no ubuntu@45.56.114.54 "screen -S anylog -X quit; screen -wipe"
