import requests
import time

# GET List of AFs
URL = 'http://localhost:7400/api/af_list'
r = requests.get(url = URL) 
data = r.json() 
print(data)

# GET AF dabases of first AF
data_keys = list(data.keys()) # transform the previous response object keys into array
PARAMS = {'afid': data[ data_keys[0] ]["Id"]} # get the first key of elements and pass it as url parameter
URL = 'http://localhost:7400/api/af_databases'
r = requests.get(url = URL, params = PARAMS) 
af_db_data = r.json() 
print(af_db_data)