DATA_SET = {
   'south_s1_b1': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S1', 'bank_customer': 'B1'}},
   'south_s1_b2': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S1', 'bank_customer': 'B2'}},
   'south_s1_b3': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S1', 'bank_customer': 'B3'}},
   'south_s2_b1': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S2', 'bank_customer': 'B1'}},
   'south_s2_b2': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S2', 'bank_customer': 'B2'}},
   'south_s2_b3': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S2', 'bank_customer': 'B3'}},
   'south_s3_b1': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S3', 'bank_customer': 'B1'}},
   'south_s3_b2': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S3', 'bank_customer': 'B2'}},
   'south_s3_b3': {'mp_ids': [], 'additional_info': 'region': 'south', 'substation': 'S3', 'bank_customer': 'B3'}},
   'central_s1_b1': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S1', 'bank_customer': 'B1'}},
   'central_s1_b2': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S1', 'bank_customer': 'B2'}},
   'central_s1_b3': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S1', 'bank_customer': 'B3'}},
   'central_s2_b1': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S2', 'bank_customer': 'B1'}},
   'central_s2_b2': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S2', 'bank_customer': 'B2'}},
   'central_s2_b3': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S2', 'bank_customer': 'B3'}},
   'central_s3_b1': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S3', 'bank_customer': 'B1'}},
   'central_s3_b2': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S3', 'bank_customer': 'B2'}},
   'central_s3_b3': {'mp_ids': [], 'additional_info': 'region': 'central', 'substation': 'S3', 'bank_customer': 'B3'}},
   'north_c1': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C1'}},
   'north_c2': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C2'}},
   'north_c3': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C3'}},
   'north_c1': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C1'}},
   'north_c2': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C2'}},
   'north_c3': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C3'}},
   'north_c1': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C1'}},
   'north_c2': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C2'}},
   'north_c3': {'mp_ids': [], 'additional_info': 'region': 'north', 'bank_customer': 'C3'}} 
}

def convert_csv_to_json(file_name:str)->list:
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
            for val in row:
               if row[val].isdigit():
                   try:
                      row[val] = int(row[val])
                   except:
                      row[val] = row[val]
               else:
                  try:
                     row[val] = float(row[val])
                  except:
                     row[val] = row[val]
            json_obj = __convert_dict_to_json(dict(row))
            if json_obj is not False:
               data_set.append(json_obj)
   except Exception as e:
      print('Failed to open CSV file %s - Error: %s' % (file_name, e))
      return False

   return data_set
