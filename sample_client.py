import requests
import time

# Rememebr to Run the node.js service first with npm start. (remember to do "npm install" before first start)

# GET List of AFs
#URL = 'http://localhost:7400/api/af_list'
#r = requests.get(url = URL) 
#data = r.json() 
#print(data)
#
## GET AF dabases of first AF
#data_keys = list(data.keys()) # transform the previous response object keys into array
#PARAMS = {'afid': data[ data_keys[0] ]["Id"]} # get the first key of elements and pass it as url parameter
#URL = 'http://localhost:7400/api/af_databases'
#r = requests.get(url = URL, params = PARAMS) 
#af_db_data = r.json() 
#print(af_db_data)
#
## GET AF dabases of first AF
#data_keys = list(data.keys()) # transform the previous response object keys into array 
#PARAMS = {'dbid': list(af_db_data.keys())[1]}  # get the first key of elements and pass it as url parameter
#URL = 'http://localhost:7400/api/af_databases'
#r = requests.get(url = URL, params = PARAMS) 
#sync_data = r.json() 
#print(sync_data)
#
#PARAMS = {'afid': data[ sync_data[0] ]["Id"]} # get the first key of elements and pass it as url parameter
#URL = 'http://%s:%u/api/get_element_list'
#r = requests.get(url = URL, params=PARAMS)
#af_db_data = r.json()
#print(af_db_data)
#
#
#PARAMS = {'eid': list(af_db_data.keys())[8]} # get the first key of elements and pass it as url parameter
## URL = 'http://%s:%u/api/get_sensors_in_element?op=d:\&qid=0' % (host, port)
#URL = 'http://localhost:7400/api/get_sensors_in_element'
#r = requests.get(url = URL, params=PARAMS)
#af_db_attr = r.json()
#print(af_db_attr)

def test_pi(host, port):
    try:
        # GET List of Asset Frameworks
        URL = f'http://{host}:{port}/api/af_list'
        r = requests.get(url = URL, timeout = 3)
        data = r.json()
        print("AF_LIST: ")
        print(data)
        data_keys = list(data.keys())  # transform the previous response object keys into array
        # GET AF dabases of first AF
        PARAMS = {'afid': data[ data_keys[0] ]["Id"]} # get the first key of elements and pass it as url parameter
        URL = f'http://{host}:{port}/api/af_databases'
        r = requests.get(url = URL, params = PARAMS)
        af_db_data = r.json()
        print("AF_DATABASES: ")
        print(af_db_data)
        print(list(af_db_data.keys())[1])
        # Sync with one database - 'dee1a62d-9eac-4945-82e1-4a1e9baa9d8e'
        PARAMS = {'dbid': list(af_db_data.keys())[1]}  # get the first key of elements and pass it as url parameter
        URL = f'http://{host}:{port}/api/af_sync'
        r = requests.get(url=URL, params=PARAMS)
        print("AF_SYNC: ")
        data = r.json()
        print(data)
        # the list of elements in a database
        PARAMS = {'afid': data[ data_keys[0] ]["Id"]} # get the first key of elements and pass it as url parameter
        # URL = 'http://%s:%u/api/get_element_list?op=d:\&qid=0' % (host, port)
        URL = f'http://{host}:{port}/api/get_element_list'
        r = requests.get(url = URL, params=PARAMS)
        af_db_data = r.json()
        print(af_db_data)

        # ---> The example below does not work like before: Example 1 - given an element - attributes names and data type of each attribute
        PARAMS = {'eid': list(af_db_data.keys())[8]} # get the first key of elements and pass it as url parameter
        # URL = 'http://%s:%u/api/get_sensors_in_element?op=d:\&qid=0' % (host, port)
        URL = f'http://{host}:{port}/api/get_sensors_in_element'
        r = requests.get(url = URL, params=PARAMS)
        af_db_attr = r.json()
        print(af_db_attr)

        # ---> The example ABOVE returned one attribute. It used to return many. The example 2 below used to work (now it fails).

        # Example 2 - given a sensor - the readings of the sensor
        PARAMS = {'time' : '*-1h', 'sid': list(af_db_attr.keys())[1]} # get the first key of elements and pass it as url parameter
        URL = f'http://{host}:{port}/api/get_sensor_data'
        r = requests.get(url = URL, params=PARAMS)
        af_sensor_reading = r.json()
        print(af_sensor_reading)
        # READING CURRENT TIME
        PARAMS = {'time' : '*', 'sid': list(af_db_attr.keys())[1]} # get the first key of elements and pass it as url parameter
        URL = f'http://{host}:{port}/api/get_sensor_data' % (host, port)
        r = requests.get(url = URL, params=PARAMS)
        af_sensor_reading = r.json()
        print(af_sensor_reading)
        PARAMS = {'stime' : '*-1h', 'etime' : '*', 'sid': list(af_db_attr.keys())[1]} # get the first key of elements and pass it as url parameter
        URL = f'http://{host}:{port}/api/get_sensor_data_range'
        r = requests.get(url = URL, params=PARAMS)
        af_sensor_reading = r.json()
        print(af_sensor_reading)
    except Exception as e:
        print(e)


test_pi("localhost", "7400")