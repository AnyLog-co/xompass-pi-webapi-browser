import csv 
import datetime 
import json 
import os 
import sys 
import time

xompass_convert_scripts = os.path.expanduser(os.path.expandvars('$HOME/xompass-pi-webapi-browser/anylog-scripts/xompass-scripts'))
sys.path.insert(0, xompass_convert_scripts)

from file_io import read_file
import pge_convert 

def __convert_json_to_dict(data:str)->dict: 
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

def __convert_dict_to_json(data:dict)->str: 
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

def __convert_timestamp(value:int)->str:
   """
   There exists a case where System Uptime is retunred in subseconds. code converts said seconds to epoch time
   :args: 
      value:int - seconds to be converted into epoch
   :param: 
      sec_value:float - value in seconds format
      datetime_value:datetime.datetime - convert seconds to datetime 
      elapse_time:datetime.datetime - convert datetime_value to elapse time 
   :return: 
      return elapse_time, if fail return False 
   """
   # Calculate elapse time 
   sec_value = value/100
   try:
      datetime_value = datetime.datetime.strptime(datetime.datetime.fromtimestamp(sec_value).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S')
   except Exception:
      return False
   try:
      elapse_time =  datetime_value - datetime.datetime(1970, 1, 1, 0, 0, 0)
   except Exception as e:
      print(e)
      return False

   # Calculate elapse time with year 
   str_elapse_time = str(elapse_time)
   day_count = int(str(elapse_time).split(' day')[0])
   if day_count < 365:
      return str(elapse_time)
   
   current_day = day_count % 365
   years = (day_count - current_day) / 365

   update_date = str(elapse_time).replace(str(day_count), str(current_day))
   return str('%s years, %s' % (int(years), update_date))


def convert_xompass_data(file_name:str)->(list, str):
   """
   Given JSON data from xompass server(s), convert data to be stored in db
   :args: 
      file_name:str - file to get data from 
   :param: 
      data_set:list - list of converted data 
      timestamp:str - using the file name, generate insert timestamp
      file_data:str - data read from file 
   :return: 
      if success return list of JSON + device_id 
      else return empty listt 
   """
   data_set = [] 
   device_id = '' 

   timestamp = file_name.split(".")[1].rsplit("_", 1)[0]
   timestamp = time.mktime(datetime.datetime.strptime(timestamp, "%Y_%m_%d_%H_%M_%S").timetuple())
   timestamp = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S') 

   file_data = read_file(file_name) 
   if not file_data: 
      return False 
   
   for row in file_data:
      output_data = {'timestamp': timestamp} 
      dict_obj = __convert_json_to_dict(row)
      json_obj = False 
      if dict_obj: 
         device_id = list(dict_obj.keys())[0]
         output_data['device_id'] = device_id 
         for column in dict_obj[device_id]:
            output_data[column] = dict_obj[device_id][column][0]['content']
            json_obj = __convert_dict_to_json(output_data) 
      if json_obj is not False: 
         data_set.append(json_obj)
   return data_set

def convert_xompass_pi_data(file_name:str)->(list, str):
   """
   Given JSON from PI (using Xompass) convert data to be stored in db
   :args: 
      file_name:str - file to get data from
   :param: 
      data_set:list - list of converted 
      file_data_str:str - Data from Xompass pi is organized in multiple lines, merge lines into a single strirng 
   :return: 
      if success returnr lis ofo JSON + device_id 
      ele return empty list 
   """
   data_set = [] 
   device_id = '' 
   file_data_str = "" 
   
   try: 
      for part in read_file(file_name): 
         file_data_str += part.replace("\n", "").replace("\t", "") 
   except Exception: 
      return False 

   for row in file_data_str.split("}")[:1]: 
      output_data = {} 
      dict_obj = __convert_json_to_dict(row+"}")
      for column in dict_obj: 
         if column == 'WebId': 
            output_data[column.lower()] = dict_obj[column]
         elif column == "ConfigString": 
            output_data['device_name'] = dict_obj[column].rsplit("\\", 1)[-1].split('.', 1)[0]
         elif column == "ParentElement":
            output_data[column.lower()] = dict_obj[column]
         elif column == "Value": 
            output_data[column.lower()] = dict_obj[column]
            if "SystemUptime_sensor" in file_name:
               output_data[column.lower()] = __convert_timestamp(int(dict_obj[column]))
            else: 
                output_data[column.lower()] = dict_obj[column]    
         elif column == "Timestamp": 
            output_data[column.lower()] = dict_obj[column]
      json_obj = __convert_dict_to_json(output_data)
      if json_obj is not False:
         data_set.append(json_obj) 

   return data_set

def convert_csv_to_json(file_name:str, pge:bool = False)->list: 
   """
   Given a CSV file convert to JSON 
   :args: 
      file_name:str file to get data from 
   :param: 
      data_set:list - JSON from file 
   :return: 
      if success return full list, else empty list 
   """
   data_set = []
   try: 
      with open(file_name, 'r') as csvfile:
         try: 
            reader = csv.DictReader(csvfile)
         except Exception as e: 
            print('Failed to read CSV file %s - Error: %s' % (file_name, e))
            return False 
         for row in reader: 
            if pge is True: 
               row = pge_convert.update_values(row) 
            for val in row: 
               if row[val].isdigit(): 
                   try: 
                      row[val] = int(row[val])
                   except Exception: 
                      row[val] = row[val] 
               else: 
                  try: 
                     row[val] = float(row[val]) 
                  except Exception: 
                     row[val] = row[val] 
            if len(row) > 0: 
               if pge is True: 
                  data_set.append(row)
               else:  
                  json_obj = __convert_dict_to_json(row) 
                  if json_obj is not False: 
                     data_set.append(row)
   except Exception as e: 
      print('Failed to open CSV file %s - Error: %s' % (file_name, e))
      return False 
   return data_set

def convert_data(file_name:str, convert_type:str):
   """
   Based on convert_type, select conversion formatt 
   :args: 
      file_name:str - file to get data from 
      convert_type:str - conversion format 
   :return: 
      if success return list of JSON + device_id 
      else return empty listt 
   """
   output = False 
   if convert_type.lower() == 'xompass': 
      try: 
         output = convert_xompass_data(file_name) 
      except Exception: 
         pass
   elif convert_type.lower() == 'pi': 
      try:
         output = convert_xompass_pi_data(file_name) 
      except Exception: 
         pass
   elif convert_type.lower() == 'csv': 
      try:
         output = convert_csv_to_json(file_name)
      except Exception: 
         pass
   elif convert_type.lower() == 'pge': 
      try: 
         output = convert_csv_to_json(file_name, True)
      except Exception:
         pass
   return output 
