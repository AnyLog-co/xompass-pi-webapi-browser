import datetime 
import json
import os 
import sys

#generic_dir = os.path.expanduser(os.path.expandvars('$HOME/AnyLog-demo/source/generic'))
#sys.path.insert(0, generic_dir)
#from utils_data import *
#import utils_io 
#import utils_data
#import process_status

import config 
from file_io import FileIO 

class ConvertJSON: 
   def __init__(self, json_config_file:str, generate_data_prep:str, publisher_data_in:str, file_size:int): 
      """
      By iterating through generate_data_in get relevent information needed to store in file
      :args: 
         generate_data_in:str - generate data in dir 
         generate_data_out:str - generate data out dir 
         generate_data_prep:str - generate prep dir 
         publisher_data_in:str - publisher data in dir 
      """
      self.generate_data_prep = generate_data_prep
      self.publisher_data_in = publisher_data_in
      self.file_size = file_size
      self.__read_config(json_config_file)
      self.file_io = FileIO(generate_data_prep, publisher_data_in, file_size, self.sensor_device_type, self.database_name) 

   def __read_config(self, config_file:str)->bool: 
      """
      From configuration file, update relevent columns to create table name
      :params: 
         self.sensor_device_type:str - the type of data (sensor or device) 
         self.id_column:str - The column of sensor/device id 
         self.timestamp_column:str - The column of generated timestamp_column 
         self.name_column:str - The name of the sensor / device 
         config_values:dict - Data read from YAML file 
      :note: 
         if either open or read/load fails and error is printed and program exits
      """

      config_values = config.read_config_file(config_file) 
      if config_values == {}: 
         print("Failed to get configuration - program existing") 
         exit(1) 
      self.database_name = config_values['database'] 
      self.device_id_column = config_values['device_id_column']
      self.sensor_device_type = config_values['sensor_device_type'] 
      self.name_column = config_values['name_column'] 
      self.timestamp_column = config_values['timestamp_column'] 
      self.path_column = config_values['path_column'] 
      self.column_list = [self.device_id_column, config_values['sensor_id_column'], self.path_column, self.timestamp_column, config_values['value_column']] 
   def read_data(self, file_name:str)->str: 
      """
      Return results from file_io.read_from_file 
      :args: 
         file_name:str - file to read data from 
      :return: 
         results from file_io.read_from_file
      """
      return self.file_io.read_from_file(file_name) 

   def convert_from_json(self, data:str)->dict: 
      """
      Convert data from JSON to dict
      :args: 
         data:str - JSON value 
      :return: 
         If success dict of JSON, else False 
      """
      updated_data = [] 
      try:
         updated_data = json.loads(data)
      except Exception as e:
         print("Failed to convert data into dict - %s" % e)

      if updated_data != []: 
         try:
            updated_data["CategoryNames"] = updated_data["CategoryNames"][0]
         except IndexError: 
            updated_data["CategoryNames"] = ''
      return updated_data

   def get_info(self, data:dict)->(str, str, str): 
      """
      Given data value, get id_column, timestamp_column, and Name from it
      :args: 
         data:dict - JSON of data from PI 
      :return: 
         values in self.id_column, self.timestamp_column and self.name_column      
      """
      try: 
         id_value = data[self.device_id_column].replace("-", "_") 
      except Exception as e: 
         print("Failed to get sensor id value - %s" % e)  
         return False 
      try: 
         timestamp = data[self.timestamp_column].replace("T", " ").split("Z")[0]
      except Exception as e: 
         print("Failed to get timestamp value - %s" % e) 
         return False 
      
      try:
         formated_timestamp = datetime.datetime.strptime(timestamp.split(".")[0], '%Y-%m-%d %H:%M:%S').strftime('%Y_%m_%d_%H_%M_%S')
      except Exception as e: 
         print("Failed to format timestamp - %s" % e)
         return False 

      if "." in timestamp:
         clean_timestamp = timestamp.replace(timestamp.split(".")[-1], timestamp.split(".")[-1][:6]) 
         try: 
            formated_timestamp = datetime.datetime.strptime(clean_timestamp, '%Y-%m-%d %H:%M:%S.%f').strftime('%Y_%m_%d_%H_%M_%S_%s')
         except Exception as e: 
            print("Failed to format timestamp - %s" % e)
            return False 
      try:
         sensor_name = data[self.name_column].replace(" ", "_").replace("-", "_")
      except Exception as e:
         print("Failed to get name value - %s" % e) 
         return False 
      return id_value, formated_timestamp, sensor_name 

   def write_to_file(self, id_column:str, timestamp_column:str, name:str, data:str)->bool: 
      """
      Process to write data to file 
      :args: 
         name:str - sensor name 
         data:str (JSON) - JSON data to store in file 
      :param: 
         file_name:str - file to store data in 
         max_file_size:str - file size 
      :return: 
         if success return True, else False
      :steps: 
         1. Check if file exists 
         2. Create file if needs to be 
         3. Check file size 
           a. If max file size is reached then mv file & create new one using recursion
           b. If max file is not reached continue 
           c. If error (-1) return False
         4. Write to File
      """
      # 1a. Check if file exists baseed on WebID & Name 
      file_name = self.file_io.check_if_file_exists(id_column, name)
      # 1b. If not create file 
      if file_name == False: 
         return False 
      elif file_name == []:
         new_file_name = self.file_io.create_file(id_column, timestamp_column, name)
         if not new_file_name: 
            return False 
         print(datetime.datetime.now())
         file_name = new_file_name  
     
      # 2a. Check if file is full (based on file size) 
      max_file_size = self.file_io.check_file_size(file_name)
      if max_file_size == -1: 
         return False 
      if max_file_size is True: 
         if not self.file_io.move_file(file_name, self.publisher_data_in): 
            return False 
         # 2b. If fails execute 1b 
         if not self.write_to_file(id_column, timestamp_column, name, data):
            return False 
         else: 
            return True 

      # 3. write to File 
      if not self.file_io.write_to_file(file_name, data): 
         return False 
      return True 
    

   def convert_from_dict(self, data:dict)->str: 
      """
      Convert dict from dict back to JSON 
      :args: 
         data:dict - data as dictionary object 
      :return 
         JSON format of data, else False 
      """
      updated_data = {} 
      for key in data: 
         if key in self.column_list: 
            if key == self.path_column: 
               updated_data['device_name'] = data[key].split("|")[0].rsplit('\\',1)[-1] 
            else: 
               updated_data[key.lower()] = data[key] 
      try: 
         return json.dumps(updated_data)
      except Exception as e:
         print("Failed to convert string into dict - %s" % e)
         return False 

   def store_to_file(self, row:str)->bool: 
      """
      Given a row get relevent info and store it to file 
      :args: 
         row:str - JSON row from PI
      :return: 
         if success return True, else False 
      """
      converted_row = self.convert_from_json(row)
      if converted_row == []:
         return False

      id_column, timestamp_column, name = self.get_info(converted_row)
      if not id_column:
         return False
       
      update_json = self.convert_from_dict(converted_row)
      if not update_json:
         return False
      if not self.write_to_file(id_column, timestamp_column, name, update_json):
         return False
      return True 
