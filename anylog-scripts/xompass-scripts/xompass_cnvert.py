import json
import os 
import time

class XompassConvert:
   def __init__(self, json_data_in_file:str, json_data_out_file:str):
      self.json_data_in_file = os.path.expanduser(os.path.expandvars(json_data_in_file))
      self.json_data_out_file = os.path.expanduser(os.path.expandvars(json_data_out_file))

   def iterate_file(self)->list: 
      try: 
         return list(os.listdir(self.json_data_in_file))
      except Exception as e:
         print(e)
         return False 

   def read_file(self, file_name:str)->str:
      try: 
          with open(self.json_data_in_file + "/" + file_name, 'r') as f: 
             try: 
                return f.read()
             except Exception as e:
                print(e)
                return False 
      except Exception as e: 
         print(e)
         return False 

   def convert_file(self, data_set:str)->str: 
      updated_data = {} 
      try: 
         json_data = json.loads(data_set) 
      except Exception as e: 
         print(e)
         return False 
      for key in json_data:
         updated_data['device_id'] = key
         for value in json_data[key]: 
            try:
               updated_data[value] = json_data[key][value][0]['content']  
            except: 
               return False 

      device_id = updated_data['device_id']
      try: 
         return device_id, json.dumps(updated_data)
      except Exception as e: 
         print(e)
         return False 

   def update_file(self, device_id:str, data_set:str, file_name:str)->bool: 
      new_file_name = file_name.replace(file_name.split(".", 1)[0], file_name.split(".", 1)[0] + ".%s" % device_id)
      try: 
         with open(self.json_data_in_file + "/" + new_file_name, 'w') as f: 
            try: 
               f.write(data_set)
            except Exception as e: 
               print(e)
               return False 
      except Exception as e: 
         print(e)
         return False 
      return self.move_file(new_file_name)

   def move_file(self, file_name:str):
      print(file_name) 
      try: 
         os.rename(self.json_data_in_file + "/" + file_name, self.json_data_out_file + "/" + file_name)
      except Exception as e: 
         print(e)
         return False 
      
   
   def xompass_convert(self):
      file_list = self.iterate_file()
      if not file_list: 
         return False
      for file_name in file_list:
         new_file_name = "xompass_db."+file_name.split(".", 1)[-1] 
         os.rename(self.json_data_in_file + "/" + file_name, self.json_data_in_file + "/" + new_file_name) 
         device_id = False 

         original_data = self.read_file(new_file_name) 
         if original_data is not False: 
            try: 
               device_id, updated_data = self.convert_file(original_data) 
            except: 
               self.move_file(new_file_name)

         if device_id is not False: 
            self.update_file(device_id, updated_data, new_file_name) 

if __name__ == '__main__': 
   xc = XompassConvert('$HOME/AnyLog-Network/data/prep', '$HOME/AnyLog-Network/data/watch') 
   while True: 
      time.sleep(0.5)
      xc.xompass_convert()
