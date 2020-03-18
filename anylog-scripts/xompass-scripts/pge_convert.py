DATA_SETS = {
   'south_s1_b1': {'mp_ids': [3175001], 'additional_info': {'region': 'south', 'substation': 'S1', 'bank_customer': 'B1'}},
   'south_s1_b2': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S1', 'bank_customer': 'B2'}},
   'south_s1_b3': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S1', 'bank_customer': 'B3'}},
   'south_s2_b1': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S2', 'bank_customer': 'B1'}},
   'south_s2_b2': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S2', 'bank_customer': 'B2'}},
   'south_s2_b3': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S2', 'bank_customer': 'B3'}},
   'south_s3_b1': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S3', 'bank_customer': 'B1'}},
   'south_s3_b2': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S3', 'bank_customer': 'B2'}},
   'south_s3_b3': {'mp_ids': [], 'additional_info': {'region': 'south', 'substation': 'S3', 'bank_customer': 'B3'}},
   'central_s1_b1': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S1', 'bank_customer': 'B1'}},
   'central_s1_b2': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S1', 'bank_customer': 'B2'}},
   'central_s1_b3': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S1', 'bank_customer': 'B3'}},
   'central_s2_b1': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S2', 'bank_customer': 'B1'}},
   'central_s2_b2': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S2', 'bank_customer': 'B2'}},
   'central_s2_b3': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S2', 'bank_customer': 'B3'}},
   'central_s3_b1': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S3', 'bank_customer': 'B1'}},
   'central_s3_b2': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S3', 'bank_customer': 'B2'}},
   'central_s3_b3': {'mp_ids': [], 'additional_info': {'region': 'central', 'substation': 'S3', 'bank_customer': 'B3'}},
   'north_c1': {'mp_ids': [], 'additional_info': {'region': 'north', 'bank_customer': 'C1'}},
   'north_c2': {'mp_ids': [], 'additional_info': {'region': 'north', 'bank_customer': 'C2'}},
   'north_c3': {'mp_ids': [], 'additional_info': {'region': 'north', 'bank_customer': 'C3'}},
}

def update_values(pge_data:dict)->dict:
   """
   For PGE data, update dictionry to contain farthur details 
   :ags:
      pge_data:dict - dict to update 
   :return: 
      if value with given ID is returned, then update, else return empty dict 
   """
   for data_set in DATA_SETS: 
      if int(pge_data['MP_ID']) in DATA_SETS[data_set]['mp_ids']:
         return {**pge_data, **DATA_SETS[data_set]['additional_info']}
   return {}  
