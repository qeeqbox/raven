from mysql.connector import connect
from random import randint
from datetime import datetime
from multiprocessing import Process
from time import sleep
from http import HTTPStatus
from mimetypes import guess_type
from urllib.parse import urljoin, urlparse
from os import path, getcwd
from contextlib import suppress
from asyncio import sleep as asleep
from asyncio import run as arun
from asyncio import gather
from websockets import serve
from random import choice
from json import dumps
from sys import argv

IP = '0.0.0.0'
WEBSOCKET_PORT = 5678
HTTP_PORT = 8080
WEBSOCKETS = set()

def create_db():
	def random_ip():
		return ".".join(map(str, (randint(0, 255) for number in range(4))))
	conn = connect(host= "localhost",user= "change_me_user", password = "change_me_pass",autocommit=True)
	cursor = conn.cursor()
	cursor.execute("""DROP DATABASE IF EXISTS testdb""")
	cursor.execute("""CREATE DATABASE IF NOT EXISTS testdb""")
	cursor.execute("""USE testdb""")
	cursor.execute("""CREATE TABLE IF NOT EXISTS attacks (id INT(15) AUTO_INCREMENT PRIMARY KEY, src_ip VARCHAR(15) NOT NULL, src_port VARCHAR(15) NOT NULL, dest_ip VARCHAR(15) NOT NULL, dest_port VARCHAR(15), ts TIMESTAMP);""")
	while True:
		for _ in range(randint(1,3)):
			cursor.execute("""insert into attacks (src_ip,src_port,dest_ip,dest_port,ts) values(%s,%s,%s,%s, %s)""", (random_ip(),'21',random_ip(),'21',datetime.now(),))
		sleep(1)

def check_path(_path):
	with suppress(Exception):
		_path = path.relpath(_path, start=getcwd())
		_path = path.abspath(_path)
		if not any(detect in _path for detect in ['\\..','/..','..']):
			if _path.startswith(getcwd()):
				if path.isfile(_path):
					return True
	return False

async def http_task(path, headers):
	response_content = ''
	response_status = HTTPStatus.NOT_FOUND
	response_headers = [('Connection', 'close')]
	if 'User-Agent' in headers and 'Host' in headers:
		print("Host: {} User-Agent: {}".format(headers['Host'],headers['User-Agent']))
	if 'Accept' in headers:
		with suppress(Exception):
			if path == '/':
				path = getcwd()+'/index.html'
			else:
				path = getcwd()+urljoin(path, urlparse(path).path)
			if check_path(path):
				mime_type = guess_type(path)[0]
				if mime_type in ['text/html','application/javascript','text/css']:
					if mime_type in headers['Accept'] or '*/*' in headers['Accept']:
						response_content = open(path, 'rb').read() 			# <---- switch to aiofile 
						response_headers.append(('Content-Type', mime_type))
						response_headers.append(('Content-Length', str(len(response_content))))
						response_status = HTTPStatus.OK
					else:
						print("Mismatch {} type {} with {}".format(path,mime_type, headers['Accept']))
				else:
					print("File is not supported {} type {}".format(path,mime_type))
			else:
				print("File is not supported or does not exist {}".format(path))
	else:
		print("Needs [Accept] from server")
	return response_status, response_headers, response_content


async def websoket_task(websocket, path):
	WEBSOCKETS.add(websocket)
	timestamp = datetime.now()
	conn = connect(host= "localhost",user= "change_me_user", password = "change_me_pass",autocommit=True)
	cursor = conn.cursor()
	cursor.execute("""USE testdb""")
	while True:
		ret = []
		cursor.execute("""select * from attacks where ts >= %s""", (timestamp,))
		timestamp = datetime.now()
		result = cursor.fetchall()
		for item in result:
			parameters = {
			"function":"marker",
			  "object": {
				"from": "{}:{}".format(item[1],item[2]),
				"to": "{}:{}".format(item[3],item[4])
			  },
			  "color": {
				"line": {
				  "from": "#{:06x}".format(randint(255, 16777216)),
				  "to": "#{:06x}".format(randint(255, 16777216))
				}
			  },
			  "timeout": 1000,
			  "options": [
				"line",
				"single-output",
				"multi-output"
			  ]
			}
			ret.append(parameters)
		if len(ret) > 0:
			await gather(*[ws.send(dumps(ret)) for ws in WEBSOCKETS],return_exceptions=False)
		await asleep(randint(1,2))
	WEBSOCKETS.remove(websocket)

async def main():
	await serve(websoket_task, IP, WEBSOCKET_PORT)
	await serve(lambda x: None, IP, HTTP_PORT, process_request=http_task)
	try:
		while True:
			await asleep(0.1)
	except KeyboardInterrupt:
		exit()

p1 = Process(target = create_db)
p1.start()
arun(main())