import datetime 
import glob
import json 
import os
import re 
import shutil
import sys 
import time 

def convert_json_to_dict(data:str)->dict:
   """
   Convert JSON into dict 
   :args: 
      data:str - JSON to convert into dict 
   :return: 
      JSON as a dict, if fail False 
   """
   try:
      return json.loads(data.replace("'", '"'))
   except Exception as e:
      print('Failed to convert JSON to dict. (Error: %s)' % e)
      return False

def read_file(file_name:str)->list:
   """
   Based on file_name read data 
   :args:
      file_name:str - file to read data 
   :return: 
      data read from file, if fail retun False 
   """
   try:
      with open(file_name, 'r') as f:
         try:
            return f.readlines()
         except Exception as e:
            print('Failed to read data in %s. (Error: %s)' % (file_name, e))
            return False
   except Exception as e:
      print('Failed to open file %s. (Error: %s)' % (file_name, e))
      return False

class FileIO: 
   def __init__(self, prep_dir:str, watch_dir:str, file_size:float): 
      """
      Class to store data in file 
      :param: 
         self.prep_dir:str - dir where data is merged 
         self.watch_dir:str - dir where data is waiting to be sent intoo DB 
         self.file_size:str - max file to store merged data
      """
      self.prep_dir = prep_dir
      self.watch_dir = watch_dir 
      self.file_size = self.__convert_file_size(file_size)

   def __convert_file_size(self, file_size:float)->float:
      """
      Convert file_size into MB
      :args: 
         file_size:float - file size 
      :return: 
         convert file_size into MB 
      """
      return file_size * 1000000

   def check_if_file_exists(self, dbms:str,table_name:str, device_id:str)->str:
      """
      Based on sensor_id and sensor_name check if file exists 
      :args: 
         sensor_id:str - sensor sensor_id 
         sensor_name:str - name of the sensor 
      :return: 
         if exists get file else return False   
      """
      ret_value = ""
      file_name = '%s/%s.%s.*.%s*.json' % (self.prep_dir, dbms, device_id, table_name)
      try:
         ret_value = glob.glob(file_name)
      except Exception as e:
         print("OSError - Failed top get file (%s) - %s" % (file_name, e))
         ret_value = False

      if ret_value != False and len(ret_value) > 0:
         ret_value = ret_value[0]

      return ret_value

   def create_file(self, dbms:str, timestamp:str, table_name:str, device_id:str)->str:
      """
      Create file to store data 
      :args: 
         dbms:str - database name 
         timestamp:str - timestamp for file 
         table_name:str - table to store data in 
         device_id:str - device/sensor id 
      :param: 
         file_name:str - file to store data in 
      :return: 
         file_name 
      """
      file_name = '%s/%s.%s.%s.%s.json' % (self.prep_dir, dbms, device_id, timestamp, table_name)
      try:
         open(file_name, 'w').close()
      except Exception as e:
         print("Unable to create file (%s) - %s" % (self.prep_dir, e))
         return False

      return file_name

   def check_file_size(self, file_name:str)->bool:
      """
      Get the size of a given file and check whether or not it has reached max size.
      :args:
         if reached max_size (self.file_size) return True
         if did not reach max size return False
         if there is an (OSError) when trying to get file size return -1 - this will exist program
      """
      try:
         size = os.path.getsize(file_name)
      except Exception as e:
         print("Failed to get file file size for %s - %s" % (file_name, e))
         return -1

      if size >= self.file_size:
         return True
      return False

   def write_to_file(self, file_name:str, data:str)->bool:
      """
      Write to file
      :args:
         file_name:str - file to store into
         data:str - string to write to file
      :return:
         if success return True, else return False
      """
      ret_value = True
      try:
         with open(file_name, 'a') as f:
            try:
               f.write(data+'\n')
            except Exception as e:
               print("Failed to append to file (%s) - %s" % (file_name, e))
               ret_value = False
      except Exception as e:
         print("failed to open to file (%s) - %s" % (file_name, e))
         ret_value = False
      return ret_value

   def move_file(self, file_name:str)->bool: 
      """
      Move file once full 
      :args: 
         file_name:str - file containing data 
      :return: 
         if success return True, else False 
      """
      ret_value = True 
      fn = file_name.rsplit("/", 1)[-1] 
      try: 
         os.rename(file_name, self.watch_dir + "/" + fn) 
      except Exception as e: 
         print('Failed to move file to watch dir. (Error: %s)' % e)
         ret_value = False 
      return False 

   def file_io(self, file_name:str, dbms:str, column_config:dict, data:str)->bool: 
      """
      'Main' for FileIO
      :args: 
         file_name:str - file containing data (name used only) 
         device_id:str - device or sensor id 
         data:str - JSON of data to store 
         dbms:str - db name to store data in. If dbms is None (default) use name in file
      :param: 
         file_name_new:strr - file to store data in 
      :return: 
         if fails return False, else return True 
      """
      updated_column = {} 
      if column_config is not None: 
         convert_dict = convert_json_to_dict(data) 
      timestamp = '' 
      if not convert_dict: 
         return False 
      
      if dbms is None and 'db_name' in column_config: 
         dbms = column_config['db_name'] 
      else: 
         dbms = 'db_test' 

      if 'timestamp' in column_config: 
         timestamp = convert_dict[column_config['timestamp']].replace("-", "_").replace("T", "_").replace(" ", "_").replace(":", "_").replace(".", "_")
      else: 
         timestamp = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S") 
       
      if 'device_id' in column_config: 
         device_id = convert_dict[column_config['device_id']].replace("-", "_").replace(" ", "_")
      else: 
         device_id = file_name.split("/")[-1].split(".")[0] 
     
      if 'table_name' in column_config: 
         table_name = convert_dict[column_config['table_name']]
      else: 
         table_name = file_name.split("/")[-1].split(".")[-2]
      

      # check if files exists / size 
      file_name_new = self.check_if_file_exists(dbms, table_name, device_id) 
      if len(file_name_new) > 0: 
         if self.check_file_size(file_name_new) is True: 
            self.move_file(file_name_new) 
            file_name_new = [] 
      if not file_name_new: 
         file_name_new = self.create_file(dbms, timestamp, table_name, device_id)
     
      # write to file 
      return self.write_to_file(file_name_new, data) 
