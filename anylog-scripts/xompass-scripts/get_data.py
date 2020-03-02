import argparse
import json
import os 
import sys
import time

xompass_convert_scripts = os.path.expanduser(os.path.expandvars('$HOME/xompass-pi-webapi-browser/anylog-scripts/xompass-scripts'))
sys.path.insert(0, xompass_convert_scripts)


import convert_data
from file_io import FileIO
from read_config import read_yaml 

def convert_dict_to_json(data:dict)->str:
   """
   Convert dict into JSON
   :args:
      data:dict - dict to convert into JSON
   :return:
      JSON, else False
   """
   try:
      return json.dumps(data)
   except Exception as e:
      print('Failed to convert dict to JSON. (Error: %s)' % e)
      return False

class GetData:
   def __init__(self, rest_dir:str, prep_dir:str, watch_dir:str, dbms:str, file_size:float, convert_type:str, config_file:str): 
      """
      Given a set of dirs, merge data to be stored in AnyLog 
      :param: 
         self.rest_dir:str - dir where data is kept until merged 
         self.prep_dir:str - dir where data is merged 
         self.watch_dir:str - dir where data is waiting to be sent intoo DB 
         self.dbms:str - database to store data in (used in file name) [default: None]  
         self.file_size:str - max file to store merged data [default: 1MB] 
         self.convert_type:str - based on type of data convert to properly use JSON [default: pi] 
      """   
      self.rest_dir = os.path.expanduser(os.path.expandvars(rest_dir))
      self.prep_dir = os.path.expanduser(os.path.expandvars(prep_dir))
      self.watch_dir = os.path.expanduser(os.path.expandvars(watch_dir))

      if config_file is not None: 
         config_file = os.path.expanduser(os.path.expandvars(config_file))
         self.config_data = read_yaml(config_file) 
      else: 
         self.config_data = None
         
      self.dbms = dbms 
      self.file_size = file_size 
      self.convert_type = convert_type 

   def validate_dirs(self)->bool: 
      """
      Validate relevent dirs exist, if not try to create them
      :return: 
         if success return True, else False 
      """
      output = True 

      # Validate rest dir 
      try: 
         if not os.path.isdir(self.rest_dir): 
            try: 
               os.makedirs(self.rest_dir)
            except Exception as e: 
               print('Unable to create REST dir %. (Error: %s)' % (self.rest_dir, e))
               output = False 
      except Exception as e: 
         print('Unable to check if REST dir %s exists. (Error: %s)' % (self.rest_dir, e))
         output = False 
         
      # Validate prep dir 
      try: 
         if not os.path.isdir(self.prep_dir): 
            try: 
               os.makedirs(self.prep_dir) 
            except Exception as e: 
               print('Unable to create PREP dir %s. (Error: %s)' % (self.prep_dir, e))
               outputt = False 
      except Exception as e: 
         print('Unable to check if PREP dir %s exists. (Error: %s)' % (self.prep_dir, e))
         output = False 

      # validate watch dir 
      try: 
         if not os.path.isdir(self.watch_dir):
            try: 
               os.makedirs(self.watch_dir)
            except Exception as e: 
               print('Unable to create WATCH dir %s. (Error: %s)' % (self.watch_dir, e))
               output = False 
      except Exception as e: 
         print('Unable to check if WATCH dir %s exists. (Error: %s)' % (self.watch_dir, e))
         output = False 
      if output is True: 
         self.fi = FileIO(self.prep_dir, self.watch_dir, self.file_size) 
      return output 
   

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
      ret_value = True
      read_data = self.cj.read_data(file_name)
      if not read_data:
         ret_value = False

      if ret_value == True: # store data to file    
         row = ''.join(read_data).replace("\n","").replace("\t","")
         ret_value = self.cj.store_to_file(row)

      if ret_value is True: 
         self.fi = FileIO(self.prep_dir, self.watch_dir, self.file_size)

      return ret_value

   def get_data(self, remove_file:bool):
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
      removed_files = [] 
      while True:
         boolean = False
         for i in range(2):
            try: # Try to find file with data  
               file_name = self.rest_dir + "/" + sorted(os.listdir(self.rest_dir))[0]
            except: # if there isn't a file wait for 10 sec (repeat 6 times else exit) 
               if boolean == True:
                  print("No new data found")
                  exit(1) 
               time.sleep(60)
               boolean = True
            else: # reset 
               boolean = False
               break
         if file_name.rsplit("/")[-1] in removed_files: 
            if sorted(removed_files) == sorted(os.listdir(self.rest_dir)):
               exit(1) 
            else: 
               break 
         data = convert_data.convert_data(file_name, self.convert_type)
         if not data: 
            return False 
         for row in data: 
            if self.convert_type == 'pge':
               dbms = self.dbms + "_" + row['region'] 
               json_obj = convert_dict_to_json(row)  
               self.fi.file_io(file_name, dbms, self.config_data, json_obj)
            else: 
               self.fi.file_io(file_name, self.dbms, self.config_data, row) 
         if remove_file: 
            try: # remove once doe 
               os.remove(file_name)
            except Exception as e:
               print("Failed to remove file (%s) - %s" (file_name, e))
               return False
         else:
            removed_files.append(file_name.rsplit("/", 1)[-1]) 
         time.sleep(0.5) 

def main(): 
   """
   Main for get_data
   :positional arguments:
      rest_dir              directory recieved data
      prep_dir              directory prep data
      watch_dir             directorry data ready to be stored

   :optional arguments:
      -h,  --help           show this help message and exit
      -db, --dbms           if set use instead of name in file (default: None)
      -fs, --file-size      file size (default: 1)
      -ct, --convert-type   {xompass,pi} type of JSON conversion (default: pi)
   """
   parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
   parser.add_argument('rest_dir',              type=str,   default='$HOME/AnyLog-Network/data/rest',         help='directory recieved data') 
   parser.add_argument('prep_dir',              type=str,   default='$HOME/anyLog-Network/data/prep',         help='directory prep data') 
   parser.add_argument('watch_dir',             type=str,   default='$HOME/AnyLog-Network/data/watch',        help='directorry data ready to be stored') 
   parser.add_argument('-db', '--dbms',         type=str,   default=None,                                     help='if set use instead of name in file') 
   parser.add_argument('-fs', '--file-size',    type=float, default=1,                                        help='file size')  
   parser.add_argument('-ct', '--convert-type', type=str,   default='pi', choices=['xompass', 'pi', 'csv', 'pge'],   help='type of JSON conversion') 
   parser.add_argument('-cf', '--config-file',  type=str,   default=None,                                     help='config used to file')
   parser.add_argument('--remove-file',         action='store_true',                                          help='if set remove')
   args = parser.parse_args()
   
   gd = GetData(args.rest_dir, args.prep_dir, args.watch_dir, args.dbms, args.file_size, args.convert_type, args.config_file) 
   if not gd.validate_dirs(): 
      exit(1) 
   gd.get_data(args.remove_file)

if __name__ == '__main__': 
   main()
