#!/usr/bin/env python3
import argparse
import os
import time 

def main(): 
   parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
   parser.add_argument('generate_data_prep', type=str,   default='$HOME/AnyLog-demo/data/publisher/prep',    help='directory where data is prepped')
   parser.add_argument('publisher_data_in',  type=str,   default='$HOME/AnyLog-demo/data/publihser/in',      help='publisher data node')
   args = parser.parse_args()
   generate_data_prep = os.path.expanduser(os.path.expandvars(args.generate_data_prep))
   publisher_data_in = os.path.expanduser(os.path.expandvars(args.publisher_data_in)) 

   while True: 
      for file_name in os.listdir(generate_data_prep):
         seconds = time.time() - os.path.getmtime(generate_data_prep + '/' + file_name) 
         if (seconds / 86400) >= 1: 
            print(file_name) 
            os.rename(generate_data_prep + '/' + file_name, publisher_data_in + '/' + file_name)
      time.sleep(30)

if __name__ == '__main__': 
   main()
