import argparse
import datetime
import os
import subprocess
import sys
import threading
import time

from convert_data_single_files import ConvertJSON

class GetData: 
   def __init__(self, json_config_file:str, download_data_dir:str, generate_data_prep:str, publisher_data_in:str, file_size:float): 
     if download_data_dir[-1] == "/": 
        download_data_dir = download_data_dir[:-1] 
     self.download_data_dir = os.path.expanduser(os.path.expandvars(download_data_dir))
     self.generate_data_prep = os.path.expanduser(os.path.expandvars(generate_data_prep))
     self.publisher_data_in = os.path.expanduser(os.path.expandvars(publisher_data_in))
     self.json_config_file = os.path.expanduser(os.path.expandvars(json_config_file))
     self.file_size = file_size 
     # self, generate_data_prep:str, publisher_data_in:str, file_size:int 
     self.cj = ConvertJSON(self.json_config_file, self.generate_data_prep, self.publisher_data_in, file_size)

   def __validate_mkdir(self, file_name:str)->bool: 
      """
      Validate if dir exists 
      :args: 
         file_name:str - file to check if exists 
      :return: 
         if success return True, else False 
      """
      if not os.path.isdir(file_name):
         try: 
            os.makedirs(file_name)
         except Exception as e: 
            print("Failed to create directory (%s) - %s" % (file_name, e))
            return False 
      return True 

   def validate_dirs(self)->bool: 
      """
      Wait for data to get generated, and then Validate files dir structures needed exist 
      :param: 
         results:list - list of validate_dirs results  
      :return: 
         file_dirs get created - if so return True else False 
      """
      results = [] 
      try: 
         while not os.path.isdir(self.download_data_dir): # check if data is being generated 
            time.sleep(10) 
      except Exception as e: 
         print("Failed to execute OS command on dir (%s) - %s" % (self.download_data_dir, e))
         return False 

      ret_value = True 
      try: 
         if not os.path.isfile(self.json_config_file):
            print("Config file (%s) DNE" % self.json_config_file)
            ret_value = False 
      except Exception as e: 
         print("OSError on file %s - %s" % (self.json_config_file, e)) 
         ret_value = False 

      if not ret_value:
         return ret_value 

      results.append(self.__validate_mkdir(self.generate_data_prep))
      results.append(self.__validate_mkdir(self.publisher_data_in))
       
      return all(x == True for x in results) 

   def read_file(self, file_name:str): 
      """
      Read file containing data 
      :args: 
         file_name:str - file to get data from 
      :param: 
         ret_value:str - return value 
      :return: 
         If an error occurs it is printed to screen and return False, else return True 
      """
      """ret_value = True 
      try: # Open file 
         with open(file_name, 'r') as f:     
            try: # Read file 
               row = f.read().replace("\n", "").replace("\t", "")
            except Exception as e: 
               print("Failed to read from file (%s) - %s" (file_name, e))
               ret_value = False 
      except Exception as e: 
         print("Failed to open file (%s) - %s" % (file_name, e))
         ret_value = False 
      """
      ret_value = True 
      read_data = self.cj.read_data(file_name)
      if not read_data: 
         ret_value = False 

      if ret_value == True: # store data to file    
         row = ''.join(read_data).replace("\n","").replace("\t","")
         ret_value = self.cj.store_to_file(row) 

      return ret_value 

   def get_data(self, timeout:float): 
      """
      Main for class
      :args: 
         timeout:float - wait before retrying and exit 
      :param: 
         count:int - iteration count for when data DNE in download dir 
      :return: 
         if an error occurs it is printed to screen and return False, else return True 
      """
      count = 0 
      while True: 
         boolean = False
         for i in range(2): 
            try: # Try to find file with data  
               file_name = self.download_data_dir + "/" + sorted(os.listdir(self.download_data_dir))[0] 
            except: # if there isn't a file wait for 10 sec (repeat 6 times else exit) 
               if boolean == True: 
                  print("No new data found") 
                  exit(1) 
               time.sleep(timeout) 
               boolean = True 
            else: # reset 
               boolean = False 
               break 
         if not self.read_file(file_name): # read file and store into file 
            return False 
         
         try: # remove once doe 
            os.remove(file_name) 
         except Exception as e: 
            print("Failed to remove file (%s) - %s" (file_name, e))
            return False 

def main():
   """
   Main
   :positional arguments:
      generate_data_prep    directory where data is prepped
      publisher_data_in     publisher data node
      file_size             file size in MB
   :optional arguments:
      -h, --help            show this help message and exit
      -dd DOWNLOAD_DATA_DIR, --download-data-dir DOWNLOAD_DATA_DIR directory containg data from downloads.js (default:$HOME/xompass-pi-webapi-browser/output_data)
      -jcf JSON_CONFIG_FILE, --json-config-file JSON_CONFIG_FILE YAML with info regarding JSON objects (default:$HOME/xompass-pi-webapi-browser/anylog-scripts/config_files/get_data_config.yaml)
   """
   parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
   parser.add_argument('generate_data_prep', type=str,   default='$HOME/AnyLog-demo/data/publisher/prep',    help='directory where data is prepped')
   parser.add_argument('publisher_data_in',  type=str,   default='$HOME/AnyLog-demo/data/publihser/in',      help='publisher data node')
   parser.add_argument('file_size',          type=float, default=1,                                          help='file size in MB')
   parser.add_argument('-ts', '--timeout',   type=float, default=60,                                         help='When data isn\'t available how long to wait before timing out') 
   parser.add_argument('-dd', '--download-data-dir', type=str, default='$HOME/xompass-pi-webapi-browser/output_data', help='directory containg data from downloads.js')
   parser.add_argument('-jcf', '--json-config-file', type=str, default='$HOME/xompass-pi-webapi-browser/anylog-scripts/config_files/get_data_config.yaml', help='YAML with info regarding JSON objects') 
   args = parser.parse_args()

   gd = GetData(args.json_config_file, args.download_data_dir, args.generate_data_prep, args.publisher_data_in, args.file_size) 
   if not gd.validate_dirs(): 
      exit(1) 
   if not gd.get_data(args.timeout): 
      exit(1) 

if __name__ == '__main__': 
   main()
