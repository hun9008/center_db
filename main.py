from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import csv
import urllib.parse

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FOLDER = 'data'

@app.get('/files')
async def list_files():
    try:
        files = [f for f in os.listdir(DATA_FOLDER) if f.endswith('.csv')]
        return JSONResponse(content=files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/files/{filename:path}')
async def get_file(filename: str):
    try:
        # 파일명 URL 디코딩
        decoded_filename = urllib.parse.unquote(filename)
        
        if not decoded_filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        filepath = os.path.join(DATA_FOLDER, decoded_filename)
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="File not found")

        # UTF-8로 파일 읽기 시도
        try:
            with open(filepath, newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                data = list(reader)
        except UnicodeDecodeError:
            # UTF-8 실패 시 EUC-KR로 파일 읽기 시도
            with open(filepath, newline='', encoding='euc-kr') as csvfile:
                reader = csv.reader(csvfile)
                data = list(reader)
                
        return JSONResponse(content=data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))