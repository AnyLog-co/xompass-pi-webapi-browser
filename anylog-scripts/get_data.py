import argparse
import json 
import os 
import time

def __get_file(dir_name:str, file_name:str)->str: 
   """
   From dir_name get file_name containing file_name
   :args: 
      dir_name:str - directory to search for file 
      file_name:str - string that's part of the file name 
   :return: 
      fuull file name
   """
   data_file = None 
   for fn in os.listdir(dir_name): 
      if file_name in fn and '/' == dir_name[-1]:
         data_file = dir_name + fn  
      if file_name in fn and '/' != dir_name[-1]:
         data_file = dir_name + '/' + fn  

   if data_file == None: 
      if '/' == dir_name[-1]:
         data_file = dir_name + '%s.%s.json' % (file_name, time.time())
      if '/' != dir_name[-1]:
         data_file = dir_name + '/' + '%s.%s.json' % (file_name, time.time())     
   return data_file 


def get_files(dir_name:str, sleep:float)->list: 
   """
   Given a direectory get file 
   :args: 
      dir_name:str - directory name 
      sleep:str - wait time if dir is empty 
   :param: 
      dir_name :str - directory name (full path)
      file_lsit:list - list of files in directory 
   :return: 
      list of files
   """
   file_list = [] 
   while len(file_list)  == 0: 
      file_list = os.listdir(dir_name) 
      time.sleep(sleep)
   return file_list 

def get_data(file_name:str)->str:
   """
   Given a file name, read data and retrive relevent information
   :args: 
      file_name:str - file to read data from 
      raw_data:dict - data read from file 
   :param: 
      store_data:dict - relevent data from file 
   :return: 
      store_data as json dict 
   """
   raw_data = None 
   with open(file_name, 'r') as f: 
      raw_data  = json.loads(f.read())
   print(raw_data['Path'].rsplit('\\')[-1].split('|')[0])  
   store_data = {
      'parentelement': raw_data['ParentElement'], 
      'webid': raw_data['WebId'], 
      'device_name': raw_data['Path'].rsplit('\\')[-1].split('|')[0],
      'value': raw_data['Value'], 
      'timestamp': raw_data['Timestamp']
   } 
   os.remove(file_name)
   return json.dumps(store_data), raw_data['Name'].lower() 

def write_to_file(prep_dir:str, dbms:str, sensor:str, data:str)->str: 
   """
   Write data to file 
   :args: 
      prep_dir:str - directory where data will be stored
      dbms:str - database name (part of file_name) 
      sensor:str - seensor (part of file_name)
      data:str - data to store in file 
   :param: 
      file_name:str - file to store data in 
   :return: 
      file_name where data is stored 
   """
   file_name = '%s.%s' % (dbms, sensor)
   file_name = __get_file(prep_dir, file_name) 
   try:
      with open(file_name, 'a') as f: 
         f.write('%s\n' % data)
   except: 
      pass 
   return file_name 

def get_data_main():
   """
   :positional arguments:
      prep_dir              directory where data is prepped
      watch_dir             publisher data node
   :optional arguments:
      -h, --help                  show this help message and exit
      -f, --file-size FILE_SIZE   file size in MB                                               (default: 1)
      -t, --timeout   TIMEOUT     When data isn't available how long to wait before timing out  (default: 60)
      -b, --dbms      DBMS        database to store data in                                     (default: lsl_demo)
      -d, --data-dir  DATA_DIR    directory containg origin data                                (default: $HOME/xompass-pi-webapi-browser/output_data)
   :Example: 
   The data original comes as:  
      {
        "CategoryNames": [
                "Ping"
        ],
        "ParentElement": "68ae8bef-92e1-11e9-b465-d4856454f4ba",
        "DataReferencePlugIn": "PI Point",
        "ConfigString": "\\\\XOMPASS-LITSL?fb26ea2c-ee4f-4554-9cdd-67d2c48004eb\\CATALYST 3500XL.Ping?18",
        "ParentElementTemplate": "Basic Network Element",
        "WebId": "F1AbEfLbwwL8F6EiShvDV-QH70A74uuaOGS6RG0ZdSFZFT0ug4FckGTrxdFojNpadLPwI4gWE9NUEFTUy1MSVRTTFxMSVRTQU5MRUFORFJPXDc3NyBEQVZJU1xQT1AgUk9PTVxDQVRBTFlTVCAzNTAwWEx8UElORw",
        "Name": "Ping",
        "Path": "\\\\XOMPASS-LITSL\\LitSanLeandro\\777 Davis\\POP Room\\Catalyst 3500XL|Ping",
        "Value": 1,
        "Timestamp": "2020-10-11T22:42:11.0690002Z"
      }

   The data is storred as follows: 
      {
        "parentelement": "68ae8bef-92e1-11e9-b465-d4856454f4ba", 
        "webid": "F1AbEfLbwwL8F6EiShvDV-QH70A74uuaOGS6RG0ZdSFZFT0ug4FckGTrxdFojNpadLPwI4gWE9NUEFTUy1MSVRTTFxMSVRTQU5MRUFORFJPXDc3NyBEQVZJU1xQT1AgUk9PTVxDQVRBTFlTVCAzNTAwWEx8UElORw",
        "device_name": "Catalyst 3500XL",
        "value": 1,
        "timestamp": "2020-10-11T22:42:11.0690002Z"
       }
   """
   parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
   parser.add_argument('prep_dir',   type=str,    default='$HOME/AnyLog-demo/data/publisher/prep',  help='directory where data is prepped')
   parser.add_argument('watch_dir',  type=str,    default='$HOME/AnyLog-demo/data/publihser/watch', help='publisher data node')
   parser.add_argument('-f', '--file-size',  type=float,  default=1,          help='file size in MB')
   parser.add_argument('-t', '--timeout',    type=float,  default=60,         help='When data isn\'t available how long to wait before timing out')
   parser.add_argument('-b', '--dbms',       type=str,    default='lsl_demo', help='database to store data in') 
   parser.add_argument('-d', '--data-dir',  type=str,    default='$HOME/xompass-pi-webapi-browser/output_data', help='directory containg origin data') 
   args = parser.parse_args()

   prep_dir  = os.path.expanduser(os.path.expandvars(args.prep_dir))
   watch_dir = os.path.expanduser(os.path.expandvars(args.watch_dir))
   data_dir  = os.path.expanduser(os.path.expandvars(args.data_dir))
   file_size = args.file_size * 1000000 

   while True: 
      files_list = get_files(data_dir, args.timeout) 
      for fn in files_list: 
         if '/' == data_dir[-1]: 
            fn = data_dir + fn 
         elif '/' != data_dir[-1]: 
            fn = data_dir + '/' + fn 
         data, sensor  = get_data(fn) 
         file_name = write_to_file(prep_dir, args.dbms, sensor, data) 
         try:
            size = os.path.getsize(file_name)
         except:
            pass 
         if size >= file_size: 
            os.rename(file_name, file_name.replace(prep_dir, watch_dir)) 
      time.sleep(args.timeout) 


if __name__ == '__main__': 
   get_data_main() 
