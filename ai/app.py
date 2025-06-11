from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json
import os
import re
import traceback
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# OpenAI API 키 설정
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY 환경 변수가 필요합니다.")

# 브랜드 목록 정의
BRAND_LIST = [
    "배달의민족", "메가MGC커피", "스타벅스", "파리바게뜨", "교촌치킨", "CU", "컴포즈커피", "BBQ", 
    "도미노피자", "이디야커피", "맥도날드", "BHC치킨", "투썸플레이스", "GS25", "맘스터치", "버거킹", 
    "네이버페이포인트", "굽네치킨", "올리브영", "PAYCO", "배스킨라빈스", "다이소", "빽다방", "현대백화점", 
    "네네치킨", "이마트", "신세계백화점", "SSG상품권", "할리스", "4사통합권", "폴바셋", "매머드익스프레스", 
    "세븐일레븐", "던킨도너츠", "이마트24", "SK모바일주유권", "더벤티", "파스쿠찌", "뚜레쥬르", "예스24", 
    "아웃백스테이크하우스", "정관장", "이삭토스트", "티빙", "SK스피드메이트", "파파존스", "피자알볼로", 
    "자담치킨", "해피콘", "카카오페이", "본아이에프", "웨이브", "요거트아이스크림의정석", "genie", 
    "노보텔 앰배서더 서울 동대문", "아바니센트럴부산호텔", "매머드커피", "알로하포케", "원할머니보쌈족발", 
    "공차", "당신의집사", "컬리페이", "국수나무", "읍천리382", "훌랄라참숯치킨", "딘타이펑", "와플대학", 
    "쥬씨", "죽이야기", "노랑통닭", "롯데시네마", "지호한방삼계탕", "스팀", "고피자", "달콤왕가탕후루", 
    "미스터힐링", "HS홈케어", "밀리의서재", "피자나라치킨공주", "큐브이스케이프", "왓챠", "홍콩반점", 
    "우지커피", "치킨갱스터", "김캐디", "Google Play 기프트 코드", "노티드", "샐러디", "인생네컷", 
    "태리로제떡볶이＆닭강정", "국민관광상품권", "생활맥주", "달토끼의떡볶이흡입구역", "명랑시대", 
    "후쿠오카함바그", "장충동왕족발", "빌리엔젤", "오늘와인한잔", "빵꾸똥꾸문구야", "CJ기프트카드", 
    "스마일캐시", "푸라닭", "삼첩분식", "써브웨이", "본도시락", "홍루이젠", "더본코리아", "교보문고", 
    "커피빈", "피자마루", "유가네", "빨간모자피자", "카페베네", "죠스떡볶이", "빚은", "잠바주스", 
    "또래오래", "미스터피자", "파리크라상"
]

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 입력 모델 정의
class OcrRequest(BaseModel):
    ocrResult: str
    gifticonType: str  # "PRODUCT" 또는 "AMOUNT"

# 응답 모델 정의
class GifticonInfo(BaseModel):
    gifticonBarcodeNumber: Optional[str] = None
    brandName: Optional[str] = None
    gifticonName: Optional[str] = None
    gifticonExpiryDate: Optional[str] = None
    gifticonOriginalAmount: Optional[int] = None

