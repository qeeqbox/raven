FROM python:3.7
WORKDIR /usr/app/src
COPY . ./
RUN pip3 install websockets asyncio
CMD ["sh","-c","echo http://localhost:8080/simulation.html && python simulation.py"]