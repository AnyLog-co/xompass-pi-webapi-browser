import datetime 
import glob
import os
import shutil
import sys 
import time 


class FileIO: 
   def __init__(self, prep_dir:str, watch_dir:str, file_size:float): 
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
      file_name = '%s/%s.%s.*.%s*.json' % (self.prep_dir, dbms.lower(), device_id.lower(), table_name.lower())
      print(file_name) 
      try:
         ret_value = glob.glob(file_name)
      except Exception as e:
         print("OSError - Failed top get file (%s) - %s" % (file_name, e))
         ret_value = False

      if ret_value != False and len(ret_value) > 0:
         ret_value = ret_value[0]
      return ret_value

   def file_io(self, file_name:str, device_id:str, data:str): 
      dbms = file_name.split("/")[-1].split(".")[0] 
      table_name = file_name.split(".")[2] 
      file_list = self.check_if_file_exists(dbms, table_name, device_id) 
      if not file_list: 

