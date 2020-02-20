import datetime 
import json 
import time

def __convert_json_to_dict(data:str)->dict: 
   try: 
      return json.loads(data) 
   except Exception as e: 
      print('Failed to convert JSON to dict. (Error: %s)' % e)
      return False 

def __convert_dict_to_json(data:dict)->str: 
   try: 
      return json.dumps(data)
   except Exception as e: 
      print('Failed to convert dict to JSON. (Error: %s)' % e) 
      return False 

def __read_file(file_name:str)->list: 
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

def convert_xompass_data(file_name:str)->bool:
   """
   Given JSON data from xompass server(s), convert data to be stored in db
   :args: 
      file_name:str - file to get data from 
   :param: 
      data_set:list - list of converted data 
      timestamp:str - using the file name, generate insert timestamp
      file_data:str - data read from file 
   :return: 
      data_set  
   """
   data_set = [] 

   timestamp = file_name.split(".")[1].rsplit("_", 1)[0]
   timestamp = time.mktime(datetime.datetime.strptime(timestamp, "%Y_%m_%d_%H_%M_%S").timetuple())
   timestamp = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S') 

   file_data = __read_file(file_name) 
   if not file_data: 
      return False 
   
   for row in file_data:
      output_data = {'timestamp': timestamp} 
      dict_obj = __convert_json_to_dict(row)
      json_obj = False 
      device_id = None 
      if dict_obj: 
         device_id = list(dict_obj.keys())[0]
         output_data['device_id'] = device_id 
         for column in dict_obj[device_id]:
            output_data[column] = dict_obj[device_id][column][0]['content']
            json_obj = __convert_dict_to_json(output_data) 
      if json_obj is not False: 
         data_set.append(json_obj)

   return data_set, device_id