@app.post("/api/extract-gifticon", response_model=GifticonInfo)
async def extract_gifticon_info(request: OcrRequest = Body(...)):
    """
    OCR 결과에서 기프티콘 정보를 추출합니다.
    """
    try:
        print(f"기프티콘 정보 추출 요청 받음: gifticonType={request.gifticonType}")
        
        # OCR 결과 검증
        if not request.ocrResult or len(request.ocrResult.strip()) == 0:
            print("OCR 결과가 비어있거나 널입니다.")
            return GifticonInfo()
            
        # OCR 결과 일부 출력 (로깅)
        print(f"OCR 결과 일부: {request.ocrResult[:200]}...")
        
        # 직접 OCR 결과에서 바코드 추출 시도
        barcode = extract_barcode_from_ocr(request.ocrResult)
        if barcode:
            print(f"OCR 결과에서 직접 추출한 바코드: {barcode}")
        
        # GPT 모델 초기화
        llm = ChatOpenAI(temperature=0, model_name="gpt-4.1-mini", api_key=api_key)
        
        # 브랜드 목록 중 일부만 프롬프트에 포함 (너무 길어지지 않도록)
        brand_prompt = ", ".join(BRAND_LIST[:50])
        
        template = f"""
        다음은 기프티콘 이미지에서 OCR로 추출한 JSON 결과입니다:
        {{ocr_result}}

        이 OCR 결과에서 다음 정보를 신중하게 추출해 주세요:

        1. 바코드 번호 (gifticonBarcodeNumber): 
        - 일반적으로 12~16자리 숫자로 이루어져 있습니다
        - 하이픈('-')이나 공백으로 구분되어 있을 수 있으니 모든 구분자를 제거해주세요
        - "fields" 배열에서 "inferText"가 숫자와 하이픈으로만 이루어진 항목을 특히 주의깊게 찾아보세요
        - 예시: "8558-0755-7238" → "855807557238"
        - 바코드는 주로 기프티콘 하단부에 위치합니다

        2. 브랜드 이름 (brandName): 
        - 다음 브랜드 목록 중 하나여야 합니다: {brand_prompt} 등
        - 주로 "교환처:" 또는 비슷한 레이블 근처에 위치합니다
        - "inferText" 값이 브랜드 목록 중 하나와 일치하는지 확인하세요

        3. 상품명 (gifticonName): 
        - 기프티콘 상품 이름
        - 일반적으로 "상품명:" 레이블 근처에 위치합니다
        - 또는, 브랜드 근처에 위치합니다.
        - 브랜드명과 다른 항목이어야 합니다.

        4. 유효기간 (gifticonExpiryDate): 
        - 다양한 날짜 형식(YY/MM/DD, YYYY-MM-DD 등)으로 표시될 수 있으며, YYYY-MM-DD 형식으로 변환해주세요
        - 유효기간이 "YY.MM.DD~YY.MM.DD" 형식처럼 시작일과 종료일로 표시된 경우, 종료일(~뒤의 날짜)만 추출해서 YYYY-MM-DD 형식으로 변환해주세요
        - "유효기간" 레이블 근처에서 찾아보세요
        - 예시: "25/04/25" → "2025-04-25"
        - 예시: "24.07.16~24.08.15" → "2024-08-15" (종료일 사용)

        5. 금액 (gifticonOriginalAmount): 
        - 기프티콘 타입이 'AMOUNT'일 때만 숫자만 추출
        - 예시: "10,000원" → 10000

        기프티콘 타입: {{gifticon_type}} (PRODUCT 또는 AMOUNT)

        특히 바코드 번호는 반드시 찾아야 합니다. "inferText"가 숫자와 하이픈으로만 구성된 항목이나 
        연속된 숫자 문자열을 찾아서 바코드 번호로 추출해주세요.

        정보를 찾지 못한 경우 해당 필드를 null로 처리하세요.

        다른 설명, 추가 텍스트, 코드 블록, 마크다운 형식 없이 순수 JSON 형식으로만 정확히 응답해주세요:
        {{{{
            "gifticonBarcodeNumber": "추출된 바코드 번호 또는 null",
            "brandName": "추출된 브랜드 이름 또는 null",
            "gifticonName": "추출된 상품명 또는 null",
            "gifticonExpiryDate": "YYYY-MM-DD 형식의 유효기간(종료일) 또는 null",
            "gifticonOriginalAmount": 금액(숫자만, {{gifticon_type}}이 AMOUNT일 때만) 또는 null
        }}}}
        """
        
        # 프롬프트 생성
        prompt = PromptTemplate(
            template=template,
            input_variables=["ocr_result", "gifticon_type"]
        )
        
        # LLM 체인 생성 및 실행
        chain = LLMChain(llm=llm, prompt=prompt)
        result = chain.invoke({
            "ocr_result": request.ocrResult,
            "gifticon_type": request.gifticonType
        })
        
        # 응답에서 JSON 추출 및 파싱
        output_text = result["text"].strip()
        print(f"LLM 원본 응답: {output_text}")
        
        # 마크다운 코드 블록 마커 제거
        output_text = re.sub(r'```json|```', '', output_text).strip()
        print(f"마크다운 마커 제거 후: {output_text}")

        try:
            # JSON 파싱 시도
            gifticon_data = json.loads(output_text)
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 오류: {e}")
            
            # JSON을 찾기 위한 정규식 시도
            json_pattern = r'({.*?})'
            match = re.search(json_pattern, output_text, re.DOTALL)
            if match:
                try:
                    json_text = match.group(1)
                    print(f"정규식으로 추출한 JSON: {json_text}")
                    gifticon_data = json.loads(json_text)
                except Exception as regex_error:
                    print(f"정규식으로 추출한 JSON 파싱 오류: {regex_error}")
                    # 기본값 생성
                    gifticon_data = create_default_response()
            else:
                print("JSON 패턴을 찾을 수 없습니다.")
                gifticon_data = create_default_response()
        
        # 추출된 데이터 후처리
        gifticon_data = post_process_gifticon_data(gifticon_data, request.ocrResult, request.gifticonType, barcode)
        
        # 필수 필드 확인 및 수정
        ensure_required_fields(gifticon_data)
            
        print(f"기프티콘 정보 추출 완료: {gifticon_data}")
        return gifticon_data
        
    except Exception as e:
        print(f"기프티콘 정보 추출 중 오류 발생: {str(e)}")
        traceback.print_exc()  # 상세 스택 트레이스 출력
        # 오류 발생 시 기본 응답
        return create_default_response()

