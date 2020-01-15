#!/usr/bin/bash 
if [ $# -ne 2 ]
then
   echo "ROOT_DIR max_file_size" 

   exit 1
fi 

ROOT_DIR=${1} 
file_size=${2} 

echo "set params" 
generate_data_prep=${ROOT_DIR}/data/prep 
publisher_dir_in=${ROOT_DIR}/data/watch 
#download_directory=$HOME/xompass-pi-webapi-browser/output_data
download_directory=$HOME/tmp
config_file=$HOME/xompass-pi-webapi-browser/anylog-scripts/source/get_data_config.yaml

timeout=60

bash $HOME/AnyLog-Network/scripts/create_dir_structure.sh ${ROOT_DIR} 

mkdir -p $HOME/xompass-pi-webapi-browser/output_data
sleep 10 

python3 $HOME/xompass-pi-webapi-browser/anylog-scripts/source/get_data.py ${generate_data_prep} ${publisher_dir_in} ${file_size} -ts ${timeout} -dd ${download_directory}  -jcf ${config_file} 

