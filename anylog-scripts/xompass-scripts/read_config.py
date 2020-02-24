import yaml 

def read_yaml(file_name:str): 
   try: 
      with open(file_name, 'r') as f: 
         try: 
            return yaml.load(f)
         except Exception as e: 
            print('Failed to read YAML file %s - Error: %s' % (file_name, e)) 
            return False 
   except Exception as e: 
      print('Failed to open YAML file %s - Error: %s' % (file_name, e))
      return False 


