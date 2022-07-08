#!/usr/bin/env python

"""
//  -------------------------------------------------------------
//  author        Giga
//  project       qeeqbox/raven
//  email         gigaqeeq@gmail.com
//  description   asyncio, websockets and http
//  licensee      AGPL-3.0
//  -------------------------------------------------------------
//  contributors list qeeqbox/raven/graphs/contributors
//  ----
"""


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
from random import randint, uniform

IP = '0.0.0.0'
WEBSOCKET_PORT = 5678
HTTP_PORT = 8080
WEBSOCKETS = set()

def dummy_ip():
    return (".".join("{}".format(choice([i for i in range(0,255) if i not in [10,127,172,192]])) for x in range(4)))

def dummy_request(loop, function=""):
    ret = []
    for index in range(loop):
        parameters = {
    "function":function,
      "object": {
        "from": "{},{}".format(uniform(-90, 90), uniform(-180,180)),
        "to": "{},{}".format(uniform(-90, 90), uniform(-180,180))
      },
      "color": {
        "line": {
          "from": "#{:06x}".format(randint(255, 16777216)),
          "to": "#{:06x}".format(randint(255, 16777216))
        }
      },
      "timeout": 2000,
      "options": [
        "line",
        "multi-output",
        "country-by-coordinate"
      ]
    }

        ret.append(parameters)
    return dumps(ret)

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
    try:
        while True:
            data_to_send = None
            try:
                if argv[1] == "table":
                    data_to_send = dummy_request(randint(100,100), "table")
            except:
                pass
            if not data_to_send:
                data_to_send = dummy_request(randint(100,100), "marker")
            await gather(*[ws.send(data_to_send) for ws in WEBSOCKETS],return_exceptions=False)
            await asleep(randint(4,4))
    except Exception as e:
        pass
    finally:
        WEBSOCKETS.remove(websocket)

async def main():
    await serve(websoket_task, IP, WEBSOCKET_PORT)
    await serve(lambda x: None, IP, HTTP_PORT, process_request=http_task)
    try:
        while True:
            await asleep(0.2)
    except KeyboardInterrupt:
        exit()

arun(main())
