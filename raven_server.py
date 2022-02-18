from os import path
from random import randint
from websockets import client, serve
from aioredis import from_url
from contextlib import suppress
from tornado import websocket, web, ioloop, gen
from json import dumps

class WebSocketHandler(websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True

	def on_close(self):
		self.running = False

	async def open(self):
		print(str(self.request))
		self.running = True
		pub_redis = await from_url('redis://localhost:6379')
		pubsub = pub_redis.pubsub()
		await pubsub.subscribe("alerts")
		with suppress(Exception):
			while True and self.running:
				message = await pubsub.get_message(ignore_subscribe_messages=True)
				if message is not None:
					if message["data"] == b"STOP":
						break
					await self.write_message(message['data'])
				await gen.sleep(0.1)
		await pubsub.unsubscribe("alerts")
		await pub_redis.close()

	def on_message(self,message):
		pass

application = web.Application([(r'/websocket', WebSocketHandler),(r'/(.*)', web.StaticFileHandler, {'path': path.dirname(__file__)})])
application.listen(4751)
ioloop.IOLoop.instance().start()
