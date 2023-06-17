from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import  BaseModel
from sqlalchemy.ext.declarative import declarative_base
from os.path import exists
from typing import Optional

import pandas as pd
import random
import datetime
import json
import httpx

app = FastAPI()

data_path = "/data/temperature.csv" 
control_path = "/data/command.csv" 

class ControlMsg(BaseModel):
    ip: str
    override_pid: bool 
    target_temperature: float 
    is_activated : bool
    k_p: float
    t_i: float
    t_d: float

class Log(BaseModel):
    temperature: float
    target_temperature: float 
    duty_cycle: float
    is_heating: bool 
    pd_gain: float
    pp_gain: float
    pi_gain: float
    pd_gain_scaled: float
    pp_gain_scaled: float
    pi_gain_scaled: float
    pid_gain: float

    timestamp: Optional[datetime.date]

@app.get("/")
async def home():
    return FileResponse("app/ui/index.html")

@app.get("/log")
async def log_get():

    if not exists(data_path):
        return {} 
    else:
        df = pd.read_csv(data_path)

        df["is_activated"] = df["is_activated"].astype(int)
        df["is_heating"] = df["is_heating"].astype(int)

        return df.to_dict(orient="list")

@app.post("/log")
async def log_post(log : Log):
    log.timestamp = datetime.datetime.now()

    df =  pd.DataFrame([dict(log)])

    if exists(data_path):
        df =  pd.concat([pd.read_csv(data_path), df],ignore_index=True, join="inner")

    df.to_csv(data_path)

    return returnCommand()


@app.post("/control")
async def control(controlMsg: ControlMsg):
    with open(control_path, 'w') as f:
        json.dump(dict(controlMsg), f)
    return controlMsg 

@app.get("/control")
async def control():
    return returnCommand()

def returnCommand():
    if exists(control_path):
        with open(control_path, 'r') as f:
            return json.load(f)
    else:
        return {}
