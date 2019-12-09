import argparse
import os
import time 

def main(args:argparse.Namespace): 
   generate_data_prep = os.path.expanduser(os.path.expandvars(args.generate_data_prep))
   for file_name in os.listdir(generate_data_prep):
      seconds = time.time() - os.path.getmtime(generate_data_prep + '/' + file_name) 
      print(file_name, (seconds / 60))

if __name__ == '__main__': 
   parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
   parser.add_argument('generate_data_prep',  type=str,   default='$HOME/AnyLog-demo/data/publihser/prep',      help='publisher data node')
   args = parser.parse_args()
   main(args)
