import yaml 

def read_config_file(file_name:str)->dict: 
   ret_value = {}
   try: 
      with open(file_name, 'r') as fyaml: 
         try:
            return yaml.load(fyaml) 
         except Exception as e: 
            print("Failed to read config from file (%s) - %s" % (file_name, e))
   except Exception as e: 
      print("Failed to open file (%s) - %s" % (file_name, e))
   return ret_value 
