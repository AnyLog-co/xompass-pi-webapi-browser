import os 
import sys

from convert_systemuptime_value import convert_value_main

def update_file(file_name:str): 
   full_file_name = os.path.expanduser(os.path.expandvars(file_name)) 
   tmp_file = '/tmp/systemuptime_update.json'
   open(tmp_file, 'w').close() 

   with open(full_file_name, 'r') as f: 
      for line in f.readlines(): 
         with open(tmp_file, 'a') as f2: 
            f2.write('%s\n' % convert_value_main(line)) 

   os.rename(tmp_file, full_file_name) 
   
