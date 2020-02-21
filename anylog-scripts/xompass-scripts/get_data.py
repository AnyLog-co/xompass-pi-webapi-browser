import argparse
import os 
import sys 

xompass_convert_scripts = os.path.expanduser(os.path.expandvars('$HOME/xompass-pi-webapi-browser/anylog-scripts/xompass-scripts'))
sys.path.insert(0, xompass_convert_scripts)

import convert_data
from file_io import FileIO

class GetData:
   def __init__(self, rest_dir:str, prep_dir:str, watch_dir:str, file_size:float, convert_type:str): 
      self.rest_dir = os.path.expanduser(os.path.expandvars(rest_dir))
      self.prep_dir = os.path.expanduser(os.path.expandvars(prep_dir))
      self.watch_dir = os.path.expanduser(os.path.expandvars(watch_dir))
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
      """ret_value = True 
      try: # Open file 
         with open(file_name, 'r') as f:     
            try: # Read file 
               row = f.read().replace("\n", "").replace("\t", "")
            except Exception as e: 
               print("Failed to read from file (%s) - %s" (file_name, e))
               ret_value = False 
      except Exception as e: 
         print("Failed to open file (%s) - %s" % (file_name, e))
         ret_value = False 
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

   def get_data(self):
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
      while True:
         boolean = False
         for i in range(2):
            try: # Try to find file with data  
               file_name = self.rest_dir + "/" + sorted(os.listdir(self.rest_dir))[0]
            except: # if there isn't a file wait for 10 sec (repeat 6 times else exit) 
               if boolean == True:
                  print("No new data found")
                  exit(1)
               #time.sleep(timeout)
               boolean = True
            else: # reset 
               boolean = False
               break
         data, device_id = convert_data.convert_data(file_name, self.convert_type) 
         if not data: 
            return False 
         for row in data: 
            self.fi.file_io(file_name, device_id, row) 
         exit(1) 
         #if not self.read_file(file_name): # read file and store into file 
         #   return False

         #try: # remove once doe 
         #   os.remove(file_name)
         #except Exception as e:
         #   print("Failed to remove file (%s) - %s" (file_name, e))
         #   return False
         #time.sleep(1)

def main(): 
   parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
   parser.add_argument('rest_dir',              type=str,   default='$HOME/AnyLog-Network/data/rest',  help='directory recieved data') 
   parser.add_argument('prep_dir',              type=str,   default='$HOME/anyLog-Network/data/prep',  help='directory prep data') 
   parser.add_argument('watch_dir',             type=str,   default='$HOME/AnyLog-Network/data/watch', help='directorry data ready to be stored') 
   parser.add_argument('-fs', '--file-size',    type=float, default=1,                                 help='file size')  
   parser.add_argument('-ct', '--convert-type', type=str,   default='pi',                         help='type of JSON conversion') 
   args = parser.parse_args()

   gd = GetData(args.rest_dir, args.prep_dir, args.watch_dir, args.file_size, args.convert_type) 
   if not gd.validate_dirs(): 
      exit(1) 
   gd.get_data()

if __name__ == '__main__': 
   main()
