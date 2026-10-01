# 4개 블로그 표준 포스팅 템플릿 가이드라인 (2026 고도화 규격)

본 문서는 **구글 애드센스 고가치 콘텐츠 심사 통과**와 **독자 체류 시간(Dwell Time) 극대화**를 위해 설계된 4개 블로그 공통 포스팅 템플릿 표준입니다.

---

## 📌 필수 포함 5대 구성 요소

1. **💡 핵심 요약 카드 (Executive Summary Card)**
   - 위치: 도입부 첫 단락 바로 다음
   - 역할: 바쁜 현대인을 위해 30초 내에 핵심 결론 3가지와 대상 독자, 완독 시간, 실무 팁을 요약 전달
2. **📊 데이터 비교 분석표 (Comparison Table)**
   - 위치: 본문 제1장~제2장 사이
   - 역할: 텍스트 나열을 방지하고 행정/금융/비용 수치를 정밀 대조하여 신뢰도(E-E-A-T) 부여
3. **⚡ 계산기 & 자가진단 인터랙션 연동 콜아웃**
   - 위치: 본문 중간
   - 역할: 해당 블로그의 계산기 도구(DSR 계산기, 웨딩 예산 계산기, 유튜브 수익 계산기, 연봉 실수령액 계산기)로 트래픽을 유도하여 이탈률 감소
4. **📋 실행 전 필수 점검 체크리스트 블록 (Checklist Block)**
   - 위치: 본문 결론부 또는 FAQ 섹션 바로 앞
   - 역할: 독자가 실제 행동(계약, 신청, 업로드, 지출)에 옮기기 전 점검해야 할 5대 항목을 체크박스 UI로 제공
5. **❓ 자주 묻는 질문 (FAQ 3선)**
   - 위치: 본문 최하단
   - 역할: 구글 검색엔진 FAQ 스키마 및 AI 개요(AEO/GEO) 스니펫 직접 노출 유도

---

## 🛠️ HTML 표준 템플릿 코드

### 1. 핵심 요약 카드 코드
```html
<div class="summary-card my-6 p-5 sm:p-6 bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 border-2 border-blue-200/80 rounded-2xl shadow-xs space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-200/60">
    <div class="flex items-center gap-2">
      <span class="px-3 py-1 bg-blue-700 text-white rounded-full text-xs font-bold tracking-wide">💡 30초 핵심 요약 카드</span>
      <span class="text-xs text-slate-500 font-medium">🎯 대상: <strong class="text-slate-700">[타깃 독자층]</strong></span>
    </div>
    <span class="text-xs font-mono font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600">⏱️ [완독 소요시간]</span>
  </div>
  <ul class="space-y-2.5 my-2 list-none p-0">
    <li class="flex items-start gap-2.5"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">✓</span><span class="text-slate-800 font-medium text-sm sm:text-base"><strong>[핵심 포인트 1]:</strong> [상세 설명]</span></li>
    <li class="flex items-start gap-2.5"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">✓</span><span class="text-slate-800 font-medium text-sm sm:text-base"><strong>[핵심 포인트 2]:</strong> [상세 설명]</span></li>
    <li class="flex items-start gap-2.5"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">✓</span><span class="text-slate-800 font-medium text-sm sm:text-base"><strong>[핵심 포인트 3]:</strong> [상세 설명]</span></li>
  </ul>
  <div class="pt-3 border-t border-blue-200/60 flex items-start gap-2 text-xs sm:text-sm text-blue-900 bg-blue-100/50 p-3 rounded-xl">
    <span class="font-bold shrink-0 text-blue-700">✨ 실무 팁:</span>
    <span class="leading-relaxed">[실무 핵심 조언 한 줄]</span>
  </div>
</div>
```

### 2. 체크리스트 요약 블록 코드
```html
<div class="checklist-block my-8 p-5 sm:p-6 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-2 border-emerald-300 rounded-2xl shadow-xs space-y-4">
  <div class="flex items-center justify-between pb-3 border-b border-emerald-200">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <span class="p-1.5 bg-emerald-600 text-white rounded-lg inline-flex items-center justify-center text-xs">✓</span>
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 m-0 tracking-tight">📋 [체크리스트 제목]</h3>
      </div>
      <p class="text-xs text-slate-500 m-0">[안내 문구]</p>
    </div>
    <span class="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full shrink-0">총 5개 항목</span>
  </div>
  <ul class="space-y-2.5 my-3 list-none p-0">
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3">
      <input type="checkbox" id="chk-1" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" />
      <label for="chk-1" class="cursor-pointer flex-1">
        <div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">1. [점검 항목 1]</span><span class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">필수</span></div>
        <p class="text-xs text-slate-600 m-0">[항목 설명]</p>
      </label>
    </li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3">
      <input type="checkbox" id="chk-2" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" />
      <label for="chk-2" class="cursor-pointer flex-1">
        <div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">2. [점검 항목 2]</span><span class="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">필수</span></div>
        <p class="text-xs text-slate-600 m-0">[항목 설명]</p>
      </label>
    </li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3">
      <input type="checkbox" id="chk-3" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" />
      <label for="chk-3" class="cursor-pointer flex-1">
        <div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">3. [점검 항목 3]</span><span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">추천</span></div>
        <p class="text-xs text-slate-600 m-0">[항목 설명]</p>
      </label>
    </li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3">
      <input type="checkbox" id="chk-4" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" />
      <label for="chk-4" class="cursor-pointer flex-1">
        <div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">4. [점검 항목 4]</span></div>
        <p class="text-xs text-slate-600 m-0">[항목 설명]</p>
      </label>
    </li>
    <li class="checklist-item p-3.5 bg-white rounded-xl border border-emerald-200/80 flex items-start gap-3">
      <input type="checkbox" id="chk-5" class="w-4 h-4 text-emerald-600 mt-1 cursor-pointer" />
      <label for="chk-5" class="cursor-pointer flex-1">
        <div class="flex items-center gap-2 mb-0.5"><span class="font-bold text-sm text-slate-900">5. [점검 항목 5]</span></div>
        <p class="text-xs text-slate-600 m-0">[항목 설명]</p>
      </label>
    </li>
  </ul>
  <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
    <span class="font-bold shrink-0 text-amber-700">⚠️ 사전 주의:</span>
    <span class="leading-relaxed">[중대 주의사항]</span>
  </div>
</div>
```

---

## 4개 사이트별 특화 매핑 기준

| 사이트 도메인 | 브랜드명 | 주력 연동 계산기 | 체크리스트 중점 테마 |
| :--- | :--- | :--- | :--- |
| **`zip9.kr`** | 하우징허브 | DSR/LTV 한도 계산기, 취득세 계산기 | 대출 자격 요건, 등기부등본 권리 분석, 안전 특약 |
| **`nutube.kr`** | 뉴튜브 | 유튜브 수익 및 RPM 계산기 | 미드롤 수동 배치, 저작권 검사, 숏폼-롱폼 연동 퍼널 |
| **`virginroad.kr`** | 버진로드 | 웨딩 예산 분배 & 추가금 방어 계산기 | 스드메 추가금 계약서 서면 확약, 위약금 면책 특약 |
| **`www.life-calc.kr`** | 라이프캘크 | 연봉 실수령액 계산기, 72의 법칙 복리 계산기 | 비과세 식대, 연말정산 공제율, ISA 및 절세 계좌 |