def extract_barcode_from_ocr(ocr_result: str) -> str:
    """OCR 결과에서 바코드 패턴을 직접 찾아 추출합니다."""
    try:
        # JSON 파싱
        data = json.loads(ocr_result)
        
        # 필드 배열에서 바코드 패턴을 찾음
        if "images" in data and len(data["images"]) > 0:
            for image in data["images"]:
                if "fields" in image:
                    for field in image["fields"]:
                        if "inferText" in field:
                            text = field["inferText"]
                            # 바코드 패턴 체크 (숫자와 하이픈으로만 구성)
                            if re.match(r'^[\d\-]+$', text) and len(re.sub(r'\D', '', text)) >= 10:
                                return re.sub(r'\D', '', text)
    except:
        pass
    
    # 정규식으로 전체 텍스트에서 바코드 패턴 찾기
    barcode_pattern = r'(\d{3,4}[-\s]?\d{3,4}[-\s]?\d{3,4})'
    matches = re.findall(barcode_pattern, ocr_result)
    if matches:
        longest_match = max(matches, key=len)
        return re.sub(r'[-\s]', '', longest_match)
    
    return None

def normalize_expiry_date(date_str: str) -> str:
    """다양한 형식의 날짜 문자열을 YYYY-MM-DD 형식으로 정규화합니다."""
    if not date_str:
        return None
        
    # 시작일~종료일 형식이면 종료일만 추출
    if '~' in date_str:
        date_str = date_str.split('~')[-1].strip()
    
    # 연도 변환 (YY -> 20YY)
    date_formats = [
        # YY.MM.DD
        (r'(\d{2})\.(\d{1,2})\.(\d{1,2})', '20\\1-\\2-\\3'),
        # YY/MM/DD
        (r'(\d{2})/(\d{1,2})/(\d{1,2})', '20\\1-\\2-\\3'),
        # YY-MM-DD
        (r'(\d{2})-(\d{1,2})-(\d{1,2})', '20\\1-\\2-\\3'),
        # YYYY.MM.DD
        (r'(\d{4})\.(\d{1,2})\.(\d{1,2})', '\\1-\\2-\\3'),
        # YYYY/MM/DD
        (r'(\d{4})/(\d{1,2})/(\d{1,2})', '\\1-\\2-\\3')
    ]
    
    for pattern, replacement in date_formats:
        if re.match(pattern, date_str):
            date_str = re.sub(pattern, replacement, date_str)
            break
    
    # 날짜 구성요소 패딩 (M -> 01, D -> 01)
    parts = date_str.split('-')
    if len(parts) == 3:
        year, month, day = parts
        if len(month) == 1:
            month = '0' + month
        if len(day) == 1:
            day = '0' + day
        date_str = f"{year}-{month}-{day}"
    
    return date_str

def post_process_gifticon_data(data: Dict[str, Any], ocr_result: str, gifticon_type: str, extracted_barcode: str = None) -> Dict[str, Any]:
    """OCR 결과를 후처리하여 정확도를 높입니다."""
    
    # 브랜드 후처리 - 가장 유사한 브랜드 찾기
    if data.get("brandName"):
        best_match = None
        highest_similarity = 0
        brand_name = data["brandName"].lower()
        
        for brand in BRAND_LIST:
            # 정확히 일치하면 바로 사용
            if brand.lower() == brand_name:
                best_match = brand
                break
                
            # 포함 관계 확인
            if brand.lower() in brand_name or brand_name in brand.lower():
                similarity = len(brand) / max(len(brand), len(brand_name))
                if similarity > highest_similarity:
                    highest_similarity = similarity
                    best_match = brand
        
        # 유사도가 0.5 이상인 경우만 대체
        if best_match and (best_match.lower() == brand_name or highest_similarity >= 0.5):
            data["brandName"] = best_match
            
    # 유효기간 정규화
    if data.get("gifticonExpiryDate"):
        data["gifticonExpiryDate"] = normalize_expiry_date(data["gifticonExpiryDate"])
    
    # 바코드 번호 정규화 - 하이픈 제거
    if data.get("gifticonBarcodeNumber"):
        data["gifticonBarcodeNumber"] = re.sub(r'[^0-9]', '', data["gifticonBarcodeNumber"])
    
    # 바코드 직접 추출 백업
    if not data.get("gifticonBarcodeNumber") and extracted_barcode:
        data["gifticonBarcodeNumber"] = extracted_barcode
    
    # 금액 처리
    if gifticon_type != "AMOUNT":
        data["gifticonOriginalAmount"] = None
    elif data.get("gifticonOriginalAmount") and isinstance(data["gifticonOriginalAmount"], str):
        # 문자열인 경우 숫자만 추출
        data["gifticonOriginalAmount"] = int(re.sub(r'[^0-9]', '', data["gifticonOriginalAmount"]))
    
    return data

def create_default_response():
    """기본 응답 생성"""
    return {
        "gifticonBarcodeNumber": None,
        "brandName": None,
        "gifticonName": None,
        "gifticonExpiryDate": None,
        "gifticonOriginalAmount": None
    }

def ensure_required_fields(data):
    """필수 필드가 모두 있는지 확인하고 없으면 추가"""
    required_fields = [
        "gifticonBarcodeNumber", 
        "brandName", 
        "gifticonName", 
        "gifticonExpiryDate", 
        "gifticonOriginalAmount"
    ]
    
    for field in required_fields:
        if field not in data:
            data[field] = None

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
