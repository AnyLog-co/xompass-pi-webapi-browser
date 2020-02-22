import datetime
import json 

def __json_to_dict(old_json:str): 
   """
   Convert JSON to dict
   :args: 
      old_json:str - JSON to convert to dict
   :return: 
      if success return a dict of old_json, else return False 
   """
   try: 
      return json.loads(old_json) 
   except Exception as e: 
      return False 

def __dict_to_json(json_dict:dict): 
   """
   Convert dict to JSON string
   :args: 
      json_dict:dict - dict to convert to JSON 
   :return: 
      if success return JSON (str) of dict, else return False 
   """
   try: 
      return json.dumps(json_dict)
   except: 
      return False 

def convert_value(dict_json:dict): 
   """
   Given a dict_json, convert value to elapsetime 
   :args: 
      dict_json:dict: JSON to change
   :return; 
      If success return updated dict_json, else return False
   :sample: 
      170 days, 1:01:37
   """
   try: 
       value = dict_json['value']
   except: 
      return False 

   try: 
      sec_value = float(value)/100 
   except: 
      return False 

   try: 
      datetime_value = datetime.datetime.strptime(datetime.datetime.fromtimestamp(sec_value).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S')
   except: 
      return False 
   try: 
      return datetime_value - datetime.datetime(1970, 1, 1, 0, 0, 0)
   except Exception as e: 
      print(e)
      return False 

def elpase_time_year(elapse_time:datetime.timedelta): 
   """
   Given elapse time get years
   :args: 
      elapse_time:str - elapse time from convert_value 
   :return: 
      elapse_time with year 
   """
   str_elapse_time = str(elapse_time) 
   try: 
      day_count = int(str(elapse_time).split(' day')[0]) 
   except: 
      return str(elapse_time).split(' day')[0] 
   if day_count < 365: 
      return elapse_time 
   
   current_day = day_count % 365
   years = (day_count - current_day) / 365 
   
   update_date = str(elapse_time).replace(str(day_count), str(current_day)) 
   return '%s years, %s' % (int(years), update_date) 


def convert_value_main(old_json:str)->str: 
   """
   Given a dict (as json), update value to be a date
   The code is intended to support systemuptime table
   :args:
      old_json:str - Recieved JSON
   :return: 
      return old_json with updated value 
   """
   # Convert JSON to dict 
   dict_json = __json_to_dict(old_json) 
   if not dict_json: 
      return old_json 
   
   # get elapse time from dict_json 
   elapse_time_no_year = convert_value(dict_json) 
   if not elapse_time_no_year: 
      return old_json 
  
   # update dict['value'] 
   dict_json['value'] = str(elpase_time_year(elapse_time_no_year))
   
   # Convert dict back to JSON 
   updated_old_json = __dict_to_json(dict_json)
   if not updated_old_json: 
      return old_json 

   return updated_old_json    
   
