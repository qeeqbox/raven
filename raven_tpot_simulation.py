#!/usr/bin/python
# -*- coding: utf-8 -*-

from elasticsearch import Elasticsearch
from datetime import datetime
from functools import reduce
from contextlib import suppress
from random import randint
from json import dumps
from time import sleep
from random import choice
from redis import Redis
from requests import get

random_coordinate = [['32.69464', '35.39252'], ['50.77835', '10.89969'], ['47.4179', '30.99232'], ['27.42839', '85.03219'], ['51.27092', '9.97483'], ['44.67964', '7.97544'], ['53.95815', '9.90297'], ['51.29993', '13.38555'], ['50.22574', '3.40362'], ['51.09592', '22.96323'], ['31.1304', '97.17982'], ['-31.74261', '115.80633'], ['50.19904', '9.95882'], ['46.47572', '24.89855'], ['-6.53333', '110.7'], ['47.09836', '26.31111'], ['47.38713', '8.66657'], ['48.89281', '2.13308'], ['49.89856', '18.0954'], ['40.24035', '-79.57671'], ['57.41288', '-6.19418'], ['47.30298', '8.59743'], ['-34.92976', '138.65862'], ['18.27827', '-93.12872'], ['46.63528', '30.24121']]

def dummy_ip():
    return (".".join("{}".format(choice([i for i in range(0,255) if i not in [10,127,172,192]])) for x in range(4)))

def get_nested_item(_dict, item, defualt=None):
    def get_item(_dict, name):
        with suppress(Exception):
            return _dict[name]
        return defualt
    return reduce(get_item, item.split('.'), _dict)

ES = Elasticsearch('0.0.0.0:64298')
RE = Redis(host='0.0.0.0', port=6379)
current_time = datetime.utcnow().isoformat()

while True:
    query = {'range': {'@timestamp': {'gt': current_time}}}
    res = ES.search(index='logstash-*', size=100, query=query)

    for _ in range(randint(1,5)):
        get("http://0.0.0.0/")

    for hit in res['hits']['hits']:
        print(hit)
        to_ = ['12.796803','-85.554174']
        from_ = [None,None]
        dest_port = get_nested_item(hit, '_source.dest_port')
        _type = get_nested_item(hit, '_source.type')
        if _type == "Log4pot":
            if None in from_:
                from_ = choice(random_coordinate)
            RE.publish('alerts',dumps([{
                    'function': 'table',
                    'method': 'coordinates',
                    'object': {'from': from_, 
                                'to': to_},
                    'color': {'line': { 'from': '#{:06x}'.format(randint(255,16777216)), 
                                        'to': '#{:06x}'.format(randint(255,16777216))}},
                    'timeout': 1000,
                    'options': ['line', 'multi-output','country-by-coordinate'],
                    'custom': {'from': {'src ip': dummy_ip(),
                               'src port': randint(10000,50000)}, 
                               'to': {'dest ip': dummy_ip(),
                               'dest port': dest_port}},
                        }]))
        current_time = get_nested_item(hit,'_source.@timestamp',datetime.utcnow().isoformat())
    sleep(2)
